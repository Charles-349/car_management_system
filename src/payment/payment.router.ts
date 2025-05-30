import { Express } from "express";
import { createPaymentController,deletePaymentController,updatePaymentController, getPaymentsController, getPaymentByIdController } from "./payment.controller";

// create payment
const payment = (app: Express) => {
    app.route("/payment").post(async (req, res, next) => {
        try {
            await createPaymentController(req, res);
        } catch (error) {
            next(error);
        }
    });

    // get all payments
    app.route("/payment").get(async (req, res, next) => {
        try {
            await getPaymentsController(req, res);
        } catch (error) {
            next(error);
        }
    });
    // get payment by id
    app.route("/payment/:id").get(async (req, res, next) => {
        try {
            await getPaymentByIdController(req, res);
        } catch (error) {
            next(error);
        }
    });
    // update payment by id
    app.route("/payment/:id").put(async (req, res, next) => {
        try {
            await updatePaymentController(req, res);
        } catch (error) {
            next(error);
        }
    });
    // delete payment by id
    app.route("/payment/:id").delete(async (req, res, next) => {
        try {
            await deletePaymentController(req, res);
        } catch (error) {
            next(error);
        }
    });
};
export default payment;