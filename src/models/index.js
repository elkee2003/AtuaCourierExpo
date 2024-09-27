// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const OrderStatus = {
  "READY_FOR_PICKUP": "READY_FOR_PICKUP",
  "ACCEPTED": "ACCEPTED",
  "PICKEDUP": "PICKEDUP",
  "DELIVERED": "DELIVERED"
};

const { CompanyVehicle, CourierCompany, Courier, User, Order } = initSchema(schema);

export {
  CompanyVehicle,
  CourierCompany,
  Courier,
  User,
  Order,
  OrderStatus
};