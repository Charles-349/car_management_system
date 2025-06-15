
import request from "supertest";
import app from "../../src/index";
import db from "../../src/drizzle/db";
import { CustomerTable, BookingsTable, ReservationTable } from "../../src/drizzle/schema";
import { eq } from "drizzle-orm";

// Mock mailer to avoid actual email sending
jest.mock("../../src/mailer/mailer", () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
}));

describe("Customer API Integration Tests", () => {
  let tempCustomerId: number;
  let tempEmail: string;
  let tempToken: string;

  beforeAll(async () => {
    console.log("Running beforeAll: Checking database connection");
    await db.select().from(CustomerTable).limit(1).execute();
  });

  beforeEach(async () => {
    console.log("Running beforeEach: Clearing database tables");
    await db.delete(BookingsTable).execute();
    await db.delete(ReservationTable).execute();
    await db.delete(CustomerTable).execute();

    tempEmail = `test${Date.now()}@example.com`;

    console.log("Creating customer with email:", tempEmail);
    const createRes = await request(app).post("/customer").send({
      email: tempEmail,
      password: "password123",
      firstName: "Test",
      lastName: "User",
      phoneNumber: "1234567890",
      address: "123 Test St",
    });

    console.log("Create customer response:", createRes.body);
    expect(createRes.statusCode).toBe(201);
    expect(createRes.body).toHaveProperty("message", "Customer created successfully. Please check your email for the verification code.");

    // Fetch customerID from database
    console.log("Fetching customer from DB with email:", tempEmail);
    const [customer] = await db
      .select()
      .from(CustomerTable)
      .where(eq(CustomerTable.email, tempEmail))
      .execute();
    console.log("Customer in DB:", customer);

    // Debug: Log all customers to verify database state
    const allCustomers = await db.select().from(CustomerTable).execute();
    console.log("All customers in DB:", allCustomers);

    expect(customer).toBeDefined();
    expect(customer.email).toBe(tempEmail);
    expect(customer.isVerified).toBe(false);
    tempCustomerId = customer.customerID;
    console.log("Assigned tempCustomerId:", tempCustomerId);
    expect(tempCustomerId).toBeDefined();
    expect(typeof tempCustomerId).toBe("number");
  });

  afterAll(async () => {
    console.log("Running afterAll: Closing database connection");
    await db.$client.end();
  });

  it("should create a customer", async () => {
    const newEmail = `new${Date.now()}@example.com`;
    console.log("Creating new customer with email:", newEmail);
    const res = await request(app).post("/customer").send({
      email: newEmail,
      password: "password123",
      firstName: "New",
      lastName: "Customer",
      phoneNumber: "9876543210",
      address: "456 New St",
    });

    console.log("Create customer response:", res.body);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message", "Customer created successfully. Please check your email for the verification code.");

    const [customer] = await db
      .select()
      .from(CustomerTable)
      .where(eq(CustomerTable.email, newEmail))
      .execute();
    console.log("New customer in DB:", customer);
    expect(customer).toBeDefined();
    expect(customer.isVerified).toBe(false);
    expect(customer.verificationCode).toBeDefined();
  });

  it("should fail to create customer with short password", async () => {
    const res = await request(app).post("/customer").send({
      email: `fail${Date.now()}@example.com`,
      password: "short",
      firstName: "Fail",
      lastName: "User",
    });

    console.log("Create customer error response:", res.body);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Password must be at least 6 characters long");
  });

  it("should fail to create customer with duplicate email", async () => {
    const res = await request(app).post("/customer").send({
      email: tempEmail,
      password: "password123",
      firstName: "Duplicate",
      lastName: "User",
    });

    console.log("Create customer duplicate email response:", res.body);
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/duplicate key value violates unique constraint/i);
  });

  it("should fail to get customer with invalid ID", async () => {
    console.log("Fetching customer with invalid ID: 'invalid'");
    const res = await request(app).get("/customer/invalid");
    console.log("Get customer invalid ID response:", res.body);
    expect(res.statusCode).toBe(404); 
    expect(res.body).toEqual({}); 
  
  });

  it("should fail to get non-existent customer", async () => {
    console.log("Fetching non-existent customer with ID: 99999");
    const res = await request(app).get("/customer/99999");
    console.log("Get non-existent customer response:", res.body);
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({}); 

  });

  it("should update the customer", async () => {
    console.log("Updating customer with ID:", tempCustomerId);
    const res = await request(app).put(`/customer/${tempCustomerId}`).send({
      firstName: "UpdatedName",
      phoneNumber: "9999999999",
    });
    console.log("Update customer response:", res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Customer updated successfully");

    const [customer] = await db
      .select()
      .from(CustomerTable)
      .where(eq(CustomerTable.customerID, tempCustomerId))
      .execute();
    console.log("Updated customer in DB:", customer);
    expect(customer.firstName).toBe("UpdatedName");
    expect(customer.phoneNumber).toBe("9999999999");
  });

  it("should fail to update non-existent customer", async () => {
    console.log("Updating non-existent customer with ID: 99999");
    const res = await request(app).put("/customer/99999").send({
      firstName: "UpdatedName",
    });
    console.log("Update non-existent customer response:", res.body);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Customer not found");
  });

  it("should delete the customer", async () => {
    console.log("Deleting customer with ID:", tempCustomerId);
    const res = await request(app).delete(`/customer/${tempCustomerId}`);
    console.log("Delete customer response:", res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Customer deleted successfully");

    const [customer] = await db
      .select()
      .from(CustomerTable)
      .where(eq(CustomerTable.customerID, tempCustomerId))
      .execute();
    console.log("Customer after deletion:", customer);
    expect(customer).toBeUndefined();
  });

  it("should fail to delete non-existent customer", async () => {
    console.log("Deleting non-existent customer with ID: 99999");
    const res = await request(app).delete("/customer/99999");
    console.log("Delete non-existent customer response:", res.body);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Customer not found");
  });

  it("should verify customer with valid code", async () => {
    const [customer] = await db
      .select()
      .from(CustomerTable)
      .where(eq(CustomerTable.customerID, tempCustomerId))
      .execute();
    console.log("Customer for verification:", customer);
    const verificationCode = customer.verificationCode;

    const res = await request(app).post("/customer/verify").send({
      email: tempEmail,
      code: verificationCode,
    });
    console.log("Verify customer response:", res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "User verified successfully");

    const [updatedCustomer] = await db
      .select()
      .from(CustomerTable)
      .where(eq(CustomerTable.customerID, tempCustomerId))
      .execute();
    console.log("Verified customer in DB:", updatedCustomer);
    expect(updatedCustomer.isVerified).toBe(true);
  });

  it("should fail to verify with invalid code", async () => {
    const res = await request(app).post("/customer/verify").send({
      email: tempEmail,
      code: "999999",
    });
    console.log("Verify invalid code response:", res.body);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Invalid verification code");
  });

  it("should fail to verify with expired code", async () => {
    await db
      .update(CustomerTable)
      .set({ verificationCodeExpiresAt: new Date(Date.now() - 1000) })
      .where(eq(CustomerTable.customerID, tempCustomerId))
      .execute();

    const [customer] = await db
      .select()
      .from(CustomerTable)
      .where(eq(CustomerTable.customerID, tempCustomerId))
      .execute();
    console.log("Customer with expired code:", customer);
    const verificationCode = customer.verificationCode;

    const res = await request(app).post("/customer/verify").send({
      email: tempEmail,
      code: verificationCode,
    });
    console.log("Verify expired code response:", res.body);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Verification code has expired. Please request a new one.");
  });

  it("should resend verification code", async () => {
    const res = await request(app).post("/customer/resend-verification").send({
      email: tempEmail,
    });
    console.log("Resend verification code response:", res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "New verification code sent successfully");

    const [customer] = await db
      .select()
      .from(CustomerTable)
      .where(eq(CustomerTable.email, tempEmail))
      .execute();
    console.log("Customer after resend:", customer);
    expect(customer.verificationCode).toBeDefined();
    expect(customer.verificationCodeExpiresAt).toBeDefined();
  });

  it("should fail to resend verification code for verified customer", async () => {
    await db
      .update(CustomerTable)
      .set({ isVerified: true })
      .where(eq(CustomerTable.customerID, tempCustomerId))
      .execute();

    const res = await request(app).post("/customer/resend-verification").send({
      email: tempEmail,
    });
    console.log("Resend for verified customer response:", res.body);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Customer is already verified");
  });

  it("should fail to resend verification code for non-existent email", async () => {
    const res = await request(app).post("/customer/resend-verification").send({
      email: "nonexistent@example.com",
    });
    console.log("Resend for non-existent email response:", res.body);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Customer not found");
  });

  it("should login customer with valid credentials", async () => {
    const res = await request(app).post("/customer/login").send({
      email: tempEmail,
      password: "password123",
    });
    console.log("Login customer response:", res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Login successful");
    expect(res.body).toHaveProperty("token");
    expect(res.body.customer.email).toBe(tempEmail);
    tempToken = res.body.token;
  });

  it("should fail to login with invalid password", async () => {
    const res = await request(app).post("/customer/login").send({
      email: tempEmail,
      password: "wrongpassword",
    });
    console.log("Login invalid password response:", res.body);
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message", "Invalid credentials");
  });

  it("should fail to login with non-existent email", async () => {
    const res = await request(app).post("/customer/login").send({
      email: "nonexistent@example.com",
      password: "password123",
    });
    console.log("Login non-existent email response:", res.body);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "customer not found");
  });

  it("should get all customers", async () => {
    const res = await request(app).get("/customer");
    console.log("Get all customers response:", res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Customers retrieved successfully");
    expect(res.body.customers).toBeInstanceOf(Array);
    expect(res.body.customers.length).toBeGreaterThan(0);
    expect(res.body.customers[0].email).toBe(tempEmail);
  });

  it("should get customer with bookings (no bookings)", async () => {
    console.log("Fetching customer bookings with ID:", tempCustomerId);
    const res = await request(app).get(`/customer/${tempCustomerId}/bookings`);
    console.log("Get customer with bookings response:", res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("bookings");
    expect(res.body.bookings).toEqual([]);
  });

  it("should get customer with reservations (no reservations)", async () => {
    console.log("Fetching customer reservations with ID:", tempCustomerId);
    const res = await request(app).get(`/customer/${tempCustomerId}/reservations`);
    console.log("Get customer with reservations response:", res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Customer with reservations retrieved successfully");
    expect(res.body.customer.reservations).toEqual([]);
  });

  it("should get customers with payments and bookings (none exist)", async () => {
    console.log("Fetching customers with payments and bookings for ID:", tempCustomerId);
    const res = await request(app).get(`/customer/${tempCustomerId}/bookings-payments`);
    console.log("Get customers with payments and bookings response:", res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("customers");
    expect(res.body.customers[0].bookings).toEqual([]);
  });

  it("should get customer with bookings and payments by ID (none exist)", async () => {
    console.log("Fetching customer bookings and payments by ID:", tempCustomerId);
    const res = await request(app).get(`/customer/${tempCustomerId}/booking-payment`);
    console.log("Get customer with bookings and payments by ID response:", res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("bookings");
    expect(res.body.bookings).toEqual([]);
  });

  it("should fail to get bookings for non-existent customer", async () => {
    console.log("Fetching bookings for non-existent customer with ID: 99999");
    const res = await request(app).get("/customer/99999/bookings");
    console.log("Get bookings for non-existent customer response:", res.body);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Customer not found");
  });

  it("should fail to get reservations for non-existent customer", async () => {
    console.log("Fetching reservations for non-existent customer with ID: 99999");
    const res = await request(app).get("/customer/99999/reservations");
    console.log("Get reservations for non-existent customer response:", res.body);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Customer not found");
  });
});