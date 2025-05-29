import { Express } from "express";
import { createPaymentController } from "./payment.controller";

// create payment
const payment = (app: Express) => {
    app.route("/payment").post(async (req, res, next) => {
        try {
            await createPaymentController(req, res);
        } catch (error) {
            next(error);
        }
    });
};
export default payment;