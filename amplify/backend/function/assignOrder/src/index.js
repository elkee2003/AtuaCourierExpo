// ================= AWS SDK v3 =================
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  QueryCommand,
  TransactWriteCommand,
} = require("@aws-sdk/lib-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");

// ================= CONFIG =================
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const COURIER_TABLE = "Courier-n4tb6ywvhnf3zesv5ibhpitqiq-staging";
const ORDER_TABLE = "Order-n4tb6ywvhnf3zesv5ibhpitqiq-staging";

// ================= HANDLER =================
exports.handler = async (event) => {
  for (const record of event.Records) {
    if (record.eventName !== "INSERT") continue;

    const order = unmarshall(record.dynamodb.NewImage);

    if (order.status !== "READY_FOR_PICKUP") continue;

    console.log("Assigning order:", order.id);

    await assignNextCourier(order);
  }
};

// ================= ASSIGN LOGIC =================
async function assignNextCourier(order) {
  const couriers = await getAvailableCouriers();

  if (!couriers.length) {
    console.log("No couriers available");
    return;
  }

  // ✅ Filter nearby (5km)
  const nearby = couriers.filter((c) => {
    if (!c.lat || !c.lng) return false;
    return getDistance(c.lat, c.lng, order.originLat, order.originLng) <= 5;
  });

  const candidates = nearby.length > 0 ? nearby : couriers;

  // ✅ Sort by distance
  const sorted = candidates.sort(
    (a, b) =>
      getDistance(a.lat, a.lng, order.originLat, order.originLng) -
      getDistance(b.lat, b.lng, order.originLat, order.originLng),
  );

  for (let courier of sorted) {
    if (!canAccept(courier, order)) continue;

    const success = await assign(order, courier);

    if (success) return;
  }

  console.log("No suitable courier found for order:", order.id);
}

// ================= GET COURIERS (GSI + PAGINATION) =================
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

// ================= ACCEPTANCE RULE =================
function canAccept(courier, order) {
  const total =
    (courier.currentBatchCount || 0) + (courier.currentExpressCount || 0);

  if (total >= 10) return false;

  if (order.transportationType?.includes("EXPRESS")) {
    if ((courier.currentExpressCount || 0) >= 1) return false;
  }

  return true;
}

// ================= ATOMIC ASSIGN =================
async function assign(order, courier) {
  const expires = new Date(Date.now() + 25000).toISOString();
  const now = new Date().toISOString();

  const isExpress = order.transportationType?.includes("EXPRESS");

  try {
    await docClient.send(
      new TransactWriteCommand({
        TransactItems: [
          // 1️⃣ Update Order
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

          // 2️⃣ Update Courier capacity
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

    console.log(`✅ Assigned order ${order.id} → courier ${courier.id}`);

    return true;
  } catch (err) {
    if (err.name === "TransactionCanceledException") {
      console.log(`⚠️ Assignment skipped (race condition): ${order.id}`);
      return false;
    }

    console.error("❌ Assignment error:", err);
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
