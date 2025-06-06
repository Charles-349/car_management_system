import { Express } from "express";
import { createCustomerController,verifyCustomerController,customerLoginController,deleteCustomerController,updateCustomerController, getCustomerController, getCustomerByIdController } from "./customer.controller";

const customer = (app: Express) => {
    app.route("/customer").post(async (req, res, next) => {
        try {
            await createCustomerController(req, res);
        } catch (error) {
            next(error);
        }
    }
    )
    //verify customer route
    app.route("/customer/verify").post(async (req, res, next) => {
        try {
            await verifyCustomerController(req, res);
        } catch (error) {
            next(error);
        }
    }
    )
    //login customer route
    app.route("/customer/login").post(async (req, res, next) => {
        try {
            await customerLoginController(req, res);
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