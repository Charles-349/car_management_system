import request from "supertest";
import app from "../../src/index";
import db from "../../src/drizzle/db";
import { MaintenanceTable, CarTable } from "../../src/drizzle/schema";
import { eq } from "drizzle-orm";

let carId: number;
let maintenanceId: number;

beforeAll(async () => {
  const [car] = await db.insert(CarTable).values({
    carModel: "Toyota Corolla",
    year: "2020-01-01",
    color: "Silver",
    rentalRate: "50.00",
    availability: true,
  }).returning();
  carId = car.carID;

  const [maintenance] = await db.insert(MaintenanceTable).values({
    carID: carId,
    maintenanceDate: "2025-06-01",
    description: "Initial maintenance",
    cost: "99.99",
  }).returning();
  maintenanceId = maintenance.maintenanceID;
});

afterAll(async () => {
  await db.delete(MaintenanceTable).where(eq(MaintenanceTable.carID, carId));
  await db.delete(CarTable).where(eq(CarTable.carID, carId));
});

describe("Maintenance Routes Integration Tests", () => {
  describe("POST /maintenance", () => {
    it("should create a new maintenance record", async () => {
      const res = await request(app).post("/maintenance").send({
        carID: carId,
        maintenanceDate: "2025-07-01",
        description: "Oil change",
        cost: "99.99",
      });
      expect(res.status).toBe(201);
      expect(res.body.maintenance).toBeDefined();
      expect(res.body.maintenance.description).toBe("Oil change");
    });

    it("should return 500 if service throws error", async () => {
      const res = await request(app).post("/maintenance").send({
        carID: null,
      });
      expect(res.status).toBe(500);
    });
  });

  describe("GET /maintenance", () => {
    it("should retrieve all maintenance records", async () => {
      const res = await request(app).get("/maintenance");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.maintenances)).toBe(true);
    });
  });

  describe("GET /maintenance/:id", () => {
    it("should get maintenance by ID", async () => {
      const res = await request(app).get(`/maintenance/${maintenanceId}`);
      expect(res.status).toBe(200);
      expect(res.body.maintenance).toBeDefined();
      expect(res.body.maintenance.maintenanceID).toBe(maintenanceId);
    });

    it("should return 400 for invalid ID", async () => {
      const res = await request(app).get("/maintenance/abc");
      expect(res.status).toBe(400);
    });

    it("should return 404 for non-existent ID", async () => {
      const res = await request(app).get("/maintenance/999999");
      expect(res.status).toBe(404);
    });
  });

  describe("PUT /maintenance/:id", () => {
    it("should update a maintenance record", async () => {
      const res = await request(app).put(`/maintenance/${maintenanceId}`).send({
        description: "Updated maintenance",
        cost: "150.00",
      });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Maintenance updated successfully");

    });

    it("should return 404 for invalid ID", async () => {
      const res = await request(app).put("/maintenance/abc").send({});
      expect(res.status).toBe(404);
    });

    it("should return 404 if record not found", async () => {
      const res = await request(app).put("/maintenance/999999").send({
        description: "Nonexistent",
      });
      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /maintenance/:id", () => {
    it("should delete the maintenance record", async () => {
      const res = await request(app).delete(`/maintenance/${maintenanceId}`);
      expect(res.status).toBe(200);
    });

    it("should return 404 for invalid ID", async () => {
      const res = await request(app).delete("/maintenance/abc");
      expect(res.status).toBe(404);
    });

    it("should return 404 for non-existent record", async () => {
      const res = await request(app).delete("/maintenance/999999");
      expect(res.status).toBe(404);
    });
  });
});
