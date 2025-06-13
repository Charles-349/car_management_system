import request from 'supertest';
import  app  from '../../src/index'; // Adjust path to your app instance
import  db  from '../../src/drizzle/db'; // Adjust path to Drizzle DB instance
import { CustomerTable } from '../../src/drizzle/schema'; // Adjust path to schema
import { eq } from 'drizzle-orm';
import { sendEmail } from '../../src/mailer/mailer'; // Mocked sendEmail
import bcrypt from 'bcrypt';
jest.setTimeout(50000)
// Mock the sendEmail function to prevent real emails and async issues
jest.mock('../../src/mailer/mailer', () => ({
  sendEmail: jest.fn().mockResolvedValue({ accepted: ['mock@example.com'] }),
}));

describe('Customer API Integration Tests', () => {
  let createdCustomer: any;
  let verificationCode: string;
  let customerId: number;

  // Setup: Create a customer before all tests
  beforeAll(async () => {
    const password = await bcrypt.hash('password123', 10);
    verificationCode = '123456';
    const customerData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser@example.com',
      password,
      phoneNumber: '1234567890',
      address: '123 Test St',
      role: "user" as "user", // Explicitly type as "user"
      isVerified: false,
      verificationCode,
      verificationCodeExpiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    };
    const [customer] = await db.insert(CustomerTable).values(customerData).returning();
    createdCustomer = customer;
    customerId = customer.customerID;
    console.log(`Created customer with ID: ${customerId}`);
    // Verify customer exists
    const [verifyCustomer] = await db
      .select()
      .from(CustomerTable)
      .where(eq(CustomerTable.customerID, customerId));
    console.log(`Verified customer after insert: ${JSON.stringify(verifyCustomer)}`);
  });

  // Teardown: Clean up database and close connections
  afterAll(async () => {
    await db.delete(CustomerTable).where(eq(CustomerTable.email, 'testuser@example.com'));
    // Generic Drizzle cleanup (adjust based on your db setup)
    if (db && db.$client && typeof db.$client.end === 'function') {
      console.log('Closing PostgreSQL client');
      await db.$client.end();
    }
  });

  describe('POST /customer/login', () => {
    it('should authenticate a customer and return a token', async () => {
      const res = await request(app).post('/customer/login').send({
        email: 'testuser@example.com',
        password: 'password123',
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          message: 'Login successful',
          token: expect.any(String),
          customer: expect.objectContaining({
            customerID: customerId,
            firstName: 'Test',
            lastName: 'User',
            email: 'testuser@example.com',
          }),
        })
      );
    });

    it('should fail with wrong password', async () => {
      const res = await request(app).post('/customer/login').send({
        email: 'testuser@example.com',
        password: 'wrongpassword',
      });

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ message: 'Invalid credentials' });
    });

    it('should fail with non-existent customer', async () => {
      const res = await request(app).post('/customer/login').send({
        email: 'nonexistent@example.com',
        password: 'password123',
      });

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ message: 'customer not found' });
    });
  });

  describe('POST /customer/verify', () => {
    it('should verify the customer with a valid code', async () => {
      const res = await request(app).post('/customer/verify').send({
        email: 'testuser@example.com',
        code: verificationCode,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'User verified successfully' });
    });

    it('should fail with invalid verification code', async () => {
      const res = await request(app).post('/customer/verify').send({
        email: 'testuser@example.com',
        code: '999999',
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ message: 'Invalid verification code' });
    });
  });

  describe('POST /customer/resend-verification', () => {
    it('should resend a new verification code', async () => {
      await db
        .update(CustomerTable)
        .set({ isVerified: false })
        .where(eq(CustomerTable.email, 'testuser@example.com'));

      const res = await request(app).post('/customer/resend-verification').send({
        email: 'testuser@example.com',
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'New verification code sent successfully' });
      expect(sendEmail).toHaveBeenCalled();
    });

    it('should fail to resend for non-existent email', async () => {
      const res = await request(app).post('/customer/resend-verification').send({
        email: 'nonexistent@example.com',
      });

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ message: 'Customer not found' });
    });
  });

  describe('GET /customer', () => {
    it('should return all customers', async () => {
      const res = await request(app).get('/customer');

      expect(res.statusCode).toBe(200);
      expect(res.body.customers).toBeInstanceOf(Array);
      expect(res.body.customers).toContainEqual(
        expect.objectContaining({
          customerID: customerId,
          email: 'testuser@example.com',
        })
      );
    });
  });

  // describe('GET /customer/:id', () => {
  //   it('should return the specific customer', async () => {
  //     // Debug: Verify customer exists in DB
  //     const [customer] = await db
  //       .select()
  //       .from(CustomerTable)
  //       .where(eq(CustomerTable.customerID, customerId));
  //     console.log(`Customer in DB before GET: ${JSON.stringify(customer)}`);

  //     const res = await request(app).get(`/customer/${customerId}`);

  //     expect(res.statusCode).toBe(200);
  //     expect(res.body).toEqual(
  //       expect.objectContaining({
  //         message: 'Customer retrieved successfully',
  //         customer: expect.objectContaining({
  //           customerID: customerId,
  //           email: 'testuser@example.com',
  //         }),
  //       })
  //     );
  //   });

  //   it('should return 404 for non-existent customer', async () => {
  //     const res = await request(app).get('/customer/999999');

  //     expect(res.statusCode).toBe(404);
  //     // Fallback expectation to debug empty body
  //     if (Object.keys(res.body).length === 0) {
  //       console.log('Empty 404 response body detected for GET /customer/999999');
  //     }
  //     expect(res.body).toEqual({ message: 'Customer not found' });
  //   });
  // });

  // describe('PATCH /customer/:id', () => {
  //   it('should update customer details', async () => {
  //     // Debug: Verify customer exists in DB
  //     const [customer] = await db
  //       .select()
  //       .from(CustomerTable)
  //       .where(eq(CustomerTable.customerID, customerId));
  //     console.log(`Customer in DB before PATCH: ${JSON.stringify(customer)}`);

  //     const res = await request(app).patch(`/customer/${customerId}`).send({
  //       firstName: 'Updated',
  //       lastName: 'User',
  //     });

  //     expect(res.statusCode).toBe(200);
  //     expect(res.body).toEqual({ message: 'Customer updated successfully' });

  //     // Verify update in database
  //     const [updatedCustomer] = await db
  //       .select()
  //       .from(CustomerTable)
  //       .where(eq(CustomerTable.customerID, customerId));
  //     expect(updatedCustomer.firstName).toBe('Updated');
  //   });

  //   it('should return 404 when updating non-existent customer', async () => {
  //     const res = await request(app).patch('/customer/999999').send({
  //       firstName: 'Updated',
  //     });

  //     expect(res.statusCode).toBe(404);
  //     // Fallback expectation to debug empty body
  //     if (Object.keys(res.body).length === 0) {
  //       console.log('Empty 404 response body detected for PATCH /customer/999999');
  //     }
  //     expect(res.body).toEqual({ message: 'Customer not found' });
  //   });
  // });

  describe('DELETE /customer/:id', () => {
    it('should delete the customer successfully', async () => {
      const res = await request(app).delete(`/customer/${customerId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'Customer deleted successfully' });
    });

    it('should return 404 when trying to delete again', async () => {
      const res = await request(app).delete(`/customer/${customerId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ message: 'Customer not found' });
    });
  });
});