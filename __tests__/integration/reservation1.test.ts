import request from "supertest";
import app from "../../src/index"; 
import db from "../../src/drizzle/db";
import { ReservationTable, CustomerTable, CarTable } from "../../src/drizzle/schema";
import { eq } from "drizzle-orm";

let reservationId: number;
let customerId: number;
let carId: number;

beforeAll(async () => {
  // Clean up and seed required data
  await db.delete(ReservationTable);
  await db.delete(CustomerTable);
  await db.delete(CarTable);

  const [customer] = await db
    .insert(CustomerTable)
    .values({
      firstName: "Test",
      lastName: "User",
      email: "testuser@example.com",
      password: "hashedpassword",
    })
    .returning();

  customerId = customer.customerID;

  const [car] = await db
    .insert(CarTable)
    .values({
      carModel: "Toyota",
      year: "2022-01-01",
      rentalRate: "100.00",
    })
    .returning();

  carId = car.carID;
});

afterAll(async () => {
  await db.delete(ReservationTable);
  await db.delete(CustomerTable);
  await db.delete(CarTable);
});

describe("Reservation Routes Integration", () => {
  test("Create a reservation", async () => {
    const res = await request(app).post("/reservation").send({
      customerID: customerId,
      carID: carId,
      reservationDate: "2025-06-15",
      pickupDate: "2025-06-20",
      returnDate: "2025-06-25",
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("reservationID");
    reservationId = res.body.reservationID;
  });

  test("Get all reservations", async () => {
    const res = await request(app).get("/reservation");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test("Get reservation by ID", async () => {
    const res = await request(app).get(`/reservation/${reservationId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("reservationID", reservationId);
  });

  test("Update reservation by ID", async () => {
    const res = await request(app).put(`/reservation/${reservationId}`).send({
      reservationDate: "2025-06-16",
      pickupDate: "2025-06-21",
      returnDate: "2025-06-26",
    });

    expect(res.status).toBe(200);
    const updated = Array.isArray(res.body) ? res.body[0] : res.body;

    expect(updated).toHaveProperty("reservationDate");

    const date = new Date(updated.reservationDate);
    expect(date.toISOString().startsWith("2025-06-16")).toBe(true);
  });

  test("Delete reservation by ID", async () => {
    const res = await request(app).delete(`/reservation/${reservationId}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Reservation deleted successfully");
  });

  test("Get non-existent reservation by ID", async () => {
    const res = await request(app).get(`/reservation/99999`);
    expect(res.status).toBe(404);
  });

  test("Update non-existent reservation", async () => {
    const res = await request(app).put(`/reservation/99999`).send({
      reservationDate: "2025-06-16",
    });
    expect(res.status).toBe(404);
  });

  test("Delete non-existent reservation", async () => {
    const res = await request(app).delete(`/reservation/99999`);
    expect(res.status).toBe(404);
  });

  test("Invalid reservation ID format", async () => {
    const res = await request(app).get(`/reservation/invalid`);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid reservation ID");
  });
});
