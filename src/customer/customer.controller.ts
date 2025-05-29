import { Request, Response } from "express";
import {createCustomerService,deleteCustomerService, getCustomerService,updateCustomerService, getCustomerByIdService} from "./customer.service";
import bcrypt from "bcrypt";

//create customer controller
export const createCustomerController = async (req: Request, res: Response) => {
    try {
        const customer = req.body;
        const createCustomer = await createCustomerService(customer);
        if(!createCustomer) return res.json({message: "customer not created"})
        return res.status(201).json({
            message: "Customer created successfully"
        });
        
    } catch (error:any) {
        return res.status(500).json({
            message: error.message});
    
        
    }
};
export const getCustomerController = async (req: Request, res: Response) => {
      try {
        const customers = await getCustomerService();
        if (!customers || customers.length === 0) {
            return res.status(404).json({ message: "No customers found" });
        }
        return res.status(200).json({ message: "Customers retrieved successfully", customers });
    } catch (error: any) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}
//get customer by id controller
export const getCustomerByIdController = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid customer ID" });
        }
        const customer = await getCustomerByIdService(id);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        return res.status(200).json({ message: "Customer retrieved successfully", customer });
    } catch (error: any) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}
//update customer controller
export const updateCustomerController = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(404).json({ message: "Invalid customer ID" });
        }
        const customer = req.body;
        const existingCustomer = await getCustomerByIdService(id);
        if (!existingCustomer) {
            return res.status(404).json({ message: "Customer not found" });

        }
        const updatedCustomer = await updateCustomerService(id, customer);
        if (!updatedCustomer) {
            return res.status(404).json({ message: "Customer not updated" });
        }
        return res.status(200).json({ message: "Customer updated successfully" });

        
    } catch (error:any) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
        
    }
}

//delete customer controller
export const deleteCustomerController = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(404).json({ message: "Invalid customer ID" });
        }
        const existingCustomer = await getCustomerByIdService(id);
        if (!existingCustomer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        const deletedCustomer = await deleteCustomerService(id);
        if (!deletedCustomer) {
            return res.status(404).json({ message: "Customer not deleted" });
        }
        return res.status(200).json({ message: "Customer deleted successfully" });
        
    } catch (error:any) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
        
    }
}