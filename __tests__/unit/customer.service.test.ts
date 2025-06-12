import {
  createCustomerService,
  customerLoginService,
  getCustomerByEmailService,
  verifyCustomerService,
  updateVerificationCodeService,
  getCustomerService,
  getCustomerByIdService,
  getCustomerWithBookings,
  getCustomersWithPaymentsAndBookingsService,
  updateCustomerService,
  deleteCustomerService,
  getCustomerWithReservationsService,
  getCustomersWithPaymentsAndBookingsServiceById
} from "../../src/customer/customer.service";
import db from "../../src/drizzle/db";
import { CustomerTable, TICustomer } from "../../src/drizzle/schema";

jest.mock("../../src/drizzle/db", () => ({
  insert: jest.fn(() => ({
    values: jest.fn().mockReturnThis()
  })),
  update: jest.fn(),
  delete: jest.fn(),
  query: {
    CustomerTable: {
      findFirst: jest.fn(),
      findMany: jest.fn()
    }
  }
}));

describe("customer service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createCustomerService", () => {
    it("should insert a user and return success message", async () => {
      const customer = {
        firstName: "Test",
        lastName: "customer",
        email: "customer@gmail.com",
        password: "harshed"
      };
      const result = await createCustomerService(customer);
      expect(db.insert).toHaveBeenCalled();
      expect(result).toBe("Customer created successfully");
    });
  });

  describe("customerLoginService", () => {
    it("should return customer data if found", async () => {
      const mockCustomer = {
        id: 1,
        firstName: "Test",
        lastName: "customer",
        email: "customer@gmail.com",
        password: "harshed"
      };
      (db.query.CustomerTable.findFirst as jest.Mock).mockResolvedValueOnce(mockCustomer);
      const result = await customerLoginService({ email: "customer@gmail.com" } as TICustomer);
      expect(db.query.CustomerTable.findFirst).toHaveBeenCalled();
      expect(result).toEqual(mockCustomer);
    });

    it("should return null if not found", async () => {
      (db.query.CustomerTable.findFirst as jest.Mock).mockResolvedValueOnce(null);
      const result = await customerLoginService({ email: "customer@gmail.com" } as TICustomer);
      expect(db.query.CustomerTable.findFirst).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe("getCustomerService", () => {
    it("should return all customers", async () => {
      const customer = [
        {
          firstName: "John",
          lastName: "Doe",
          email: "doe@example.com",
          phoneNumber: "555-1234",
          address: "1 Elm St",
          password: "password123"
        },
        {
          firstName: "Jane",
          lastName: "Smith",
          email: "smith@example.com",
          phoneNumber: "555-5678",
          address: "2 Maple Ave",
          password: "password124"
        }
      ];
      (db.query.CustomerTable.findMany as jest.Mock).mockResolvedValueOnce(customer);
      const result = await getCustomerService();
      expect(result).toEqual(customer);
    });

    it("should return empty array if no customers", async () => {
      (db.query.CustomerTable.findMany as jest.Mock).mockResolvedValueOnce([]);
      const result = await getCustomerService();
      expect(result).toEqual([]);
    });
  });

  describe("getCustomerByIdService", () => {
    it("should return a customer if found", async () => {
      const customer = {
        firstName: "John",
        lastName: "Doe",
        email: "doe@example.com",
        phoneNumber: "555-1234",
        address: "1 Elm St",
        password: "password123"
      };
      (db.query.CustomerTable.findFirst as jest.Mock).mockResolvedValueOnce(customer);
      const result = await getCustomerByIdService(1);
      expect(db.query.CustomerTable.findFirst).toHaveBeenCalled();
      expect(result).toEqual(customer);
    });

    it("should return undefined if not found", async () => {
      (db.query.CustomerTable.findFirst as jest.Mock).mockResolvedValueOnce(undefined);
      const result = await getCustomerByIdService(1);
      expect(result).toBeUndefined();
    });
  });

  describe("updateCustomerService", () => {
    it("should update a customer and return a success message", async () => {
      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValueOnce([{}])
          })
        })
      });
      const result = await updateCustomerService(1, {
        firstName: "John",
        lastName: "Doe",
        email: "doe@example.com",
        phoneNumber: "555-1234",
        address: "1 Elm St",
        password: "password123"
      });
      expect(db.update).toHaveBeenLastCalledWith(CustomerTable);
      expect(result).toBe("Customer updated successfully");
    });

    it("should return null if no customer was updated", async () => {
      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValueOnce([])
          })
        })
      });
      const result = await updateCustomerService(999, {
        firstName: "Ghost",
        lastName: "User",
        email: "ghost@example.com",
        phoneNumber: "000-0000",
        address: "Nowhere",
        password: "none"
      });
      expect(result).toBeNull();
    });
  });

  describe("deleteCustomerService", () => {
    it("should delete a customer and return a success message", async () => {
      (db.delete as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValueOnce([{}])
        })
      });
      const result = await deleteCustomerService(1);
      expect(db.delete).toHaveBeenLastCalledWith(CustomerTable);
      expect(result).toBe("Customer deleted successfully");
    });

    it("should return null if no customer was deleted", async () => {
      (db.delete as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValueOnce([])
        })
      });
      const result = await deleteCustomerService(999);
      expect(result).toBeNull();
    });
  });

  describe("getCustomerByEmailService ", () => {
    it("should get a customer by email address", async () => {
      const customer = {
        firstName: "John",
        lastName: "Doe",
        email: "doe@example.com",
        phoneNumber: "555-1234",
        address: "1 Elm St",
        password: "password123"
      };
      (db.query.CustomerTable.findFirst as jest.Mock).mockResolvedValueOnce(customer);
      const result = await getCustomerByEmailService("doe@example.com");
      expect(db.query.CustomerTable.findFirst).toHaveBeenCalled();
      expect(result).toEqual(customer);
    });
  });

  describe("verifyCustomerService", () => {
    it("should verify a customer", async () => {
      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValueOnce(undefined)
        })
      });
      const result = await verifyCustomerService("doe@example.com");
      expect(db.update).toHaveBeenLastCalledWith(CustomerTable);
    });
  });

  describe("updateVerificationCodeService", () => {
    it("should update the verification code", async () => {
      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValueOnce(undefined)
        })
      });
      const result = await updateVerificationCodeService("doe@example.com", "123456", new Date());
      expect(db.update).toHaveBeenCalledWith(CustomerTable);
    });
  });

  describe("getCustomerWithBookings", () => {
    it("should return customer with bookings", async () => {
      const mockCustomerWithBookings = {
        customerID: 1,
        firstName: "John",
        bookings: [
          {
            carID: 1,
            rentalStartDate: new Date("2025-06-01"),
            rentalEndDate: new Date("2025-06-05"),
            totalAmount: 300
          }
        ]
      };
      (db.query.CustomerTable.findFirst as jest.Mock).mockResolvedValueOnce(mockCustomerWithBookings);
      const result = await getCustomerWithBookings(1);
      expect(db.query.CustomerTable.findFirst).toHaveBeenCalled();
      expect(result).toEqual(mockCustomerWithBookings);
    });
  });

  describe("getCustomerWithReservationsService", () => {
    it("should return customer with reservations", async () => {
      const mockCustomerWithReservations = {
        customerID: 1,
        reservations: [
          {
            reservationID: 1,
            customerID: 1,
            carID: 1,
            reservationDate: new Date("2025-06-01"),
            pickupDate: new Date("2025-06-02"),
            returnDate: new Date("2025-06-06")
          }
        ]
      };
      (db.query.CustomerTable.findFirst as jest.Mock).mockResolvedValueOnce(mockCustomerWithReservations);
      const result = await getCustomerWithReservationsService(1);
      expect(db.query.CustomerTable.findFirst).toHaveBeenCalled();
      expect(result).toEqual(mockCustomerWithReservations);
    });
  });

  describe("getCustomersWithPaymentsAndBookingsService", () => {
    it("should return customers with bookings and payments", async () => {
      const mockData = [
        {
          customerID: 1,
          bookings: [
            {
              carID: 1,
              rentalStartDate: new Date(),
              rentalEndDate: new Date(),
              totalAmount: 500,
              payments: [
                { paymentID: 1, amount: 500, paymentDate: new Date() }
              ]
            }
          ]
        }
      ];
      (db.query.CustomerTable.findMany as jest.Mock).mockResolvedValueOnce(mockData);
      const result = await getCustomersWithPaymentsAndBookingsService();
      expect(db.query.CustomerTable.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });

  describe("getCustomersWithPaymentsAndBookingsServiceById", () => {
    it("should return a customer by id with bookings and payments", async () => {
      const mockData = {
        customerID: 1,
        bookings: [
          {
            carID: 1,
            rentalStartDate: new Date(),
            rentalEndDate: new Date(),
            totalAmount: 400,
            payments: [
              { paymentID: 2, amount: 400, paymentDate: new Date() }
            ]
          }
        ]
      };
      (db.query.CustomerTable.findFirst as jest.Mock).mockResolvedValueOnce(mockData);
      const result = await getCustomersWithPaymentsAndBookingsServiceById(1);
      expect(db.query.CustomerTable.findFirst).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });
});
