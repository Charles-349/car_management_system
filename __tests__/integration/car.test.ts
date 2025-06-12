import request from 'supertest';
import app from '../../src/index';
import db from "../../src/drizzle/db";
import { CarTable } from "../../src/drizzle/schema";
import { eq } from 'drizzle-orm';

const validCar = {
  carModel: "Toyota Corolla",
  year: "2020-01-01",
  color: "Red",
  rentalRate: "50.00",
  availability: true,
  locationID: 1
};

let carId: number;

beforeAll(async () => {
 
  const [car] = await db.insert(CarTable).values({
    ...validCar
  }).returning();
  carId = car.carID;
});

afterAll(async () => {
  await db.delete(CarTable).where(eq(CarTable.carID, carId));
  await db.$client.end();
});

describe("Car Controller Integration Tests", () => {
  describe("POST /car", () => {
    it("should create a car and return a success message", async () => {
      const res = await request(app).post("/car").send(validCar);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("message", "Car created successfully");
    });

    it("should not create a car with missing required fields", async () => {
      const res = await request(app).post("/car").send({
        year: "2020-01-01", // missing required fields
        color: "Blue",
      });

      expect(res.statusCode).toBe(500); 
      expect(res.body).toHaveProperty("message", "car not created");
    });
  });

  describe("GET /car", () => {
    it("should return all cars", async () => {
      const res = await request(app).get("/car");

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "Cars retrieved successfully");
      expect(Array.isArray(res.body.cars)).toBe(true);
    });
  });

  describe("GET /car/:id", () => {
    it("should return a single car by ID", async () => {
      const res = await request(app).get(`/car/${carId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "Car retrieved successfully");
      expect(res.body).toHaveProperty("car");
    });

    it("should return 404 for non-existing car ID", async () => {
      const res = await request(app).get("/car/999999");

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message", "Car not found");
    });

    it("should return 400 for invalid car ID", async () => {
      const res = await request(app).get("/car/abc");

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message", "Invalid car ID");
    });
  });

  describe("PUT /car/:id", () => {
    it("should update an existing car", async () => {
      const res = await request(app).put(`/car/${carId}`).send({
        carModel: "Toyota Camry",
        year: "2021-01-01",
        color: "Black",
        rentalRate: "60.00",
        availability: false,
        locationID: 1
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "Car updated successfully");
    });

    it("should return 404 when updating a non-existing car", async () => {
      const res = await request(app).put(`/car/999999`).send(validCar);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message", "Car not found");
    });

    it("should return 404 for invalid ID", async () => {
      const res = await request(app).put(`/car/abc`).send(validCar);

      expect(res.statusCode).toBe(404); 
      expect(res.body).toHaveProperty("message", "Invalid car ID");
    });
  });

  describe("DELETE /car/:id", () => {
    let tempCarID: number;

    beforeAll(async () => {
      const [car] = await db.insert(CarTable).values(validCar).returning();
      tempCarID = car.carID;
    });

    it("should delete a car successfully", async () => {
      const res = await request(app).delete(`/car/${tempCarID}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "Car deleted successfully");
    });

    it("should return 404 for non-existing car", async () => {
      const res = await request(app).delete("/car/999999");

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message", "Car not deleted");
    });

    it("should return 404 for invalid ID", async () => {
      const res = await request(app).delete("/car/xyz");

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message", "Invalid car ID");
    });
  });
});
