// __tests__/integration/booking.test.ts
import request from "supertest";
import app from "../../src/index";
import db from "../../src/drizzle/db";
import { BookingsTable, CarTable, CustomerTable } from "../../src/drizzle/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

let userToken: string;
let adminToken: string;
let customerID: number;
let carID: number;
let bookingID: number;

const testUser = {
  firstName: "Test",
  lastName: "User",
  email: "user@example.com",
  password: "UserPass123",
};

const testAdmin = {
  firstName: "Admin",
  lastName: "User",
  email: "admin@example.com",
  password: "AdminPass123",
  role: "admin",
};

const testCar = {
  carModel: "Toyota Prius",
  year: "2022-01-01",
  color: "Blue",
  rentalRate: "120.00",
};

beforeAll(async () => {
  await db.delete(BookingsTable);
  await db.delete(CarTable);
  await db.delete(CustomerTable);

  const hashedPassword = await bcrypt.hash(testUser.password, 10);
  const [user] = await db.insert(CustomerTable).values({ ...testUser, password: hashedPassword, isVerified: true }).returning();
  customerID = user.customerID;

  const hashedAdminPassword = await bcrypt.hash(testAdmin.password, 10);
  await db.insert(CustomerTable).values({
    firstName: testAdmin.firstName,
    lastName: testAdmin.lastName,
    email: testAdmin.email,
    password: hashedAdminPassword,
    isVerified: true,
    role: "admin",
  });

  const [car] = await db.insert(CarTable).values({ ...testCar }).returning();
  carID = car.carID;

  const loginUserRes = await request(app).post("/customer/login").send({ email: testUser.email, password: testUser.password });
  userToken = loginUserRes.body.token;

  const loginAdminRes = await request(app).post("/customer/login").send({ email: testAdmin.email, password: testAdmin.password });
  adminToken = loginAdminRes.body.token;
});

describe("Booking Integration Tests", () => {
  it("should create a booking", async () => {
    const res = await request(app)
      .post("/booking")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        carID,
        customerID,
        rentalStartDate: "2025-06-15",
        rentalEndDate: "2025-06-20",
        totalAmount: "600.00"
      });

    expect(res.status).toBe(201);
    expect(res.body.booking).toBeDefined();
    bookingID = res.body.booking.bookingID;
  });

  it("should fail to create a booking without token", async () => {
    const res = await request(app).post("/booking").send({
      carID,
      customerID,
      rentalStartDate: "2025-06-15",
      rentalEndDate: "2025-06-20",
      totalAmount: "600.00"
    });
    expect(res.status).toBe(401);
  });

  it("should fail to create a booking with missing fields", async () => {
    const res = await request(app)
      .post("/booking")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ carID });
    expect(res.status).toBe(500);
  });

  it("should get all bookings (admin only)", async () => {
    const res = await request(app).get("/booking").set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.bookings.length).toBeGreaterThan(0);
  });

  it("should not allow non-admin to get all bookings", async () => {
    const res = await request(app).get("/booking").set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(401);
  });

  it("should get booking by ID", async () => {
    const res = await request(app).get(`/booking/${bookingID}`).set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.booking.bookingID).toBe(bookingID);
  });

  it("should return 404 for non-existent booking ID", async () => {
    const res = await request(app).get(`/booking/999999`).set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(404);
  });

  it("should get bookings by customer ID", async () => {
    const res = await request(app).get(`/booking/customer/${customerID}`).set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.bookings[0].customerID).toBe(customerID);
  });

  it("should return empty for invalid customer ID", async () => {
    const res = await request(app).get(`/booking/customer/999999`).set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(404);
    expect(res.body.bookings??[]).toHaveLength(0);
  });

  it("should update a booking", async () => {
    const res = await request(app)
      .put(`/booking/${bookingID}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        rentalStartDate: "2025-06-16",
        rentalEndDate: "2025-06-21",
        totalAmount: "650.00"
      });
    expect(res.status).toBe(200);
    expect(res.body.booking.totalAmount).toBe("650.00");
  });

  it("should not update booking with invalid ID", async () => {
    const res = await request(app)
      .put(`/booking/999999`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        rentalStartDate: "2025-06-16",
        rentalEndDate: "2025-06-21",
        totalAmount: "650.00"
      });
    expect(res.status).toBe(404);
  });

  it("should delete a booking (admin only)", async () => {
    const res = await request(app).delete(`/booking/${bookingID}`).set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Booking deleted successfully");
  });

  it("should not allow user to delete booking", async () => {
    const res = await request(app).delete(`/booking/${bookingID}`).set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(401);
  });

  it("should return 404 when deleting non-existent booking", async () => {
    const res = await request(app).delete(`/booking/999999`).set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });
});

afterAll(async () => {
  await db.delete(BookingsTable);
  await db.delete(CarTable);
  await db.delete(CustomerTable);
});
