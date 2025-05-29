import { Express } from "express";
import { createCustomerController,deleteCustomerController,updateCustomerController, getCustomerController, getCustomerByIdController } from "./customer.controller";

const customer = (app: Express) => {
    app.route("/customer").post(async (req, res, next) => {
        try {
            await createCustomerController(req, res);
        } catch (error) {
            next(error);
        }
    }
    )
    app.route("/customer").get(async (req, res, next) => {
        try {
            await getCustomerController(req, res);
        } catch (error) {
            next(error);
        }
    })

    app.route("/customer/:id").get(async (req, res, next) => {
        try {
            await getCustomerByIdController(req, res);
        } catch (error) {
            next(error);
        }
    })
//update customer by id
    app.route("/customer/:id").put(async (req, res, next) => {
        try {
            await updateCustomerController(req, res);
        } catch (error) {
            next(error);
        }
    }
    )

    //delete customer by id
    app.route("/customer/:id").delete(async (req, res, next) => {
        try {
            await deleteCustomerController(req, res);
        } catch (error) {
            next(error);
        }
    }
    )

};
    export default customer;