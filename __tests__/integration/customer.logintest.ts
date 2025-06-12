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

beforeAll(async()=>{
    const hashedPassword = bcrypt.hashSync(testUser.password,10)
    await db.insert(CustomerTable).values({
        ...testUser,
        password:hashedPassword
    })
})
afterAll(async()=>{
    await db.delete(CustomerTable).where(eq(CustomerTable.email,testUser.email))
    await db.$client.end()
})
describe("Post/customer/login", ()=>{
    it("should authenticate a customer and return a token", async()=>{
       const res = await request(app)
         .post("/customer/login")
         .send({
           email: testUser.email,
           password: testUser.password
         });
         expect(res.statusCode).toBe(200)
         expect(res.body).toHaveProperty("token")
         expect(res.body.customer).toEqual(
            expect.objectContaining({
                customerID:expect.any(Number),
                firstName:testUser.firstName,
                lastName:testUser.lastName
            })
         )
    })
    it("should fail with wrong password", async()=>{
      const res = await request(app)
         .post("/customer/login")
         .send({
           email: testUser.email,
           password:"password"
         });
         expect(res.statusCode).toBe(401)
         expect(res.body).toEqual({"message": "Invalid credentials"})
    })
    it("should fail with non existent customer", async()=>{
       const res = await request(app)
         .post("/customer/login")
         .send({
           email: "testUser.email",
           password:testUser.password
         });
         expect(res.statusCode).toBe(404)
         expect(res.body).toEqual({message: "customer not found"})
    
    })
})
// describe("POST /customer", () => {
//   // afterAll(async () => {
//   //   // Cleanup test data
//   //   await db.delete(CustomerTable).where(eq(CustomerTable.email, testUser.email));
//   // });

//   it("should create a user successfully", async () => {
//     const res = await request(app)
//     .post("/customer")
//     .send({
//       ...testUser,
//       password:bcrypt.hashSync(testUser.password,10)
//     })
//     expect(res.statusCode).toBe(400);
//     expect(res.body).toHaveProperty("message", "Password must be at least 6 characters long");
//   });

//   // it("should not register a user with an existing email", async () => {
//   //   const res = await request(app).post("/customer").send(testUser);
//   //   // Your controller returns 500, so we check for that (even if not ideal)
//   //   expect([409, 500]).toContain(res.statusCode);
//   //   expect(res.body).toHaveProperty("message");
//   // });

//   // it("should not create a user with missing field", async () => {
//   //   const res = await request(app).post("/customer").send({
//   //     ...testUser,
//   //     password: "", // empty password
//   //   });
//   //   expect(res.statusCode).toBe(400);
//   //   // Accept either message depending on controller’s priority
//   //   expect(["All fields are required", "Password must be at least 6 characters long"]).toContain(
//   //     res.body.message
//   //   );
//   // });
// });

