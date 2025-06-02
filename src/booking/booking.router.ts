import { Express } from "express";
import {createBookingController,deleteBookingController,updateBookingController, getBookingByCustomerIdController,getBookingByIdController, getBookingsController } from "./booking.controller";
import { adminRoleAuth,userRoleAuth,bothRoleAuth } from "../middleware/bearAuth";

// Create booking router
const booking = (app: Express) => {
    app.route("/booking").post(bothRoleAuth,async (req, res, next) => {
        
        try {
            await createBookingController(req, res);
        } catch (error) {
            next(error);
        }
    });
    // Get all bookings
    app.route("/booking").get( adminRoleAuth,async (req, res, next) => {
       
        try {
            await getBookingsController(req, res);
        } catch (error) {
            next(error);
        }
    }
    );
    // Get booking by ID
    app.route("/booking/:id").get(bothRoleAuth,async (req, res, next) => {
        
        try {
            await getBookingByIdController(req, res);
        } catch (error) {
            next(error);
        }
    }
    );
    // Get bookings by customer ID
    app.route("/booking/customer/:customerId").get(userRoleAuth,async (req, res, next) => {
      
        try {
            await getBookingByCustomerIdController(req, res);
        } catch (error) {
            next(error);
        }
    });
    // Update booking by ID

    app.route("/booking/:id").put(adminRoleAuth,async (req, res, next) => {
        
        try {
            await updateBookingController(req, res);
        } catch (error) {
            next(error);
        }
    });

    // Delete booking by ID
    app.route("/booking/:id").delete(adminRoleAuth,async (req, res, next) => {
    
        try {
            await deleteBookingController(req, res);
        } catch (error) {
            next(error);
        }
    }
    );
};
export default booking;
