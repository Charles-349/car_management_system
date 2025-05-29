import { Request, Response } from "express";
import { createPaymentService  } from "./payment.service";

//create controller
export const createPaymentController = async (req: Request, res: Response) => {
    try {
        const payment = req.body;
        const createPayment = await createPaymentService(payment);
        if (!createPayment) return res.json({ message: "Payment not created" });
        return res.status(201).json({
            message: "Payment created successfully"
        });
    } catch (error: any) {
        return res.status(500).json({
            message: error.message
        });
    }
};