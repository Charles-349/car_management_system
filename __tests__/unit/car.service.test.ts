import {
  createCarService,
  getCarByIdService,
  getCarService,
  updateCarService,
  deleteCarService,
} from "../../src/car/car.service";

import db from "../../src/drizzle/db";
import { CarTable, TICar } from "../../src/drizzle/schema";

jest.mock("../../src/drizzle/db", () => ({
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  query: {
    CarTable: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    }
  }
}));

describe("car service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createCarService", () => {
    it("should insert a car and return it", async () => {
      const car = {
        carModel: "Corolla",
        year: "2022",
        rentalRate: "40",
        color: "Blue",
        availability: true
      };

      (db.insert as jest.Mock).mockReturnValueOnce({
        values: jest.fn().mockReturnValueOnce({
          returning: jest.fn().mockResolvedValueOnce([car])
        })
      });

      const result = await createCarService(car);
      expect(result).toEqual(car);
    });

    it("should return null if insert fails", async () => {
      (db.insert as jest.Mock).mockReturnValueOnce({
        values: jest.fn().mockReturnValueOnce({
          returning: jest.fn().mockResolvedValueOnce([])
        })
      });

      const car = {
        carModel: "Camry",
        year: "2022",
        rentalRate: "45",
        color: "White",
        availability: true
      };
      const result = await createCarService(car);
      expect(result).toBeNull();
    });
  });

  describe("getCarByIdService", () => {
    it("should return a car by ID", async () => {
      const car = { carID: 1, make: "Toyota" };
      (db.query.CarTable.findFirst as jest.Mock).mockResolvedValueOnce(car);

      const result = await getCarByIdService(1);
      expect(db.query.CarTable.findFirst).toHaveBeenCalled();
      expect(result).toEqual(car);
    });

    it("should return undefined if car not found", async () => {
      (db.query.CarTable.findFirst as jest.Mock).mockResolvedValueOnce(undefined);
      const result = await getCarByIdService(999);
      expect(result).toBeUndefined();
    });
  });

  describe("getCarService", () => {
    it("should return all cars", async () => {
      const cars = [{ carID: 1 }, { carID: 2 }];
      (db.query.CarTable.findMany as jest.Mock).mockResolvedValueOnce(cars);

      const result = await getCarService();
      expect(result).toEqual(cars);
    });
  });

  describe("updateCarService", () => {
    it("should update a car and return success", async () => {
      (db.update as jest.Mock).mockReturnValueOnce({
        set: jest.fn().mockReturnValueOnce({
          where: jest.fn().mockReturnValueOnce({
            returning: jest.fn().mockResolvedValueOnce([{}])
          })
        })
      });

      const car = {
        carModel: "Civic",
        year: "2022",
        rentalRate: "50",
        color: "Black",
        availability: true
      };

      const result = await updateCarService(1, car);
      expect(result).toBe("Car updated successfully");
    });

    it("should return null if no car updated", async () => {
      (db.update as jest.Mock).mockReturnValueOnce({
        set: jest.fn().mockReturnValueOnce({
          where: jest.fn().mockReturnValueOnce({
            returning: jest.fn().mockResolvedValueOnce([])
          })
        })
      });

      const car = {
        carModel: "Civic",
        year: "2022",
        rentalRate: "50",
        color: "Black",
        availability: true
      };

      const result = await updateCarService(99, car);
      expect(result).toBeNull();
    });
  });

  describe("deleteCarService", () => {
    it("should delete a car and return success", async () => {
      (db.delete as jest.Mock).mockReturnValueOnce({
        where: jest.fn().mockReturnValueOnce({
          returning: jest.fn().mockResolvedValueOnce([{}])
        })
      });

      const result = await deleteCarService(1);
      expect(result).toBe("Car deleted successfully");
    });

    it("should return null if no car deleted", async () => {
      (db.delete as jest.Mock).mockReturnValueOnce({
        where: jest.fn().mockReturnValueOnce({
          returning: jest.fn().mockResolvedValueOnce([])
        })
      });

      const result = await deleteCarService(99);
      expect(result).toBeNull();
    });
  });
});
