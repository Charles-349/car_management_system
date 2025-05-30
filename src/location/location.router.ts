import { Express } from "express";
import {createLocationController,deleteLocationController,getLocationByIdController,getLocationsController,updateLocationController} from "./location.controller";

// Create location router
const location = (app: Express) => {
    app.route("/location").post(async (req, res, next) => {
        try {
            await createLocationController(req, res);
        } catch (error) {
            next(error);
        }
    });

    // Get all locations
    app.route("/location").get(async (req, res, next) => {
        try {
            await getLocationsController(req, res);
        } catch (error) {
            next(error);
        }
    }
    );

    // Get location by ID
    app.route("/location/:id").get(async (req, res, next) => {
        try {
            await getLocationByIdController(req, res);
        } catch (error) {
            next(error);
        }
    }
    );
    // Update location by ID
    app.route("/location/:id").put(async (req, res, next) => {
        try {
            await updateLocationController(req, res);
        } catch (error) {
            next(error);
        }
    }
    );
    // Delete location by ID
    app.route("/location/:id").delete(async (req, res, next) => {
        try {
            await deleteLocationController(req, res);
        } catch (error) {
            next(error);
        }
    }
    );
};
export default location;
