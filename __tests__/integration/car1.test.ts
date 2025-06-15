import request from "supertest";
import app from "../../src/index";
import db from "../../src/drizzle/db";
import drizzle from "../../src/drizzle/db"; 
import { CarTable, LocationTable } from "../../src/drizzle/schema"; 
import { eq } from "drizzle-orm";

let testLocationId: number;
let carId: number;

beforeAll(async () => {
  // Setup: create a location
  const [loc] = await drizzle.insert(LocationTable).values({
    locationName: "Nairobi Branch",
    address: "123 CBD, Nairobi",
    contactNumber: "0712345678"
  }).returning();

  testLocationId = loc.locationID;
});

afterAll(async () => {
  await drizzle.delete(CarTable);
  await drizzle.delete(LocationTable);
  await db.$client.end(); // properly close the pg client
});

describe("Car Integration Routes", () => {
  it("should create a new car", async () => {
    const res = await request(app).post("/car").send({
      carModel: "Toyota Corolla",
      year: "2022-01-01",
      color: "White",
      rentalRate: "4500.00",
      availability: true,
      locationID: testLocationId
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Car created successfully");

    // Store carId for later use
    const cars = await drizzle.select().from(CarTable).where(eq(CarTable.carModel, "Toyota Corolla"));
    carId = cars[0].carID;
  });

  it("should fail to create a car with missing fields", async () => {
    const res = await request(app).post("/car").send({
      color: "White",
      availability: true,
      locationID: testLocationId
    });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBeDefined();
  });

  it("should fetch all cars", async () => {
    const res = await request(app).get("/car");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.cars)).toBe(true);
    expect(res.body.cars.length).toBeGreaterThan(0);
  });

  it("should fetch a car by ID", async () => {
    const res = await request(app).get(`/car/${carId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.car.carID).toBe(carId);
  });

  it("should return 400 for invalid car ID", async () => {
    const res = await request(app).get("/car/invalid");
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid car ID");
  });

  it("should return 404 for non-existent car ID", async () => {
    const res = await request(app).get("/car/99999");
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Car not found");
  });

  it("should update a car by ID", async () => {
    const res = await request(app).put(`/car/${carId}`).send({
      color: "Black",
      rentalRate: "5000.00"
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Car updated successfully");
  });

  it("should fail to update a car with invalid ID", async () => {
    const res = await request(app).put("/car/abc").send({ color: "Red" });
    expect(res.statusCode).toBe(404);
  });

  it("should return 404 when updating a non-existent car", async () => {
    const res = await request(app).put("/car/99999").send({ color: "Red" });
    expect(res.statusCode).toBe(404);
  });

  it("should delete a car by ID", async () => {
    const res = await request(app).delete(`/car/${carId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Car deleted successfully");
  });

  it("should return 404 for invalid car ID during deletion", async () => {
    const res = await request(app).delete("/car/invalid");
    expect(res.statusCode).toBe(404);
  });

  it("should return 404 when deleting a non-existent car", async () => {
    const res = await request(app).delete("/car/99999");
    expect(res.statusCode).toBe(404);
  });
});
