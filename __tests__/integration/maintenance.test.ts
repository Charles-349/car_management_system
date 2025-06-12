import request from "supertest";
import app from "../../src/index";
import db from "../../src/drizzle/db"; 
import { MaintenanceTable } from "../../src/drizzle/schema";
import { eq } from "drizzle-orm";

// Sample data factory
const testData = {
  carID: 1, 
  maintenanceDate: "2024-06-12",
  description: "Oil change",
  cost: "120.50"
};

describe("Maintenance Route Integration Tests", () => {
  let maintenanceId: number;
  beforeAll(async () => {
    await db.delete(MaintenanceTable); // Clear previous data
  });

  it("should create a maintenance record", async () => {
    const res = await request(app).post("/maintenance").send(testData);
    expect(res.statusCode).toBe(201);
    expect(res.body.maintenance).toHaveProperty("maintenanceID");
    maintenanceId = res.body.maintenance.maintenanceID;
  });

  it("should retrieve all maintenance records", async () => {
    const res = await request(app).get("/maintenance");
    expect(res.statusCode).toBe(200);
    expect(res.body.maintenances).toBeInstanceOf(Array);
    expect(res.body.maintenances.length).toBeGreaterThan(0);
  });

  it("should retrieve a maintenance record by ID", async () => {
    const res = await request(app).get(`/maintenance/${maintenanceId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.maintenance).toHaveProperty("maintenanceID", maintenanceId);
  });

  it("should return 400 for invalid ID on get", async () => {
    const res = await request(app).get("/maintenance/invalid");
    expect(res.statusCode).toBe(400);
  });

  it("should return 404 for non-existent maintenance record", async () => {
    const res = await request(app).get("/maintenance/999999");
    expect(res.statusCode).toBe(404);
  });

  it("should update a maintenance record", async () => {
    const res = await request(app).put(`/maintenance/${maintenanceId}`).send({
      description: "Brake pad replacement",
      cost: "200.00"
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.updatedMaintenance.description).toBe("Brake pad replacement");
  });

  it("should return 404 for update with invalid ID", async () => {
    const res = await request(app).put("/maintenance/invalid").send({ cost: "100.00" });
    expect(res.statusCode).toBe(404);
  });

  it("should return 404 for update of non-existent record", async () => {
    const res = await request(app).put("/maintenance/999999").send({ cost: "100.00" });
    expect(res.statusCode).toBe(404);
  });

  it("should delete a maintenance record", async () => {
    const res = await request(app).delete(`/maintenance/${maintenanceId}`);
    expect(res.statusCode).toBe(200);
  });

  it("should return 404 for deleting non-existent record", async () => {
    const res = await request(app).delete(`/maintenance/${maintenanceId}`);
    expect(res.statusCode).toBe(404);
  });

  it("should return 404 for delete with invalid ID", async () => {
    const res = await request(app).delete("/maintenance/invalid");
    expect(res.statusCode).toBe(404);
  });
});
