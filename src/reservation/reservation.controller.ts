import { Request, Response } from "express";
import {createReservationService , deleteReservationService, updateReservationService, getReservationService, getReservationByIdService} from "./reservation.service";

// Create reservation controller
export const createReservationController = async (req: Request, res: Response) => {
    const reservation = req.body;
    const createdReservation = await createReservationService(reservation);
    if (createdReservation) {
        return res.status(201).json(createdReservation);
    }
    return res.status(500).json({ message: "Failed to create reservation" });
}
// Get all reservations controller
export const getReservationController = async (req: Request, res: Response) => {
    const reservations = await getReservationService();
    if (reservations && reservations.length > 0) {
        return res.status(200).json(reservations);
    }
    return res.status(404).json({ message: "No reservations found" });
}
// Get reservation by ID controller
export const getReservationByIdController = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid reservation ID" });
    }
    const reservation = await getReservationByIdService(id);
    if (reservation) {
        return res.status(200).json(reservation);
    }
    return res.status(404).json({ message: "Reservation not found" });
}
// Update reservation controller
export const updateReservationController = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid reservation ID" });
    }
    const reservation = req.body;
    const existingReservation = await getReservationByIdService(id);
    if (!existingReservation) {
        return res.status(404).json({ message: "Reservation not found" });
    }
    const updatedReservation = await updateReservationService(id, reservation);
    if (updatedReservation) {
        return res.status(200).json(updatedReservation);
    }
    return res.status(500).json({ message: "Failed to update reservation" });
}
// Delete reservation controller
// Delete reservation controller
export const deleteReservationController = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid reservation ID" });
    }
    const deletedReservation = await deleteReservationService(id);
    if (deletedReservation) {
        return res.status(200).json({ message: "Reservation deleted successfully" });
    }
    return res.status(404).json({ message: "Reservation not found or already deleted" });
};


 