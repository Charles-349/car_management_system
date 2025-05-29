import { Request,Response } from "express";
import{createCarService, getCarByIdService } from "./car.service";

export const createCarController = async (req: Request, res: Response) => {
    try {
        const car = req.body;
        const createCar = await createCarService(car);
        if(!createCar) return res.json({message: "car not created"});
        return res.status(201).json({
            message: "Car created successfully"
        });
    } catch (error:any) {
        return res.status(500).json({
            message: error.message
        });
    }
}
// get car by id controller
export const getCarByIdController = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid car ID" });
        }
        const car = await getCarByIdService(id);
        if (!car) {
            return res.status(404).json({ message: "Car not found" });
        }
        return res.status(200).json({ message: "Car retrieved successfully", car });
    } catch (error: any) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}