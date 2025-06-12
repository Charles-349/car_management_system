import { Request,Response } from "express";
import{createInsuranceService , getInsuranceByIdService,getInsuranceService,updateInsuranceService,deleteInsuranceService} from "./insurance.service"

//create insurance controller
export const createInsuranceController = async (req: Request, res: Response) => {
    try {
        const insurance = req.body;
        const createdInsurance = await createInsuranceService(insurance);
        if (!createdInsurance) {
            return res.status(500).json({ error: "Failed to create insurance" });
        }
        return res.status(201).json({
            message: "Insurance created successfully",
            insurance: createdInsurance
        });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
}
// get insurance by id controller
export const getInsuranceByIdController = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid insurance ID" });
        }
        const insurance = await getInsuranceByIdService(id);
        if (!insurance) {
            return res.status(404).json({ message: "Insurance not found" });
        }
        return res.status(200).json({ message: "Insurance retrieved successfully", insurance });
    } catch (error: any) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}
// get all insurances controller
export const getInsuranceController = async (req: Request, res: Response) => {
    try {
        const insurances = await getInsuranceService();
        if (!insurances || insurances.length === 0) {
            return res.status(404).json({ message: "No insurances found" });
        }
        return res.status(200).json({ message: "Insurances retrieved successfully", insurances });
    } catch (error: any) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}
// update insurance controller
export const updateInsuranceController = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(404).json({ message: "Invalid insurance ID" });
        }
        const insurance = req.body;
        const existingInsurance = await getInsuranceByIdService(id);
        if (!existingInsurance) {
            return res.status(404).json({ message: "Insurance not found" });
        }
        const updatedInsurance = await updateInsuranceService(id, insurance);
        if (!updatedInsurance) {
            return res.status(404).json({ message: "Insurance not updated" });
        }
        return res.status(200).json({ message: "Insurance updated successfully", updatedInsurance });
    } catch (error: any) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}
// delete insurance controller
export const deleteInsuranceController = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(404).json({ message: "Invalid insurance ID" });
        }
        const existingInsurance = await getInsuranceByIdService(id);
        if (!existingInsurance) {
            return res.status(404).json({ message: "Insurance not found" });
        }
        const deletedInsurance = await deleteInsuranceService(id);
        if (!deletedInsurance) {
            return res.status(404).json({ message: "Insurance not deleted" });
        }
        return res.status(200).json({ message: "Insurance deleted successfully" });
    } catch (error: any) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}
