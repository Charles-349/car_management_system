import {
  createLocationService,
  getLocationsService,
  getLocationByIdService,
  updateLocationService,
  deleteLocationService
} from "../../src/location/location.service";

import db from "../../src/drizzle/db";
import { TILocation } from "../../src/drizzle/schema";

jest.mock("../../src/drizzle/db", () => ({
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  query: {
    LocationTable: {
      findMany: jest.fn(),
      findFirst: jest.fn()
    }
  }
}));

describe("Location Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createLocationService", () => {
    it("should create a location successfully", async () => {
      (db.insert as jest.Mock).mockReturnValueOnce({
        values: jest.fn().mockResolvedValueOnce(undefined)
      });

      const location: TILocation = {
       locationName: "Nairobi", 
       address: "123 Nairobi", 
       contactNumber: "1234567890" 
    }

      const result = await createLocationService(location);
      expect(result).toBe("Location created successfully");
    });
  });

  describe("getLocationsService", () => {
    it("should return all locations", async () => {
      const locations = [
        { locationID: 1, name: "Nairobi", address: "CBD" },
        { locationID: 2, name: "Mombasa", address: "Nyali" }
      ];

      (db.query.LocationTable.findMany as jest.Mock).mockResolvedValueOnce(locations);

      const result = await getLocationsService();
      expect(result).toEqual(locations);
    });

    it("should return empty array if no locations found", async () => {
      (db.query.LocationTable.findMany as jest.Mock).mockResolvedValueOnce([]);
      const result = await getLocationsService();
      expect(result).toEqual([]);
    });
  });

  describe("getLocationByIdService", () => {
    it("should return a location by ID", async () => {
      const location = { locationID: 1, name: "Kisumu", address: "Milimani" };
      (db.query.LocationTable.findFirst as jest.Mock).mockResolvedValueOnce(location);

      const result = await getLocationByIdService(1);
      expect(result).toEqual(location);
    });

    it("should return undefined if location not found", async () => {
      (db.query.LocationTable.findFirst as jest.Mock).mockResolvedValueOnce(undefined);
      const result = await getLocationByIdService(999);
      expect(result).toBeUndefined();
    });
  });

  describe("updateLocationService", () => {
    it("should update a location and return success", async () => {
      (db.update as jest.Mock).mockReturnValueOnce({
        set: jest.fn().mockReturnValueOnce({
          where: jest.fn().mockReturnValueOnce({
            returning: jest.fn().mockResolvedValueOnce([{ name: "Updated" }])
          })
        })
      });

      const result = await updateLocationService(1, {
       locationName: "Nairobi", 
       address: "123 Nairobi", 
       contactNumber: "1234567890" 
      });

      expect(result).toBe("Location updated successfully");
    });

    it("should return null if update fails", async () => {
      (db.update as jest.Mock).mockReturnValueOnce({
        set: jest.fn().mockReturnValueOnce({
          where: jest.fn().mockReturnValueOnce({
            returning: jest.fn().mockResolvedValueOnce([])
          })
        })
      });

      const result = await updateLocationService(99, {
        locationName: "Nairobi", 
       address: "123 Nairobi", 
       contactNumber: "1234567890" 
      });

      expect(result).toBeNull();
    });
  });

  describe("deleteLocationService", () => {
    it("should delete a location and return success", async () => {
      (db.delete as jest.Mock).mockReturnValueOnce({
        where: jest.fn().mockReturnValueOnce({
          returning: jest.fn().mockResolvedValueOnce([{ name: "Deleted" }])
        })
      });

      const result = await deleteLocationService(1);
      expect(result).toBe("Location deleted successfully");
    });

    it("should return null if delete fails", async () => {
      (db.delete as jest.Mock).mockReturnValueOnce({
        where: jest.fn().mockReturnValueOnce({
          returning: jest.fn().mockResolvedValueOnce([])
        })
      });

      const result = await deleteLocationService(999);
      expect(result).toBeNull();
    });
  });
});
