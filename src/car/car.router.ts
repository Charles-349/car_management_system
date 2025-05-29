import { Express } from "express";
import{ createCarController,getCarByIdController } from "./car.controller";
const car = (app: Express) => {
    app.route("/car").post(async (req, res, next) => {
        try {
            await createCarController(req, res);
        } catch (error) {
            next(error);
        }
    });
    //get car by id
    app.route("/car/:id").get(async (req, res, next) => {
        try {
            await getCarByIdController(req, res);
        } catch (error) {
            next(error);
        }
    }
    );
};
export default car;