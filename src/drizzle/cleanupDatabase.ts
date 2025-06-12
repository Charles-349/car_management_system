import  db  from "./db"; 
import {
  PaymentTable,
  BookingsTable,
  ReservationTable,
  MaintenanceTable,
  InsuranceTable,
  CarTable,
  CustomerTable,
  LocationTable
} from "./schema";

export const cleanupDatabase = async () => {
  // Delete in order to respect FK constraints
  await db.delete(PaymentTable);
  await db.delete(BookingsTable);
  await db.delete(ReservationTable);
  await db.delete(MaintenanceTable);
  await db.delete(InsuranceTable);
  await db.delete(CarTable);
  await db.delete(CustomerTable);
  await db.delete(LocationTable);
};
