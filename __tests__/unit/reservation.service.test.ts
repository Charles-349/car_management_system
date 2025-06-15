import {
  createReservationService,
  getReservationByIdService,
  getReservationService,
  getReservationByCarIdService,
  updateReservationService,
  deleteReservationService
} from "../../src/reservation/reservation.service";

import db from "../../src/drizzle/db";
import { TIReservation } from "../../src/drizzle/schema";

jest.mock("../../src/drizzle/db", () => ({
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  query: {
    ReservationTable: {
      findMany: jest.fn(),
      findFirst: jest.fn()
    }
  }
}));

describe("Reservation Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createReservationService", () => {
    it("should create a reservation and return the inserted record", async () => {
      const mockReservation = { reservationID: 1 };
      (db.insert as jest.Mock).mockReturnValueOnce({
        values: jest.fn().mockReturnValueOnce({
          returning: jest.fn().mockResolvedValueOnce([mockReservation])
        })
      });

      const result = await createReservationService({
       customerID: 1, 
       carID: 1, 
       reservationDate: "2024-06-01", 
       pickupDate: "2024-06-05", 
       returnDate: "2024-06-10"
      });

      expect(result).toEqual(mockReservation);
    });

    it("should return null if no record is inserted", async () => {
      (db.insert as jest.Mock).mockReturnValueOnce({
        values: jest.fn().mockReturnValueOnce({
          returning: jest.fn().mockResolvedValueOnce([])
        })
      });

      const result = await createReservationService({
        customerID: 1, 
       carID: 1, 
       reservationDate: "2024-06-01", 
       pickupDate: "2024-06-05", 
       returnDate: "2024-06-10"
      });

      expect(result).toBeNull();
    });
  });

  describe("getReservationByIdService", () => {
    it("should return reservation by ID", async () => {
      const mockReservation = { reservationID: 1 };
      (db.query.ReservationTable.findFirst as jest.Mock).mockResolvedValueOnce(mockReservation);

      const result = await getReservationByIdService(1);
      expect(result).toEqual(mockReservation);
    });

    it("should return undefined if reservation not found", async () => {
      (db.query.ReservationTable.findFirst as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await getReservationByIdService(999);
      expect(result).toBeUndefined();
    });
  });

  describe("getReservationService", () => {
    it("should return all reservations", async () => {
      const mockData = [{ reservationID: 1 }, { reservationID: 2 }];
      (db.query.ReservationTable.findMany as jest.Mock).mockResolvedValueOnce(mockData);

      const result = await getReservationService();
      expect(result).toEqual(mockData);
    });
  });

  describe("getReservationByCarIdService", () => {
    it("should return reservations filtered by carID", async () => {
      const mockReservations = [{ reservationID: 1, carID: 5 }];
      (db.query.ReservationTable.findMany as jest.Mock).mockResolvedValueOnce(mockReservations);

      const result = await getReservationByCarIdService(5);
      expect(result).toEqual(mockReservations);
    });
  });

  describe("updateReservationService", () => {
  it("should update a reservation and return the updated reservation object", async () => {
    (db.update as jest.Mock).mockReturnValueOnce({
      set: jest.fn().mockReturnValueOnce({
        where: jest.fn().mockReturnValueOnce({
          returning: jest.fn().mockResolvedValueOnce([{ reservationID: 1 }])
        })
      })
    });

    const result = await updateReservationService(1, {
      customerID: 1,
      carID: 1,
      reservationDate: "2024-06-01",
      pickupDate: "2024-06-05",
      returnDate: "2024-06-10"
    });

    
    expect(result).toEqual({ reservationID: 1 });
  });

  it("should return null if no reservation was updated", async () => {
    (db.update as jest.Mock).mockReturnValueOnce({
      set: jest.fn().mockReturnValueOnce({
        where: jest.fn().mockReturnValueOnce({
          returning: jest.fn().mockResolvedValueOnce([])
        })
      })
    });

    const result = await updateReservationService(1, {
      customerID: 1,
      carID: 1,
      reservationDate: "2024-06-01",
      pickupDate: "2024-06-05",
      returnDate: "2024-06-10"
    });

    expect(result).toBeNull();
  });
});


  describe("deleteReservationService", () => {
    it("should delete a reservation and return success message", async () => {
      (db.delete as jest.Mock).mockReturnValueOnce({
        where: jest.fn().mockReturnValueOnce({
          returning: jest.fn().mockResolvedValueOnce([{ reservationID: 1 }])
        })
      });

      const result = await deleteReservationService(1);
      expect(result).toBe("Reservation deleted successfully");
    });

    it("should return null if no reservation was deleted", async () => {
      (db.delete as jest.Mock).mockReturnValueOnce({
        where: jest.fn().mockReturnValueOnce({
          returning: jest.fn().mockResolvedValueOnce([])
        })
      });

      const result = await deleteReservationService(999);
      expect(result).toBeNull();
    });
  });
});
