import { Express } from "express";
import {createMaintenanceController, getMaintenanceController, getMaintenanceByIdController, updateMaintenanceController, deleteMaintenanceController} from "./maintenance.controller";

// Create maintenance router
const maintenance = (app: Express) => {
    app.route("/maintenance").post(async (req, res, next) => {
        try {
            await createMaintenanceController(req, res);
        } catch (error) {
            next(error);
        }
    });

    // Get all maintenance records
    app.route("/maintenance").get(async (req, res, next) => {
        try {
            await getMaintenanceController(req, res);
        } catch (error) {
            next(error);
        }
    });

    // Get maintenance by ID
    app.route("/maintenance/:id").get(async (req, res, next) => {
        try {
            await getMaintenanceByIdController(req, res);
        } catch (error) {
            next(error);
        }
    });

    // Update maintenance by ID
    app.route("/maintenance/:id").put(async (req, res, next) => {
        try {
            await updateMaintenanceController(req, res);
        } catch (error) {
            next(error);
        }
    });

    // Delete maintenance by ID
    app.route("/maintenance/:id").delete(async (req, res, next) => {
        try {
            await deleteMaintenanceController(req, res);
        } catch (error) {
            next(error);
        }
    });
}
export default maintenance;