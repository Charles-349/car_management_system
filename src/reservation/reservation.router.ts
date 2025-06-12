import { Express } from "express";
import { createReservationController, deleteReservationController, getReservationByIdController, getReservationController, updateReservationController } from "./reservation.controller";

// Create reservation router
const reservation = (app: Express) => {     
    app.route("/reservation").post(async (req, res, next) => {
        try {
            await createReservationController(req, res);
        } catch (error) {
            next(error);
        }
    });

    // Get all reservations
    app.route("/reservation").get(async (req, res, next) => {
        try {
            await getReservationController(req, res);
        } catch (error) {
            next(error);
        }
    });

    // Get reservation by ID
    app.route("/reservation/:id").get(async (req, res, next) => {
        try {
            await getReservationByIdController(req, res);
        } catch (error) {
            next(error);
        }
    });

    // Update reservation by ID
    app.route("/reservation/:id").put(async (req, res, next) => {
        try {
            await updateReservationController(req, res);
        } catch (error) {
            next(error);
        }
    });

    // Delete reservation by ID
    app.route("/reservation/:id").delete(async (req, res, next) => {
        try {
            await deleteReservationController(req, res);
        } catch (error) {
            next(error);
        }
    });
}
export default reservation;
