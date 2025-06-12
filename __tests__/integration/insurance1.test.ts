import request from "supertest";
import app from "../../src/index";
import db from "../../src/drizzle/db";
import { CarTable, InsuranceTable } from "../../src/drizzle/schema";
import { eq } from "drizzle-orm";
import * as insuranceService from "../../src/insurance/insurance.service";

let testCarID: number;
let insuranceID: number;

describe("Insurance Integration Routes", () => {
  beforeAll(async () => {
    const carResult = await db
      .insert(CarTable)
      .values({
        carModel: "Test Model X",
        year: "2022-01-01",
        color: "Blue",
        rentalRate: "99.99",
        availability: true
      })
      .returning();

    testCarID = carResult[0].carID;
  });

  afterAll(async () => {
    await db.delete(InsuranceTable).where(eq(InsuranceTable.carID, testCarID));
    await db.delete(CarTable).where(eq(CarTable.carID, testCarID));
  });

  it("should create a new insurance", async () => {
    const res = await request(app).post("/insurance").send({
      carID: testCarID,
      insuranceProvider: "Test Insurance Co",
      policyNumber: "TEST123456",
      startDate: "2025-01-01",
      endDate: "2026-01-01"
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.insurance).toBeDefined();
    insuranceID = res.body.insurance.insuranceID;
  });

  it("should return 500 on create with missing fields", async () => {
    const res = await request(app).post("/insurance").send({});
    expect(res.statusCode).toBe(500);
  });

  it("should catch error in create controller", async () => {
    const spy = jest
      .spyOn(insuranceService, "createInsuranceService")
      .mockImplementationOnce(() => {
        throw new Error("Forced error");
      });

    const res = await request(app).post("/insurance").send({
      carID: testCarID,
      insuranceProvider: "Bad Insurance",
      policyNumber: "BAD123",
      startDate: "2025-03-01",
      endDate: "2026-03-01"
    });

    expect(res.statusCode).toBe(500);
    spy.mockRestore();
  });

  it("should get all insurances", async () => {
    const res = await request(app).get("/insurance");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.insurances)).toBe(true);
  });

  it("should return 404 when no insurances exist", async () => {
    await db.delete(InsuranceTable);
    const res = await request(app).get("/insurance");
    expect(res.statusCode).toBe(404);
  });

  it("should get insurance by ID", async () => {
    const inserted = await db.insert(InsuranceTable).values({
      carID: testCarID,
      insuranceProvider: "Temp Insurance",
      policyNumber: "TMP001",
      startDate: "2025-01-01",
      endDate: "2026-01-01"
    }).returning();

    const res = await request(app).get(`/insurance/${inserted[0].insuranceID}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.insurance).toBeDefined();

    insuranceID = inserted[0].insuranceID; // set insuranceID again for update/delete tests
  });

  it("should return 400 for invalid ID format", async () => {
    const res = await request(app).get("/insurance/notanid");
    expect(res.statusCode).toBe(400);
  });

  it("should return 404 for non-existent insurance ID", async () => {
    const res = await request(app).get("/insurance/999999");
    expect(res.statusCode).toBe(404);
  });

  it("should update insurance", async () => {
    const res = await request(app)
      .put(`/insurance/${insuranceID}`)
      .send({ insuranceProvider: "Updated Insurance Co" });

    expect(res.statusCode).toBe(200);
    expect(res.body.updatedInsurance).toBe("Insurance updated successfully");
  });

  it("should return 404 when updating non-existent insurance", async () => {
    const res = await request(app)
      .put("/insurance/999999")
      .send({ insuranceProvider: "Nonexistent" });

    expect(res.statusCode).toBe(404);
  });

  it("should delete insurance", async () => {
    const res = await request(app).delete(`/insurance/${insuranceID}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Insurance deleted successfully");
  });

  it("should return 404 when deleting non-existent insurance", async () => {
    const res = await request(app).delete("/insurance/999999");
    expect(res.statusCode).toBe(404);
  });

  it("should return 404 for invalid delete ID", async () => {
    const res = await request(app).delete("/insurance/invalid-id");
    expect(res.statusCode).toBe(404);
  });

  it("should catch delete error", async () => {
    const inserted = await db.insert(InsuranceTable).values({
      carID: testCarID,
      insuranceProvider: "Err Ins",
      policyNumber: "ERR321",
      startDate: "2025-01-01",
      endDate: "2026-01-01"
    }).returning();

    const spy = jest
      .spyOn(insuranceService, "deleteInsuranceService")
      .mockImplementationOnce(() => {
        throw new Error("Delete error");
      });

    const res = await request(app).delete(`/insurance/${inserted[0].insuranceID}`);
    expect(res.statusCode).toBe(500);
    spy.mockRestore();
  });
});
