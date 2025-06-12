import request from "supertest";
import app from "../../src/index";
import db from "../../src/drizzle/db";
import { CustomerTable } from "../../src/drizzle/schema";
import { eq } from "drizzle-orm";


jest.setTimeout(30000);


const newCustomer = {
  firstName: "New",
  lastName: "Customer",
  email: "newcustomer@example.com",
  password: "strongpass",
};

afterEach(async () => {
  await db.delete(CustomerTable).where(eq(CustomerTable.email, newCustomer.email));
});

afterAll(async () => {
  await db.$client.end();
});

describe("POST /customer", () => {
  it("should register a new customer successfully", async () => {
    const res = await request(app).post("/customer").send(newCustomer);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty(
      "message",
      "Customer created successfully. Please check your email for the verification code."
    );
  });

  it("should not register a customer with an existing email", async () => {
    // First create the customer
    await request(app).post("/customer").send(newCustomer);
    // Try to create again
    const res = await request(app).post("/customer").send(newCustomer);
    expect([409, 500]).toContain(res.statusCode);
    expect(res.body).toHaveProperty("message");
  });

  it("should reject registration with a short password", async () => {
    const res = await request(app).post("/customer").send({
      ...newCustomer,
      email: "shortpass@example.com",
      password: "123",
    });
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: "Password must be at least 6 characters long" });
  });

  it("should reject registration with missing fields", async () => {
    const res = await request(app).post("/customer").send({
      email: "incomplete@example.com",
      password: "password123",
    });
    expect(res.statusCode).toBe(500); 
    expect(res.body).toHaveProperty("message");
  });
});
