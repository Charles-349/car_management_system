import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { PaymentTable, TIPayment } from "../drizzle/schema";

// Create payment
export const createPaymentService = async (payment: TIPayment) => {
    const [createdPayment] = await db.insert(PaymentTable).values(payment).returning();
    return createdPayment;
};

// Get all payments
export const getPaymentsService = async () => {
    return await db.query.PaymentTable.findMany();
};

// Get payment by ID
export const getPaymentByIdService = async (id: number) => {
    return await db.query.PaymentTable.findFirst({
        where: eq(PaymentTable.paymentID, id),
    });
};

// Update payment
export const updatePaymentService = async (id: number, payment: TIPayment) => {
    const updatedPayment = await db
        .update(PaymentTable)
        .set(payment)
        .where(eq(PaymentTable.paymentID, id))
        .returning();

    if (updatedPayment.length === 0) {
        return null;
    }

    return updatedPayment[0];
};

// Delete payment by ID
export const deletePaymentService = async (id: number) => {
    const deletedPayment = await db
        .delete(PaymentTable)
        .where(eq(PaymentTable.paymentID, id))
        .returning();

    if (deletedPayment.length === 0) {
        return null;
    }

    return deletedPayment[0]; // Optional, depending on if you want to use it in the controller
};
