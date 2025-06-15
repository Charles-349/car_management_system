import {
  createPaymentService,
  getPaymentsService,
  getPaymentByIdService,
  updatePaymentService,
  deletePaymentService
} from "../../src/payment/payment.service";

import db from "../../src/drizzle/db";
import { TIPayment } from "../../src/drizzle/schema";

jest.mock("../../src/drizzle/db", () => ({
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  query: {
    PaymentTable: {
      findMany: jest.fn(),
      findFirst: jest.fn()
    }
  }
}));

describe("Payment Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createPaymentService", () => {
  it("should insert payment and return created payment object", async () => {
    (db.insert as jest.Mock).mockReturnValueOnce({
      values: jest.fn().mockReturnValueOnce({
        returning: jest.fn().mockResolvedValueOnce([
          {
            paymentID: 1,
            bookingID: 1,
            paymentDate: "2024-06-05",
            amount: "250.00",
            paymentMethod: "Credit Card"
          }
        ])
      })
    });

    const result = await createPaymentService({
      bookingID: 1, 
      paymentDate: "2024-06-05", 
      amount: "250.00", 
      paymentMethod: "Credit Card"
    });

    expect(result).toEqual({
      paymentID: 1,
      bookingID: 1,
      paymentDate: "2024-06-05",
      amount: "250.00",
      paymentMethod: "Credit Card"
    });
  });
});

  describe("getPaymentsService", () => {
    it("should return all payments", async () => {
      const mockData = [{ paymentID: 1 }, { paymentID: 2 }];
      (db.query.PaymentTable.findMany as jest.Mock).mockResolvedValueOnce(mockData);

      const result = await getPaymentsService();
      expect(result).toEqual(mockData);
    });

    it("should return an empty array if no payments", async () => {
      (db.query.PaymentTable.findMany as jest.Mock).mockResolvedValueOnce([]);

      const result = await getPaymentsService();
      expect(result).toEqual([]);
    });
  });

  describe("getPaymentByIdService", () => {
    it("should return a payment by ID", async () => {
      const mockPayment = { paymentID: 1, amount: 100 };
      (db.query.PaymentTable.findFirst as jest.Mock).mockResolvedValueOnce(mockPayment);

      const result = await getPaymentByIdService(1);
      expect(result).toEqual(mockPayment);
    });

    it("should return undefined if payment not found", async () => {
      (db.query.PaymentTable.findFirst as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await getPaymentByIdService(999);
      expect(result).toBeUndefined();
    });
  });

  describe("updatePaymentService", () => {
  it("should update a payment and return the updated object", async () => {
    (db.update as jest.Mock).mockReturnValueOnce({
      set: jest.fn().mockReturnValueOnce({
        where: jest.fn().mockReturnValueOnce({
          returning: jest.fn().mockResolvedValueOnce([
            {
              paymentID: 1,
              bookingID: 1,
              paymentDate: "2024-06-05",
              amount: "250.00",
              paymentMethod: "Credit Card"
            }
          ])
        })
      })
    });

    const result = await updatePaymentService(1, {
      bookingID: 1,
      paymentDate: "2024-06-05",
      amount: "250.00",
      paymentMethod: "Credit Card"
    });

  
    expect(result).toEqual({
      paymentID: 1,
      bookingID: 1,
      paymentDate: "2024-06-05",
      amount: "250.00",
      paymentMethod: "Credit Card"
    });
  });

  it("should return null if no payment was updated", async () => {
    (db.update as jest.Mock).mockReturnValueOnce({
      set: jest.fn().mockReturnValueOnce({
        where: jest.fn().mockReturnValueOnce({
          returning: jest.fn().mockResolvedValueOnce([])
        })
      })
    });

    const result = await updatePaymentService(99, {
      bookingID: 1,
      paymentDate: "2024-06-05",
      amount: "250.00",
      paymentMethod: "Credit Card"
    });

    expect(result).toBeNull();
  });
});

  describe("deletePaymentService", () => {
  it("should delete a payment and return the deleted payment object", async () => {
    (db.delete as jest.Mock).mockReturnValueOnce({
      where: jest.fn().mockReturnValueOnce({
        returning: jest.fn().mockResolvedValueOnce([{ paymentID: 1 }])
      })
    });

    const result = await deletePaymentService(1);

   
    expect(result).toEqual({ paymentID: 1 });
  });

  it("should return null if no payment was deleted", async () => {
    (db.delete as jest.Mock).mockReturnValueOnce({
      where: jest.fn().mockReturnValueOnce({
        returning: jest.fn().mockResolvedValueOnce([])
      })
    });

    const result = await deletePaymentService(999);
    expect(result).toBeNull();
  });
}); 

}
);
