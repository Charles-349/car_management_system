import request from 'supertest';
import app from '../../src/index';
import db from "../../src/drizzle/db";
import { InsuranceTable } from "../../src/drizzle/schema";
import { eq } from "drizzle-orm";

const testInsurance = {
  insuranceProvider: "ABC Insurance",
  policyNumber: "XYZ123456",
  startDate: "2024-01-01",
  endDate: "2025-01-01",
  carID: 1
};

let insuranceID: number;

beforeAll(async () => {
  const [insurance] = await db.insert(InsuranceTable).values(testInsurance).returning();
  insuranceID = insurance.insuranceID;
});

afterAll(async () => {
  await db.delete(InsuranceTable).where(eq(InsuranceTable.insuranceID, insuranceID));
  await db.$client.end();
});

describe("Insurance Integration Tests", () => {
  it("should create a new insurance", async () => {
    const res = await request(app).post("/insurance").send({
      ...testInsurance,
      policyNumber: "NEW987654"
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message", "Insurance created successfully");
    expect(res.body.insurance).toHaveProperty("policyNumber", "NEW987654");

    // Cleanup
    await db.delete(InsuranceTable).where(eq(InsuranceTable.insuranceID, res.body.insurance.insuranceID));
  });

  it("should fail to create insurance with missing fields", async () => {
    const res = await request(app).post("/insurance").send({
      insuranceProvider: "Incomplete Insurance"
    });

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error", "Failed to create insurance");
  });

  it("should retrieve all insurances", async () => {
    const res = await request(app).get("/insurance");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Insurances retrieved successfully");
    expect(Array.isArray(res.body.insurances)).toBe(true);
  });

  it("should get insurance by ID", async () => {
    const res = await request(app).get(`/insurance/${insuranceID}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("insurance");
    expect(res.body.insurance.insuranceID).toBe(insuranceID);
  });

  it("should return 404 for invalid insurance ID on get", async () => {
    const res = await request(app).get("/insurance/999999");
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Insurance not found");
  });

  it("should update insurance by ID", async () => {
    const res = await request(app).put(`/insurance/${insuranceID}`).send({
      ...testInsurance,
     policyNumber: "updated policy",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Insurance updated successfully");
    expect(res.body.updatedInsurance.policyNumber).toBe("Updated policy");
  });

  it("should delete insurance by ID", async () => {
    const [temp] = await db.insert(InsuranceTable).values({
      ...testInsurance,
      policyNumber: "DEL999"
    }).returning();

    const res = await request(app).delete(`/insurance/${temp.insuranceID}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Insurance deleted successfully");
  });

  it("should return 404 when deleting non-existent insurance", async () => {
    const res = await request(app).delete("/insurance/999999");
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Insurance not found");
  });
});
