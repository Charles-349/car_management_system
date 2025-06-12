
import { is, relations } from "drizzle-orm";
import { pgEnum } from "drizzle-orm/pg-core";
import { text, varchar, serial, pgTable, decimal, integer, boolean, date, timestamp } from "drizzle-orm/pg-core";


export const RoleEnum = pgEnum("role", [
    "admin",
    "user"]);

// customer table
export const CustomerTable = pgTable("customer", {
    customerID: serial("customerID").primaryKey(),
    firstName: varchar("FirstName", { length: 50 }).notNull(),
    lastName: varchar("LastName", { length: 50 }).notNull(),
    email: varchar("Email", { length: 100 }).notNull().unique(),
    password: varchar("Password", { length: 255 }).notNull(), // hashed password
    phoneNumber: text("PhoneNumber"),
    address: varchar("Address", { length: 255 }),
    role: RoleEnum("Role").default("user") ,// default role is user
    isVerified: boolean("is_verified").default(false), // to check if the user is verified  
    verificationCode:varchar("verification_code", { length: 10 }), // to store the verification code sent to the user  
    verificationCodeExpiresAt: timestamp("verification_code_expires_at", { mode: "date" })
   
});

// Location Table
export const LocationTable = pgTable("location", {
    locationID: serial("LocationID").primaryKey(),
    locationName: varchar("LocationName", { length: 100 }).notNull(),
    address: text("Address").notNull(),
    contactNumber: varchar("ContactNumber", { length: 20 })
});

// car table
export const CarTable = pgTable("car", {
    carID: serial("CarID").primaryKey(),
    carModel: varchar("CarModel", { length: 100 }).notNull(),
    year: date("Year").notNull(),
    color: varchar("Color", { length: 30 }),
    rentalRate: decimal("RentalRate", { precision: 10, scale: 2 }).notNull(),
    availability: boolean("Availability").default(true),
    locationID: integer("LocationID").references(() => LocationTable.locationID, { onDelete: "set null" })
})

// Reservation Table
export const ReservationTable = pgTable("reservation", {
    reservationID: serial("ReservationID").primaryKey(),
    customerID: integer("CustomerID").notNull().references(() => CustomerTable.customerID, { onDelete: "cascade" }),
    carID: integer("CarID").notNull().references(() => CarTable.carID, { onDelete: "cascade" }),
    reservationDate: date("ReservationDate").notNull(),
    pickupDate: date("PickupDate").notNull(),
    returnDate: date("ReturnDate")
});

//Booking Table
export const BookingsTable = pgTable("bookings", {
    bookingID: serial("BookingID").primaryKey(),
    carID: integer("CarID").notNull().references(() => CarTable.carID, { onDelete: "cascade" }),
    customerID: integer("CustomerID").notNull().references(() => CustomerTable.customerID, { onDelete: "cascade" }),
    rentalStartDate: date("RentalStartDate").notNull(),
    rentalEndDate: date("RentalEndDate").notNull(),
    totalAmount: decimal("TotalAmount", { precision: 10, scale: 2 })
});

// Payment Table
export const PaymentTable = pgTable("payment", {
    paymentID: serial("PaymentID").primaryKey(),
    bookingID: integer("BookingID").notNull().references(() => BookingsTable.bookingID, { onDelete: "cascade" }),
    paymentDate: date("PaymentDate").notNull(),
    amount: decimal("Amount", { precision: 10, scale: 2 }).notNull(), // {precision: 10, scale: 2} means 10 digits total, 2 of which are after the decimal point. i.e // 12345678.90
    paymentMethod: text("PaymentMethod")
});

// Maintenance Table
//
export const MaintenanceTable = pgTable("maintenance", {
    maintenanceID: serial("MaintenanceID").primaryKey(),
    carID: integer("CarID").notNull().references(() => CarTable.carID, { onDelete: "cascade" }),
    maintenanceDate: date("MaintenanceDate").notNull(),
    description: varchar("Description", { length: 255 }),
    cost: decimal("Cost", { precision: 10, scale: 2 })
});


// Insurance Table

