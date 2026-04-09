// ================= AWS SDK v3 =================
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  QueryCommand,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");

// ================= CONFIG =================
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const COURIER_TABLE = "Courier-n4tb6ywvhnf3zesv5ibhpitqiq-staging";
const ORDER_TABLE = "Order-n4tb6ywvhnf3zesv5ibhpitqiq-staging";

// ================= HANDLER =================
exports.handler = async () => {
  console.log("🚀 Running force dispatch...");

  const couriers = await getOnlineCouriers();

  for (const courier of couriers) {
    await checkForceDispatch(courier);
  }
};

// ================= GET COURIERS (GSI) =================
async function getOnlineCouriers() {
  let items = [];
  let lastKey;

  do {
    const res = await docClient.send(
      new QueryCommand({
        TableName: COURIER_TABLE,
        IndexName: "byStatus", // ✅ uses your GSI
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

// ================= FORCE LOGIC =================
async function checkForceDispatch(courier) {
  // 🚫 Skip MAXI completely
  if (courier.transportationType === "MAXI") return;

  const MAX_CAPACITY = 10;
  const BATCH_TIMEOUT = 3 * 60 * 60 * 1000; // 3 hours

  const total =
    (courier.currentBatchCount || 0) + (courier.currentExpressCount || 0);

  const lastBatchTime = new Date(courier.lastBatchAssignedAt || 0);
  const now = new Date();

  const noNewOrders = now - lastBatchTime > BATCH_TIMEOUT;

  if (total >= MAX_CAPACITY || noNewOrders) {
    console.log("⚡ Force dispatch triggered:", courier.id);

    await triggerDeliveryStart(courier.id);
  }
}

// ================= START DELIVERY =================
async function triggerDeliveryStart(courierId) {
  const orders = await getCourierActiveOrders(courierId);

  if (!orders.length) {
    console.log("No orders to dispatch for courier:", courierId);
    return;
  }

  // ✅ Move orders to IN_TRANSIT
  for (const order of orders) {
    await docClient.send(
      new UpdateCommand({
        TableName: ORDER_TABLE,
        Key: { id: order.id },
        UpdateExpression: "SET #status = :inTransit",
        ExpressionAttributeValues: {
          ":inTransit": "IN_TRANSIT",
        },
        ExpressionAttributeNames: {
          "#status": "status",
        },
      }),
    );
  }

  // ✅ Reset courier capacity
  await docClient.send(
    new UpdateCommand({
      TableName: COURIER_TABLE,
      Key: { id: courierId },
      UpdateExpression: `
        SET currentBatchCount = :zero,
            currentExpressCount = :zero,
            lastBatchAssignedAt = :null
      `,
      ExpressionAttributeValues: {
        ":zero": 0,
        ":null": null,
      },
    }),
  );

  console.log("✅ Dispatch complete & courier reset:", courierId);
}

// ================= GET COURIER ORDERS (GSI) =================
async function getCourierActiveOrders(courierId) {
  let items = [];
  let lastKey;

  do {
    const res = await docClient.send(
      new QueryCommand({
        TableName: ORDER_TABLE,
        IndexName: "byAssignedCourier", // ✅ already in your schema
        KeyConditionExpression: "assignedCourierId = :c",
        FilterExpression: "#status = :picked OR #status = :accepted",
        ExpressionAttributeValues: {
          ":c": courierId,
          ":picked": "PICKED_UP",
          ":accepted": "ACCEPTED",
        },
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExclusiveStartKey: lastKey,
      }),
    );

    items.push(...(res.Items || []));
    lastKey = res.LastEvaluatedKey;
  } while (lastKey);

  return items;
}
