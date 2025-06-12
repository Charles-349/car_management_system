import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { ReservationTable, TIReservation } from "../drizzle/schema";


//create reservation service
export const createReservationService =async(reservation:TIReservation) => {
    const[inserted] = await db.insert(ReservationTable).values(reservation).returning();
    if(inserted) {
        return inserted;
    }   
    return null;
}
// get a reservation by id
export const getReservationByIdService = async (id: number) => {
    const reservation = await db.query.ReservationTable.findFirst({
        where: eq(ReservationTable.reservationID, id)
    });
    return reservation;
}
//get a reservation
export const getReservationService = async () => {
    const reservations = await db.query.ReservationTable.findMany();
    return reservations;
}
//update reservation
export const updateReservationService = async (id: number, reservation: TIReservation) => {
    const updatedReservation = await db.update(ReservationTable)
        .set(reservation)
        .where(eq(ReservationTable.reservationID, id))
        .returning();

    if (updatedReservation.length === 0) {
        return null;
    }

    return updatedReservation[0]; 
}

//delete reservation
export const deleteReservationService = async (id: number) => {
    const deletedReservation = await db.delete(ReservationTable)
        .where(eq(ReservationTable.reservationID, id))
        .returning();

    if (deletedReservation.length === 0) {
        return null;
    }
    return "Reservation deleted successfully";
}
//get reservation by car id
export const getReservationByCarIdService = async (carId: number) => {
    const reservations = await db.query.ReservationTable.findMany({
        where: eq(ReservationTable.carID, carId)
    });
    return reservations;
}
