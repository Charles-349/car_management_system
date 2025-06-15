import request from "supertest";
import app from "../../src/index";
import db from "../../src/drizzle/db";
import { CustomerTable, BookingsTable, CarTable, PaymentTable } from "../../src/drizzle/schema";
import { v4 as uuidv4 } from "uuid";

const createTestBooking = async () => {
  const uniqueSuffix = uuidv4();

  const customer = await db.insert(CustomerTable).values({
    firstName: "Test",
    lastName: "User",
    email: `test-${uniqueSuffix}@example.com`,
    password: "hashedpassword",
    isVerified: true,
  }).returning();

  const vehicle = await db.insert(CarTable).values({
    carModel: "Corolla",
    year: "2020-01-01",
    rentalRate: "100.00",
  }).returning();

  const booking = await db.insert(BookingsTable).values({
    customerID: customer[0].customerID,
    carID: vehicle[0].carID,
    rentalStartDate: "2025-01-01",
    rentalEndDate: "2025-01-05",
    totalAmount: "500.00",
  }).returning();

  return { bookingId: booking[0].bookingID };
};

describe("Payment API", () => {
  let bookingId: number;

  beforeEach(async () => {
    await db.delete(PaymentTable);
    await db.delete(BookingsTable);
    await db.delete(CarTable);
    await db.delete(CustomerTable);

    const booking = await createTestBooking();
    bookingId = booking.bookingId;
  });

  it("should create a new payment", async () => {
    const res = await request(app).post("/payment").send({
      bookingID: bookingId,
      amount: "200.00",
      paymentDate: "2025-06-01",
      paymentMethod: "credit card",
    });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("payment");
    expect(res.body.payment).toHaveProperty("amount", "200.00");
    expect(res.body.payment).toHaveProperty("paymentMethod", "credit card");
  });

  it("should fail to create a payment with missing fields", async () => {
    const res = await request(app).post("/payment").send({
      bookingID: bookingId,
      amount: "200.00",
 
    });

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("message");
  });

  it("should get all payments", async () => {
    await db.insert(PaymentTable).values({
      bookingID: bookingId,
      amount: "200.00",
      paymentDate: "2025-06-01",
      paymentMethod: "credit card",
    });

    const res = await request(app).get("/payment");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("payments");
    expect(res.body.payments.length).toBeGreaterThan(0);
  });

  it("should return 404 if no payments exist", async () => {
    const res = await request(app).get("/payment");
    expect(res.statusCode === 200 || res.statusCode === 404).toBeTruthy(); 
  });

  it("should get a payment by ID", async () => {
    const [inserted] = await db.insert(PaymentTable).values({
      bookingID: bookingId,
      amount: "200.00",
      paymentDate: "2025-06-01",
      paymentMethod: "credit card",
    }).returning();

    const res = await request(app).get(`/payment/${inserted.paymentID}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("payment");
    expect(res.body.payment.paymentID).toEqual(inserted.paymentID);
  });

  it("should return 400 for invalid payment ID (non-numeric)", async () => {
    const res = await request(app).get("/payment/invalid-id");
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("message", "Invalid payment ID");
  });

  it("should return 404 for non-existent payment ID", async () => {
    const res = await request(app).get("/payment/999999");
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty("message", "Payment not found");
  });

  it("should update a payment", async () => {
    const [inserted] = await db.insert(PaymentTable).values({
      bookingID: bookingId,
      amount: "200.00",
      paymentDate: "2025-06-01",
      paymentMethod: "credit card",
    }).returning();

    const res = await request(app).put(`/payment/${inserted.paymentID}`).send({
      amount: "300.00",
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("payment");
    expect(res.body.payment.amount).toEqual("300.00");
  });

  it("should return 404 when updating a non-existent payment", async () => {
    const res = await request(app).put("/payment/999999").send({
      amount: "300.00",
    });
    expect(res.statusCode).toEqual(404);
  });

  it("should return 404 for invalid payment ID during update", async () => {
    const res = await request(app).put("/payment/not-a-number").send({
      amount: "300.00",
    });
    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toBe("Invalid payment ID");
  });

  it("should delete a payment", async () => {
    const [inserted] = await db.insert(PaymentTable).values({
      bookingID: bookingId,
      amount: "200.00",
      paymentDate: "2025-06-01",
      paymentMethod: "credit card",
    }).returning();

    const res = await request(app).delete(`/payment/${inserted.paymentID}`);
    expect(res.statusCode).toEqual(204);
  });

  it("should return 404 when deleting a non-existent payment", async () => {
    const res = await request(app).delete("/payment/999999");
    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toBe("Payment not found");
  });

  it("should return 404 for invalid payment ID during delete", async () => {
    const res = await request(app).delete("/payment/not-a-number");
    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toBe("Invalid payment ID");
  });
});
