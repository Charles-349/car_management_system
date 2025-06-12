import { Request, Response } from "express";
import {createBookingService,deleteBookingService,getBookingByIdService, getBookingByCustomerIdService,updateBookingService, getBookingsService} from "./booking.service";
import { BookingsTable } from "../drizzle/schema";

// Create booking controller
export const createBookingController = async (req: Request, res: Response) => {
   try {
    const booking = req.body;
    const createBooking = await createBookingService(booking);
    if(!createBooking) 
        return res.status(500).json({ message: "Failed to create booking" });
        return res.status(201).json({
            message: "Booking created successfully",
            booking: createBooking,
        });
            
    
    
   } catch (error:any) {
        return res.status(500).json({
            message: error.message
        });
    }
    
   } 
// Get all bookings controller
export const getBookingsController = async (req: Request, res: Response) => {
    try {
        const bookings = await getBookingsService();
        if (!bookings || bookings.length === 0) {
            return res.status(404).json({ message: "No bookings found" });
        }
        return res.status(200).json({ message: "Bookings retrieved successfully", bookings });
    } catch (error: any) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}
// Get booking by ID controller
export const getBookingByIdController = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid booking ID" });
        }
        const booking = await getBookingByIdService(id);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        return res.status(200).json({ message: "Booking retrieved successfully", booking });
    } catch (error: any) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

// Get bookings by customer ID controller
export const getBookingByCustomerIdController = async (req: Request, res: Response) => {
    try {
        const customerId = parseInt(req.params.customerId);
        if (isNaN(customerId)) {
            return res.status(400).json({ message: "Invalid customer ID" });
        }
        const bookings = await getBookingByCustomerIdService(customerId);
        if (!bookings || bookings.length === 0) {
            return res.status(404).json({ message: "No bookings found for this customer" });
        }
        return res.status(200).json({ message: "Bookings retrieved successfully", bookings });
    } catch (error: any) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}
// // Update booking controller
export const updateBookingController = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(404).json({ message: "Invalid booking ID" });
        }
        const booking = req.body;
        const existingBooking = await getBookingByIdService(id);
        if (!existingBooking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        const updatedBooking = await updateBookingService(id, booking);
        if (!updatedBooking) {
            return res.status(404).json({ message: "Booking not updated" });
        }
        return res.status(200).json({ message: "Booking updated successfully", booking });
    } catch (error: any) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

// // Delete booking controller
export const deleteBookingController = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(404).json({ message: "Invalid booking ID" });
        }
        const deletedBooking = await deleteBookingService(id);
        if (!deletedBooking) {
            return res.status(404).json({ message: "Booking not found or not deleted" });
        }
        return res.status(200).json({ message: "Booking deleted successfully" });
    } catch (error: any) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}
    