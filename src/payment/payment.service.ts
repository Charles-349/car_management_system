import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { PaymentTable, TIPayment } from "../drizzle/schema";


// Create payment
export const createPaymentService = async (payment: TIPayment) => {
    await db.insert(PaymentTable).values(payment);
    return "Payment created successfully";
};

//get all payments
export const getPaymentsService = async () => {
    const payments = await db.query.PaymentTable.findMany();
    return payments;
};

//get payment by id
export const getPaymentByIdService = async (id: number) => {
    const payment = await db.query.PaymentTable.findFirst({
        where: eq(PaymentTable.paymentID, id)
    });
    return payment;
};

//update payment
export const updatePaymentService = async (id: number, payment: TIPayment) => {
    const updatedPayment = await db.update(PaymentTable)
        .set(payment)
        .where(eq(PaymentTable.paymentID, id))
        .returning();

    if (updatedPayment.length === 0) {
        return null;
    }
    return "Payment updated successfully";
};

//delete payment by id
export const deletePaymentService = async (id: number) => {
    const deletedPayment = await db.delete(PaymentTable)
        .where(eq(PaymentTable.paymentID, id))
        .returning();

    if (deletedPayment.length === 0) {
        return null;
    }
    return "Payment deleted successfully";
};
