import request from "supertest";
import app from "../../src/index";
import db from "../../src/drizzle/db";
import { BookingsTable, ReservationTable } from "../../src/drizzle/schema";

let bookingId: number;
let reservationId: number;

beforeAll(async () => {
  // Insert a mock booking (needed for FK)
  const [booking] = await db.insert(BookingsTable).values({
    carId: 1,
    customerID: 1,
    rentalStartDate: new Date(),
    rentalEndDate: new Date(),
    totalAmount: 300,
  }).returning();
  bookingId = booking.bookingID;
});

afterAll(async () => {
  await db.delete(ReservationTable);
  await db.delete(BookingsTable);
  await db.$client.end();
});

describe("Reservation Integration Tests", () => {
  it("should create a reservation", async () => {
    const res = await request(app).post("/reservation").send({
      bookingID: bookingId,
      reservationDate: new Date().toISOString(),
      status: "confirmed",
    });

    expect(res.status).toBe(201);
    expect(res.body.bookingID).toBe(bookingId);
    reservationId = res.body.reservationID;
  });

  it("should fetch all reservations", async () => {
    const res = await request(app).get("/reservation");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("should fetch a reservation by ID", async () => {
    const res = await request(app).get(`/reservation/${reservationId}`);

    expect(res.status).toBe(200);
    expect(res.body.reservationID).toBe(reservationId);
  });

  it("should return 400 for invalid ID when fetching", async () => {
    const res = await request(app).get("/reservation/invalid-id");

    expect(res.status).toBe(400);
  });

  it("should return 404 for non-existent reservation ID", async () => {
    const res = await request(app).get("/reservation/999999");

    expect(res.status).toBe(404);
  });

  it("should update a reservation", async () => {
    const res = await request(app).put(`/reservation/${reservationId}`).send({
      status: "cancelled"
    });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("cancelled");
  });

  it("should return 400 for invalid ID when updating", async () => {
    const res = await request(app).put("/reservation/invalid").send({
      status: "pending"
    });

    expect(res.status).toBe(400);
  });

  it("should return 404 when updating non-existent reservation", async () => {
    const res = await request(app).put("/reservation/999999").send({
      status: "confirmed"
    });

    expect(res.status).toBe(404);
  });

  it("should delete a reservation", async () => {
    const res = await request(app).delete(`/reservation/${reservationId}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted successfully/i);
  });

  it("should return 400 for invalid ID when deleting", async () => {
    const res = await request(app).delete("/reservation/invalid");

    expect(res.status).toBe(400);
  });

  it("should return 404 when deleting non-existent reservation", async () => {
    const res = await request(app).delete(`/reservation/${reservationId}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/not found or already deleted/i);
  });
});
