// tests/integration/payment.test.ts
import request from "supertest";
import app from "../../src/index";
import db from "../../src/drizzle/db";
import { BookingsTable, PaymentTable, CarTable } from "../../src/drizzle/schema";
import { eq } from "drizzle-orm";

let bookingId: number;
let paymentId: number



const bookingTest ={
  carID:1,
  customerID:1,
  rentalStartDate:'2025-3-4',
  rentalEndDate:'2025-01-01',
  totalAmount:'4000.00'

}

beforeAll(async () => {
    
  const [booking] = await db.insert(BookingsTable).values({
    ...bookingTest
  }).returning();
  bookingId = booking.bookingID;
});

afterAll(async () => {
  await db.delete(PaymentTable).where(eq(PaymentTable.paymentID,paymentId));
  await db.delete(BookingsTable).where(eq(BookingsTable.bookingID,bookingId));
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