export const InsuranceTable = pgTable("insurance", {
    insuranceID: serial("InsuranceID").primaryKey(),
    carID: integer("CarID").notNull().references(() => CarTable.carID, { onDelete: "cascade" }),
    insuranceProvider: varchar("InsuranceProvider", { length: 100 }).notNull(),
    policyNumber: varchar("PolicyNumber").notNull(),
    startDate: date("StartDate").notNull(),
    endDate: date("EndDate")
});


// RELATIONSHIPS

// CustomerTable Relationships - 1 customer can have many reservations and bookings 
export const CustomerRelations = relations(CustomerTable, ({ many }) => ({
    reservations: many(ReservationTable),
    bookings: many(BookingsTable)
    
}))

// LocationTable Relationships -  1 location can have many cars
export const LocationRelationships = relations(LocationTable, ({ many }) => ({
    cars: many(CarTable)
}))

// CarTable Relationships - 1 car can have many reservations, bookings, maintenance, and insurance
export const CarRelations = relations(CarTable, ({ many, one }) => ({
    location: one(LocationTable, {
        fields: [CarTable.locationID],
        references: [LocationTable.locationID]
    }),
    reservations: many(ReservationTable),
    bookings: many(BookingsTable),
    maintenanceRecords: many(MaintenanceTable),
    insurancePolicies: many(InsuranceTable)
}));

// ReservationTable Relationships - 1 reservation belongs to 1 customer and 1 car
export const ReservationRelations = relations(ReservationTable, ({ one }) => ({
    customer: one(CustomerTable, {
        fields: [ReservationTable.customerID],
        references: [CustomerTable.customerID]
    }),
    car: one(CarTable, {
        fields: [ReservationTable.carID],
        references: [CarTable.carID]
    })
}))

// BookingsTable Relationships - 1 booking belongs to 1 customer and 1 car, and can have many payments
export const BookingsRelations = relations(BookingsTable, ({ one, many }) => ({
    customer: one(CustomerTable, {
        fields: [BookingsTable.customerID],
        references: [CustomerTable.customerID]
    }),
    car: one(CarTable, {
        fields: [BookingsTable.carID],
        references: [CarTable.carID]
    }),
    payments: many(PaymentTable)
}))

// PaymentTable Relationships - 1 payment belongs to 1 booking
export const PaymentRelations = relations(PaymentTable, ({ one }) => ({
    booking: one(BookingsTable, {
        fields: [PaymentTable.bookingID],
        references: [BookingsTable.bookingID]
    })
}))

// MaintenanceTable Relationships - 1 maintenance record belongs to 1 car
export const MaintenanceRelations = relations(MaintenanceTable, ({ one }) => ({
    car: one(CarTable, {
        fields: [MaintenanceTable.carID],
        references: [CarTable.carID]
    })
}));

// InsuranceTable Relationships - 1 insurance policy belongs to 1 car
export const InsuranceRelations = relations(InsuranceTable, ({ one }) => ({
    car: one(CarTable, {
        fields: [InsuranceTable.carID],
        references: [CarTable.carID]
    })
}));
// infer types
export type TICustomer = typeof CustomerTable.$inferInsert;
export type TILocation = typeof LocationTable.$inferInsert;
export type TICar = typeof CarTable.$inferInsert;
export type TIReservation = typeof ReservationTable.$inferInsert;
export type TIBooking = typeof BookingsTable.$inferInsert;
export type TIPayment = typeof PaymentTable.$inferInsert;
export type TIMaintenance = typeof MaintenanceTable.$inferInsert;
export type TIInsurance = typeof InsuranceTable.$inferInsert;
export type TSCustomer = typeof CustomerTable.$inferSelect;
export type TSLocation = typeof LocationTable.$inferSelect;
export type TSCar = typeof CarTable.$inferSelect;
export type TSReservation = typeof ReservationTable.$inferSelect;
export type TSBooking = typeof BookingsTable.$inferSelect;
export type TSPayment = typeof PaymentTable.$inferSelect;
export type TSMaintenance = typeof MaintenanceTable.$inferSelect;
export type TSInsurance = typeof InsuranceTable.$inferSelect;