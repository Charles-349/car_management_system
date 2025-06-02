import db from "../drizzle/db";
import { eq } from "drizzle-orm";
import { BookingsTable, TIBooking } from "../drizzle/schema";

// Create booking service
export const createBookingService = async (booking: TIBooking) => {
    const [inserted] = await db.insert(BookingsTable).values(booking).returning();
    if (inserted) {
        return inserted;
    }
    return null;
}
// Get all bookings
export const getBookingsService = async () => {
    const bookings = await db.query.BookingsTable.findMany();
    return bookings;
}
// Get booking by ID
export const getBookingByIdService = async (id: number) => {
    const booking = await db.query.BookingsTable.findFirst({
        where: eq(BookingsTable.bookingID, id)
    });
    return booking;
}

//get bookings by customer ID
export const getBookingByCustomerIdService = async (customerId: number) => {
    const bookings = await db.query.BookingsTable.findMany({
        where: eq(BookingsTable.customerID, customerId)
    });
    return bookings;
}
// Update booking
export const updateBookingService = async (id: number, booking: TIBooking) => {
    const updatedBooking = await db.update(BookingsTable)
        .set(booking)
        .where(eq(BookingsTable.bookingID, id))
        .returning();

    if (updatedBooking.length === 0) {
        return null;
    }
    return "Booking updated successfully";
}

// Delete booking by ID
export const deleteBookingService = async (id: number) => {
    const deletedBooking = await db.delete(BookingsTable)
        .where(eq(BookingsTable.bookingID, id))
        .returning();

    if (deletedBooking.length === 0) {
        return null;
    }
    return "Booking deleted successfully";
}