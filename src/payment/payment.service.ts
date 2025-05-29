import db from "../drizzle/db";
import { PaymentTable, TIPayment } from "../drizzle/schema";


// Create payment
export const createPaymentService = async (payment: TIPayment) => {
    await db.insert(PaymentTable).values(payment);
    return "Payment created successfully";
};