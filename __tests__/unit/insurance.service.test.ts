import {
  createInsuranceService,
  getInsuranceByIdService,
  getInsuranceService,
  updateInsuranceService,
  deleteInsuranceService
} from "../../src/insurance/insurance.service";

import db from "../../src/drizzle/db";
import { InsuranceTable, TIInsurance } from "../../src/drizzle/schema";

jest.mock("../../src/drizzle/db", () => ({
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  query: {
    InsuranceTable: {
      findFirst: jest.fn(),
      findMany: jest.fn()
    }
  }
}));

describe("insurance service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createInsuranceService", () => {
    it("should create insurance and return the inserted object", async () => {
      const insurance: TIInsurance = {
         carID: 1, 
         insuranceProvider: "ABC Insurance", 
         policyNumber: "12345", 
         startDate: "2024-01-01", 
         endDate: "2024-12-31" 
      };

      (db.insert as jest.Mock).mockReturnValueOnce({
        values: jest.fn().mockReturnValueOnce({
          returning: jest.fn().mockResolvedValueOnce([insurance])
        })
      });

      const result = await createInsuranceService(insurance);
      expect(result).toEqual(insurance);
    });

    it("should return null if insertion fails", async () => {
      (db.insert as jest.Mock).mockReturnValueOnce({
        values: jest.fn().mockReturnValueOnce({
          returning: jest.fn().mockResolvedValueOnce([])
        })
      });

      const result = await createInsuranceService({
        carID: 1, 
         insuranceProvider: "ABC Insurance", 
         policyNumber: "12345", 
         startDate: "2024-01-01", 
         endDate: "2024-12-31" 
      });

      expect(result).toBeNull();
    });
  });

  describe("getInsuranceByIdService", () => {
    it("should return an insurance by ID", async () => {
      const insurance = { insuranceID: 1, policyNumber: "POL123" };
      (db.query.InsuranceTable.findFirst as jest.Mock).mockResolvedValueOnce(insurance);

      const result = await getInsuranceByIdService(1);
      expect(result).toEqual(insurance);
    });

    it("should return undefined if not found", async () => {
      (db.query.InsuranceTable.findFirst as jest.Mock).mockResolvedValueOnce(undefined);
      const result = await getInsuranceByIdService(999);
      expect(result).toBeUndefined();
    });
  });

  describe("getInsuranceService", () => {
    it("should return all insurances", async () => {
      const insurances = [
        { insuranceID: 1, policyNumber: "P1" },
        { insuranceID: 2, policyNumber: "P2" }
      ];
      (db.query.InsuranceTable.findMany as jest.Mock).mockResolvedValueOnce(insurances);

      const result = await getInsuranceService();
      expect(result).toEqual(insurances);
    });

    it("should return empty array if no insurance found", async () => {
      (db.query.InsuranceTable.findMany as jest.Mock).mockResolvedValueOnce([]);

      const result = await getInsuranceService();
      expect(result).toEqual([]);
    });
  });

  describe("updateInsuranceService", () => {
    it("should update an insurance and return success message", async () => {
      (db.update as jest.Mock).mockReturnValueOnce({
        set: jest.fn().mockReturnValueOnce({
          where: jest.fn().mockReturnValueOnce({
            returning: jest.fn().mockResolvedValueOnce([{}])
          })
        })
      });

      const insurance: TIInsurance = {
         carID: 1, 
         insuranceProvider: "ABC Insurance", 
         policyNumber: "12345", 
         startDate: "2024-01-01", 
         endDate: "2024-12-31" 
      };

      const result = await updateInsuranceService(1, insurance);
      expect(result).toBe("Insurance updated successfully");
    });

    it("should return null if update fails", async () => {
      (db.update as jest.Mock).mockReturnValueOnce({
        set: jest.fn().mockReturnValueOnce({
          where: jest.fn().mockReturnValueOnce({
            returning: jest.fn().mockResolvedValueOnce([])
          })
        })
      });

      const result = await updateInsuranceService(999, {
         carID: 1, 
         insuranceProvider: "ABC Insurance", 
         policyNumber: "12345", 
         startDate: "2024-01-01", 
         endDate: "2024-12-31" 
      });

      expect(result).toBeNull();
    });
  });

  describe("deleteInsuranceService", () => {
    it("should delete an insurance and return success message", async () => {
      (db.delete as jest.Mock).mockReturnValueOnce({
        where: jest.fn().mockReturnValueOnce({
          returning: jest.fn().mockResolvedValueOnce([{}])
        })
      });

      const result = await deleteInsuranceService(1);
      expect(result).toBe("Insurance deleted successfully");
    });

    it("should return null if delete fails", async () => {
      (db.delete as jest.Mock).mockReturnValueOnce({
        where: jest.fn().mockReturnValueOnce({
          returning: jest.fn().mockResolvedValueOnce([])
        })
      });

      const result = await deleteInsuranceService(999);
      expect(result).toBeNull();
    });
  });
});
