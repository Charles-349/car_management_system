import { Express } from "express";
import { createInsuranceController, deleteInsuranceController, getInsuranceByIdController, getInsuranceController, updateInsuranceController } from "./insurance.controller";

// Create insurance router
const insurance = (app: Express) => {   
    app.route("/insurance").post(async (req, res, next) => {
        try {
            await createInsuranceController(req, res);
        } catch (error) {
            next(error);
        }
    });

    // Get all insurances
    app.route("/insurance").get(async (req, res, next) => {
        try {
            await getInsuranceController(req, res);
        } catch (error) {
            next(error);
        }
    });

    // Get insurance by ID
    app.route("/insurance/:id").get(async (req, res, next) => {
        try {
            await getInsuranceByIdController(req, res);
        } catch (error) {
            next(error);
        }
    });

    // Update insurance by ID
    app.route("/insurance/:id").put(async (req, res, next) => {
        try {
            await updateInsuranceController(req, res);
        } catch (error) {
            next(error);
        }
    });

    // Delete insurance by ID
    app.route("/insurance/:id").delete(async (req, res, next) => {
        try {
            await deleteInsuranceController(req, res);
        } catch (error) {
            next(error);
        }
    });
}
export default insurance;