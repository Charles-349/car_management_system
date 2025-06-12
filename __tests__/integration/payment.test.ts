// tests/integration/payment.test.ts
import request from "supertest";
import app from "../../src/index";
import db from "../../src/drizzle/db";
import { BookingsTable, PaymentTable, CarTable } from "../../src/drizzle/schema";

let bookingId: number;
let paymentId: number;


// const testCar = {
//    carModel: "Toyota Corolla", 
//    year: "2020-01-01", 
//    color: "Red", 
//    rentalRate: "50.00", 
//    availability: true, 
//    locationID: 1 
// }

beforeAll(async () => {
    // const [car] = await db.insert(CarTable).values({
    //     ...testCar,
    // }).returning();
    // carID = car.carID;
  // Create a valid booking to associate with a payment
  const [booking] = await db.insert(BookingsTable).values({
    carID: 1,
    customerId: 1, // Change to match the actual property name in your schema (e.g., customerId or userId)
    rentalStartDate: new Date(),
    rentalEndDate: new Date(),
    totalAmount: 500
  }).returning();
  bookingId = booking.bookingID;
});

afterAll(async () => {
  await db.delete(PaymentTable);
  await db.delete(BookingsTable);
  await db.$client.end();
});

describe("Payment Controller Integration Tests", () => {
  it("should create a payment", async () => {
    const res = await request(app).post("/payment").send({
      bookingID: bookingId,
      paymentDate: new Date().toISOString(),
      amount: 500,
      paymentMethod: "cash"
    });

    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/created/i);

    // Save payment ID for future tests
    const getRes = await request(app).get("/payment");
    paymentId = getRes.body.payments[0].paymentID;
  });

  it("should get all payments", async () => {
    const res = await request(app).get("/payment");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.payments)).toBe(true);
    expect(res.body.payments.length).toBeGreaterThan(0);
  });

  it("should get payment by ID", async () => {
    const res = await request(app).get(`/payment/${paymentId}`);

    expect(res.status).toBe(200);
    expect(res.body.payment.paymentID).toBe(paymentId);
  });

  it("should return 400 for invalid payment ID", async () => {
    const res = await request(app).get("/payment/invalid");

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it("should return 404 for non-existent payment", async () => {
    const res = await request(app).get("/payment/999999");

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });

  it("should update a payment", async () => {
    const res = await request(app).put(`/payment/${paymentId}`).send({
      amount: 600,
      paymentMethod: "card"
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/updated/i);
  });

  it("should return 404 on update with invalid ID", async () => {
    const res = await request(app).put("/payment/invalid-id").send({
      amount: 123
    });

    expect(res.status).toBe(404);
  });

  it("should return 404 on updating non-existent payment", async () => {
    const res = await request(app).put("/payment/999999").send({
      amount: 123
    });

    expect(res.status).toBe(404);
  });

  it("should delete a payment", async () => {
    const res = await request(app).delete(`/payment/${paymentId}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });

  it("should return 404 on delete with invalid ID", async () => {
    const res = await request(app).delete("/payment/invalid-id");

    expect(res.status).toBe(404);
  });

  it("should return 404 on deleting non-existent payment", async () => {
    const res = await request(app).delete("/payment/999999");

    expect(res.status).toBe(404);
  });
});
