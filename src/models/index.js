// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const OrderStatus = {
  "READY_FOR_PICKUP": "READY_FOR_PICKUP",
  "ACCEPTED": "ACCEPTED",
  "PICKEDUP": "PICKEDUP",
  "DELIVERED": "DELIVERED"
};

const { CourierCompany, CompanyVehicle, Courier, Order, User } = initSchema(schema);

export {
  CourierCompany,
  CompanyVehicle,
  Courier,
  Order,
  User,
  OrderStatus
};