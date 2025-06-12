import request from "supertest";
import app from "../../src/index";
import db from "../../src/drizzle/db";
import { CustomerTable } from "../../src/drizzle/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const testUser = {
  firstName: "Test",
  lastName: "User",
  email: "testuser@example.com",
  password: "password123",
};

const verifyUser = {
  firstName: "Verify",
  lastName: "User",
  email: "verifyuser@example.com",
  password: "verify123",
};

let verifyUserID: number;
let verificationCode: string;

beforeAll(async () => {
  const hashedPassword1 = bcrypt.hashSync(testUser.password, 10);
  const hashedPassword2 = bcrypt.hashSync(verifyUser.password, 10);

  await db.insert(CustomerTable).values([
    { ...testUser, password: hashedPassword1 },
    { ...verifyUser, password: hashedPassword2 },
  ]);

  const inserted = await db
    .select()
    .from(CustomerTable)
    .where(eq(CustomerTable.email, verifyUser.email));

  verifyUserID = inserted[0].customerID;

  const code = await db
    .select()
    .from(CustomerTable)
    .where(eq(CustomerTable.customerID, verifyUserID));

  verificationCode = code[0]?.verificationCode || "000000";
});

afterAll(async () => {
  await db.delete(CustomerTable).where(eq(CustomerTable.customerID, verifyUserID));
  await db.delete(CustomerTable).where(eq(CustomerTable.email, testUser.email));
  await db.delete(CustomerTable).where(eq(CustomerTable.customerID, verifyUserID));
  await db.$client.end();
});

describe("POST /customer/login", () => {
  it("should authenticate a customer and return a token", async () => {
    const res = await request(app).post("/customer/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.customer).toEqual(
      expect.objectContaining({
        customerID: expect.any(Number),
        firstName: testUser.firstName,
        lastName: testUser.lastName,
      })
    );
  });

  it("should fail with wrong password", async () => {
    const res = await request(app).post("/customer/login").send({
      email: testUser.email,
      password: "wrongpassword",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ message: "Invalid credentials" });
  });

  it("should fail with non-existent customer", async () => {
    const res = await request(app).post("/customer/login").send({
      email: "nonexistent@example.com",
      password: testUser.password,
    });

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: "customer not found" });
  });
});

describe("POST /customer/verify", () => {
  it("should verify the customer with a valid code", async () => {
    const res = await request(app).post("/customer/verify").send({
      email: verifyUser.email,
      code: verificationCode,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Customer verified successfully" });
  });

  it("should fail with invalid verification code", async () => {
    const res = await request(app).post("/customer/verify").send({
      email: verifyUser.email,
      code: "invalidcode",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: "Invalid verification code" });
  });
});

describe("POST /customer/resend-verification", () => {
  it("should resend a new verification code", async () => {
    const res = await request(app).post("/customer/resend-verification").send({
      email: verifyUser.email,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Verification code resent successfully" });
  });

  it("should fail to resend for non-existent email", async () => {
    const res = await request(app).post("/customer/resend-verification").send({
      email: "fake@example.com",
    });

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: "Customer not found" });
  });
});

describe("GET /customer", () => {
  it("should return all customers", async () => {
    const res = await request(app).get("/customer");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe("GET /customer/:id", () => {
  it("should return the specific customer", async () => {
    const res = await request(app).get(`/customer/${verifyUserID}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        customerID: verifyUserID,
        firstName: verifyUser.firstName,
        lastName: verifyUser.lastName,
      })
    );
  });

  it("should return 404 for non-existent customer", async () => {
    const res = await request(app).get("/customer/999999");

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: "Customer not found" });
  });
});

describe("PATCH /customer/:id", () => {
  it("should update customer details", async () => {
    const res = await request(app).patch(`/customer/${verifyUserID}`).send({
      firstName: "UpdatedName",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Customer updated successfully" });

    const getRes = await request(app).get(`/customer/${verifyUserID}`);
    expect(getRes.body.firstName).toBe("UpdatedName");
  });

  it("should return 404 when updating non-existent customer", async () => {
    const res = await request(app).patch("/customer/999999").send({
      firstName: "Ghost",
    });

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: "Customer not found" });
  });
});

describe("DELETE /customer/:id", () => {
  let tempCustomerID: number;

  beforeAll(async () => {
    const hashedPassword = bcrypt.hashSync("temporary", 10);
    await db.insert(CustomerTable).values({
      firstName: "Temp",
      lastName: "Delete",
      email: "tempdelete@example.com",
      password: hashedPassword,
    });

    const result = await db
      .select()
      .from(CustomerTable)
      .where(eq(CustomerTable.email, "tempdelete@example.com"));
    tempCustomerID = result[0].customerID;
  });

  it("should delete the customer successfully", async () => {
    const res = await request(app).delete(`/customer/${tempCustomerID}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Customer deleted successfully" });
  });

  it("should return 404 when trying to delete again", async () => {
    const res = await request(app).delete(`/customer/${tempCustomerID}`);
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: "Customer not found" });
  });
});
