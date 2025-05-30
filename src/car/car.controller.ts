import { Request,Response } from "express";
import{createCarService,deleteCarService,updateCarService,getCarService, getCarByIdService } from "./car.service";

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
// get all cars controller
export const getCarController = async (req: Request, res: Response) => {
    try {
        const cars = await getCarService();
        if (!cars || cars.length === 0) {
            return res.status(404).json({ message: "No cars found" });
        }
        return res.status(200).json({ message: "Cars retrieved successfully", cars });
    } catch (error: any) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}
// update car controller
export const updateCarController = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(404).json({ message: "Invalid car ID" });
        }
        const car = req.body;
        const existingCar = await getCarByIdService(id);
        if (!existingCar) {
            return res.status(404).json({ message: "Car not found" });
        }
        const updatedCar = await updateCarService(id, car);
        if (!updatedCar) {
            return res.status(404).json({ message: "Car not updated" });
        }
        return res.status(200).json({ message: "Car updated successfully" });
    } catch (error:any) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}
// delete car controller
export const deleteCarController = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(404).json({ message: "Invalid car ID" });
        }
        const deletedCar = await deleteCarService(id);
        if (!deletedCar) {
            return res.status(404).json({ message: "Car not deleted" });
        }
        return res.status(200).json({ message: "Car deleted successfully" });
    } catch (error:any) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}