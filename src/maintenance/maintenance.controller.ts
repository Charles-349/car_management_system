import { Request, Response } from "express";
import {  createMaintenanceService,deleteMaintenanceService, updateMaintenanceService, getMaintenanceService,  getMaintenanceByIdService} from "./maintenance.service"; 

// Create maintenance controller
export const createMaintenanceController = async (req: Request, res: Response) => {
    try {
        const maintenance = req.body;
        const createdMaintenance = await createMaintenanceService(maintenance);
        if (!createdMaintenance) return res.status(500).json({ error: "Failed to create maintenance" });
        return res.status(201).json({
            message: "Maintenance created successfully",
            maintenance: createdMaintenance
        });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
}
// Get all maintenance records controller
export const getMaintenanceController = async (req: Request, res: Response) => {
    try {
        const maintenances = await getMaintenanceService();
        if (!maintenances || maintenances.length === 0) {
            return res.status(404).json({ message: "No maintenance records found" });
        }
        return res.status(200).json({ message: "Maintenance records retrieved successfully", maintenances });
    } catch (error: any) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}
// Get maintenance by ID controller
export const getMaintenanceByIdController = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid maintenance ID" });
        }
        const maintenance = await getMaintenanceByIdService(id);
        if (!maintenance) {
            return res.status(404).json({ message: "Maintenance record not found" });
        }
        return res.status(200).json({ message: "Maintenance record retrieved successfully", maintenance });
    } catch (error: any) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}
// Update maintenance controller
export const updateMaintenanceController = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(404).json({ message: "Invalid maintenance ID" });
        }
        const maintenance = req.body;
        const existingMaintenance = await getMaintenanceByIdService(id);
        if (!existingMaintenance) {
            return res.status(404).json({ message: "Maintenance record not found" });
        }
        const updatedMaintenance = await updateMaintenanceService(id, maintenance);
        if (!updatedMaintenance) {
            return res.status(404).json({ message: "Maintenance record not updated" });
        }
        return res.status(200).json({ message:updatedMaintenance });
    } catch (error: any) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}
// Delete maintenance controller
export const deleteMaintenanceController = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(404).json({ message: "Invalid maintenance ID" });
        }
        const existingMaintenance = await getMaintenanceByIdService(id);
        if (!existingMaintenance) {
            return res.status(404).json({ message: "Maintenance record not found" });
        }
        const deletedMaintenance = await deleteMaintenanceService(id);
        if (!deletedMaintenance) {
            return res.status(404).json({ message: "Maintenance record not deleted" });
        }
        return res.status(200).json({ message: "Maintenance record deleted successfully" });
    } catch (error: any) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}