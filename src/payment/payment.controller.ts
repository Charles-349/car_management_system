import { Request, Response } from "express";
import {
  createPaymentService,
  deletePaymentService,
  updatePaymentService,
  getPaymentsService,
  getPaymentByIdService
} from "./payment.service";

// Create Payment
export const createPaymentController = async (req: Request, res: Response) => {
  try {
    const payment = req.body;
    const createPayment = await createPaymentService(payment);
    if (!createPayment) return res.status(500).json({ message: "Payment not created" });

    return res.status(201).json({
      message: "Payment created successfully",
      payment: createPayment
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Get All Payments
export const getPaymentsController = async (_req: Request, res: Response) => {
  try {
    const payments = await getPaymentsService();
    if (!payments || payments.length === 0) {
      return res.status(404).json({ message: "No payments found" });
    }
    return res.status(200).json({ message: "Payments retrieved successfully", payments });
  } catch (error: any) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get Payment by ID
export const getPaymentByIdController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid payment ID" });
    }
    const payment = await getPaymentByIdService(id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    return res.status(200).json({ message: "Payment retrieved successfully", payment });
  } catch (error: any) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Update Payment
export const updatePaymentController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(404).json({ message: "Invalid payment ID" });
    }
    const payment = req.body;
    const existingPayment = await getPaymentByIdService(id);
    if (!existingPayment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    const updatedPayment = await updatePaymentService(id, payment);
    if (!updatedPayment) {
      return res.status(404).json({ message: "Payment not updated" });
    }
    return res.status(200).json({ message: "Payment updated successfully", payment: updatedPayment });
  } catch (error: any) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Delete Payment
export const deletePaymentController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(404).json({ message: "Invalid payment ID" });
    }
    const existingPayment = await getPaymentByIdService(id);
    if (!existingPayment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    const deletedPayment = await deletePaymentService(id);
    if (!deletedPayment) {
      return res.status(404).json({ message: "Payment not deleted" });
    }
    return res.sendStatus(204);
  } catch (error: any) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
