// ================= AWS SDK v3 =================
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  QueryCommand,
  UpdateCommand,
  TransactWriteCommand,
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// ================= CONFIG =================
const COURIER_TABLE = "Courier-n4tb6ywvhnf3zesv5ibhpitqiq-staging";
const ORDER_TABLE = "Order-n4tb6ywvhnf3zesv5ibhpitqiq-staging";

// ================= HANDLER =================
exports.handler = async () => {
  const now = new Date().toISOString();

  console.log("Checking expired assignments...");

  const orders = await getExpiredOrders(now);

  for (let order of orders) {
    console.log("Reassigning order:", order.id);
    await processExpiredOrder(order);
  }
};

// ================= GET EXPIRED ORDERS =================
async function getExpiredOrders(now) {
  let items = [];
  let lastKey;

  do {
    const res = await docClient.send(
      new QueryCommand({
        TableName: ORDER_TABLE,
        IndexName: "byAssignmentStatus",
        KeyConditionExpression:
          "assignmentStatus = :pending AND assignmentExpiresAt <= :now",
        ExpressionAttributeValues: {
          ":pending": "PENDING",
          ":now": now,
        },
        ExclusiveStartKey: lastKey,
      }),
    );

    items.push(...(res.Items || []));
    lastKey = res.LastEvaluatedKey;
  } while (lastKey);

  return items;
}

// ================= PROCESS EXPIRED =================
async function processExpiredOrder(order) {
  let rejected = [...(order.rejectedCourierIds || [])];

  // Add previous courier
  if (order.assignedCourierId && !rejected.includes(order.assignedCourierId)) {
    rejected.push(order.assignedCourierId);
  }

  if (rejected.length > 50) rejected.shift();

  // 🔥 1️⃣ Reduce courier capacity (VERY IMPORTANT)
  if (order.assignedCourierId) {
    const isExpress = order.transportationType?.includes("EXPRESS");

    await docClient.send(
      new UpdateCommand({
        TableName: COURIER_TABLE,
        Key: { id: order.assignedCourierId },
        UpdateExpression: isExpress
          ? "SET currentExpressCount = currentExpressCount - :one"
          : "SET currentBatchCount = currentBatchCount - :one",
        ConditionExpression: isExpress
          ? "currentExpressCount > :zero"
          : "currentBatchCount > :zero",
        ExpressionAttributeValues: {
          ":one": 1,
          ":zero": 0,
        },
      }),
    );
  }

  // 🔥 2️⃣ Expire assignment
  await docClient.send(
    new UpdateCommand({
      TableName: ORDER_TABLE,
      Key: { id: order.id },
      UpdateExpression: `
        SET assignmentStatus = :expired,
            assignedCourierId = :null,
            rejectedCourierIds = :r,
            assignmentAttempts = if_not_exists(assignmentAttempts, :z) + :inc
      `,
      ExpressionAttributeValues: {
        ":expired": "EXPIRED",
        ":null": null,
        ":r": rejected,
        ":z": 0,
        ":inc": 1,
      },
    }),
  );

  // 🔥 3️⃣ Reassign
  await assignNextCourier({
    ...order,
    rejectedCourierIds: rejected,
  });
}

// ================= ASSIGN NEXT =================
async function assignNextCourier(order) {
  const couriers = await getAvailableCouriers();

  if (!couriers.length) return;

  let rejected = [...(order.rejectedCourierIds || [])];

  // Reset rejected list if exhausted
  if (rejected.length >= couriers.length) {
    rejected = [];

    await docClient.send(
      new UpdateCommand({
        TableName: ORDER_TABLE,
        Key: { id: order.id },
        UpdateExpression: "SET rejectedCourierIds = :r",
        ExpressionAttributeValues: {
          ":r": rejected,
        },
      }),
    );
  }

  // Filter nearby
  const nearby = couriers.filter((c) => {
    if (!c.lat || !c.lng) return false;
    return getDistance(c.lat, c.lng, order.originLat, order.originLng) <= 5;
  });

  const candidates = nearby.length ? nearby : couriers;

  const sorted = candidates.sort(
    (a, b) =>
      getDistance(a.lat, a.lng, order.originLat, order.originLng) -
      getDistance(b.lat, b.lng, order.originLat, order.originLng),
  );

  for (let courier of sorted) {
    if (!canAccept(courier, order, rejected)) continue;

    const success = await assign(order, courier);

    if (success) return;
  }

  console.log("No available courier:", order.id);
}

// ================= GET COURIERS =================
async function getAvailableCouriers() {
  let items = [];
  let lastKey;

  do {
    const res = await docClient.send(
      new QueryCommand({
        TableName: COURIER_TABLE,
        IndexName: "byStatus",
        KeyConditionExpression: "statusKey = :s",
        ExpressionAttributeValues: {
          ":s": "ONLINE#APPROVED",
        },
        ExclusiveStartKey: lastKey,
      }),
    );

    items.push(...(res.Items || []));
    lastKey = res.LastEvaluatedKey;
  } while (lastKey);

  return items;
}

// ================= ACCEPT RULE =================
function canAccept(courier, order, rejected) {
  if (rejected.includes(courier.id)) return false;

  const total =
    (courier.currentBatchCount || 0) + (courier.currentExpressCount || 0);

  if (total >= 10) return false;

  if (order.transportationType?.includes("EXPRESS")) {
    if ((courier.currentExpressCount || 0) >= 1) return false;
  }

  return true;
}

// ================= ASSIGN =================
async function assign(order, courier) {
  const expires = new Date(Date.now() + 25000).toISOString();
  const now = new Date().toISOString();

  const isExpress = order.transportationType?.includes("EXPRESS");

  try {
    await docClient.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Update: {
              TableName: ORDER_TABLE,
              Key: { id: order.id },
              UpdateExpression: `
                SET assignedCourierId = :c,
                    assignmentStatus = :s,
                    assignmentExpiresAt = :e,
                    lastAssignedAt = :now
              `,
              ConditionExpression:
                "attribute_not_exists(assignedCourierId) OR assignmentStatus = :expired",
              ExpressionAttributeValues: {
                ":c": courier.id,
                ":s": "PENDING",
                ":e": expires,
                ":now": now,
                ":expired": "EXPIRED",
              },
            },
          },
          {
            Update: {
              TableName: COURIER_TABLE,
              Key: { id: courier.id },
              UpdateExpression: isExpress
                ? "SET currentExpressCount = if_not_exists(currentExpressCount, :z) + :inc"
                : "SET currentBatchCount = if_not_exists(currentBatchCount, :z) + :inc",
              ExpressionAttributeValues: {
                ":inc": 1,
                ":z": 0,
              },
            },
          },
        ],
      }),
    );

    console.log(`✅ Reassigned order ${order.id} → ${courier.id}`);

    return true;
  } catch (err) {
    if (err.name === "TransactionCanceledException") {
      console.log("Race condition, retry...");
      return false;
    }

    console.error("Assignment error:", err);
    throw err;
  }
}

// ================= DISTANCE =================
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}
