import { Express } from "express";
import { createCustomerController,getCustomerWithReservationsController,getCustomersWithPaymentsAndBookingsControllerById ,getCustomersWithPaymentsAndBookingsController,verifyCustomerController, resendVerificationCodeController,customerLoginController,deleteCustomerController,updateCustomerController, getCustomerController, getCustomerByIdController,getCustomerWithBookingsController } from "./customer.controller";

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

    //resend verification code route
    app.route("/customer/resend-verification").post(async (req, res, next) => {
        try {
            await resendVerificationCodeController(req, res);
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

    //customer with bookings controller
    app.route("/customer/:id/bookings").get(async (req, res, next) => {
        try {
            await getCustomerWithBookingsController(req, res);
        } catch (error) {
            next(error);
        }
    });
    app.route("/customer/:id/bookings-payments").get(async (req, res, next) => {
        try {
            await getCustomersWithPaymentsAndBookingsController(req, res);
        } catch (error) {
            next(error);
        }
    });
    
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
    // get customer with reservations route
    app.route("/customer/:id/reservations").get(async (req, res, next) => {
        try {
            await getCustomerWithReservationsController(req, res);
        } catch (error) {
            next(error);
        }
    });
     app.route("/customer/:id/booking-payment").get(async (req, res, next) => {
        try {
            await getCustomersWithPaymentsAndBookingsControllerById (req, res);
        } catch (error) {
            next(error);
        }
    });



};
export default customer;
