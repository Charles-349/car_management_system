import {
  createBookingService,
  getBookingsService,
  getBookingByIdService,
  getBookingByCustomerIdService,
  updateBookingService,
  deleteBookingService
} from "../../src/booking/booking.service";

import db from "../../src/drizzle/db";
import { BookingsTable, TIBooking } from "../../src/drizzle/schema";

jest.mock("../../src/drizzle/db", () => ({
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  query: {
    BookingsTable: {
      findFirst: jest.fn(),
      findMany: jest.fn()
    }
  }
}));

describe("booking service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createBookingService", () => {
    it("should insert a booking and return it", async () => {
      const booking = {
      carID: 1, 
      customerID: 1, 
      rentalStartDate: "2024-06-05", 
      rentalEndDate: "2024-06-10", 
      totalAmount: "250.00" 
    };

      (db.insert as jest.Mock).mockReturnValueOnce({
        values: jest.fn().mockReturnValueOnce({
          returning: jest.fn().mockResolvedValueOnce([booking])
        })
      });

      const result = await createBookingService(booking);
      expect(result).toEqual(booking);
    });

    it("should return null if insert fails", async () => {
      const booking = {
         carID: 1, 
      customerID: 1, 
      rentalStartDate: "2024-06-05", 
      rentalEndDate: "2024-06-10", 
      totalAmount: "250.00" 
      };

      (db.insert as jest.Mock).mockReturnValueOnce({
        values: jest.fn().mockReturnValueOnce({
          returning: jest.fn().mockResolvedValueOnce([])
        })
      });

      const result = await createBookingService(booking);
      expect(result).toBeNull();
    });
  });

  describe("getBookingsService", () => {
    it("should return all bookings", async () => {
      const bookings = [{ bookingID: 1 }, { bookingID: 2 }];
      (db.query.BookingsTable.findMany as jest.Mock).mockResolvedValueOnce(bookings);

      const result = await getBookingsService();
      expect(result).toEqual(bookings);
    });
  });

  describe("getBookingByIdService", () => {
    it("should return a booking by ID", async () => {
      const booking = { bookingID: 1 };
      (db.query.BookingsTable.findFirst as jest.Mock).mockResolvedValueOnce(booking);

      const result = await getBookingByIdService(1);
      expect(result).toEqual(booking);
    });

    it("should return undefined if booking not found", async () => {
      (db.query.BookingsTable.findFirst as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await getBookingByIdService(99);
      expect(result).toBeUndefined();
    });
  });

  describe("getBookingByCustomerIdService", () => {
    it("should return bookings for a given customer", async () => {
      const bookings = [{ bookingID: 1, customerID: 5 }];
      (db.query.BookingsTable.findMany as jest.Mock).mockResolvedValueOnce(bookings);

      const result = await getBookingByCustomerIdService(5);
      expect(result).toEqual(bookings);
    });

    it("should return empty array if no bookings found", async () => {
      (db.query.BookingsTable.findMany as jest.Mock).mockResolvedValueOnce([]);

      const result = await getBookingByCustomerIdService(999);
      expect(result).toEqual([]);
    });
  });

  describe("updateBookingService", () => {
    it("should update a booking and return success", async () => {
      (db.update as jest.Mock).mockReturnValueOnce({
        set: jest.fn().mockReturnValueOnce({
          where: jest.fn().mockReturnValueOnce({
            returning: jest.fn().mockResolvedValueOnce([{}])
          })
        })
      });

      const booking: TIBooking = {
         carID: 1, 
      customerID: 1, 
      rentalStartDate: "2024-06-05", 
      rentalEndDate: "2024-06-10", 
      totalAmount: "250.00" 
      };

      const result = await updateBookingService(1, booking);
      expect(result).toBe("Booking updated successfully");
    });

    it("should return null if no booking updated", async () => {
      (db.update as jest.Mock).mockReturnValueOnce({
        set: jest.fn().mockReturnValueOnce({
          where: jest.fn().mockReturnValueOnce({
            returning: jest.fn().mockResolvedValueOnce([])
          })
        })
      });

      const booking: TIBooking = {
        carID: 1, 
      customerID: 1, 
      rentalStartDate: "2024-06-05", 
      rentalEndDate: "2024-06-10", 
      totalAmount: "250.00" 
      };

      const result = await updateBookingService(1, booking);
      expect(result).toBeNull();
    });
  });

  describe("deleteBookingService", () => {
    it("should delete a booking and return success", async () => {
      (db.delete as jest.Mock).mockReturnValueOnce({
        where: jest.fn().mockReturnValueOnce({
          returning: jest.fn().mockResolvedValueOnce([{}])
        })
      });

      const result = await deleteBookingService(1);
      expect(result).toBe("Booking deleted successfully");
    });

    it("should return null if no booking deleted", async () => {
      (db.delete as jest.Mock).mockReturnValueOnce({
        where: jest.fn().mockReturnValueOnce({
          returning: jest.fn().mockResolvedValueOnce([])
        })
      });

      const result = await deleteBookingService(99);
      expect(result).toBeNull();
    });
  });
});
