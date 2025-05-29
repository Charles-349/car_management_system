CREATE TABLE "bookings" (
	"BookingID" serial PRIMARY KEY NOT NULL,
	"CarID" integer NOT NULL,
	"CustomerID" integer NOT NULL,
	"RentalStartDate" date NOT NULL,
	"RentalEndDate" date NOT NULL,
	"TotalAmount" numeric(10, 2)
);
--> statement-breakpoint
CREATE TABLE "car" (
	"CarID" serial PRIMARY KEY NOT NULL,
	"CarModel" varchar(100) NOT NULL,
	"Year" date NOT NULL,
	"Color" varchar(30),
	"RentalRate" numeric(10, 2) NOT NULL,
	"Availability" boolean DEFAULT true,
	"LocationID" integer
);
--> statement-breakpoint
CREATE TABLE "customer" (
	"customerID" serial PRIMARY KEY NOT NULL,
	"FirstName" varchar(50) NOT NULL,
	"LastName" varchar(50) NOT NULL,
	"Email" varchar(100) NOT NULL,
	"PhoneNumber" text,
	"Address" varchar(255),
	CONSTRAINT "customer_Email_unique" UNIQUE("Email")
);
--> statement-breakpoint
CREATE TABLE "insurance" (
	"InsuranceID" serial PRIMARY KEY NOT NULL,
	"CarID" integer NOT NULL,
	"InsuranceProvider" varchar(100) NOT NULL,
	"PolicyNumber" varchar NOT NULL,
	"StartDate" date NOT NULL,
	"EndDate" date
);
--> statement-breakpoint
CREATE TABLE "location" (
	"LocationID" serial PRIMARY KEY NOT NULL,
	"LocationName" varchar(100) NOT NULL,
	"Address" text NOT NULL,
	"ContactNumber" varchar(20)
);
--> statement-breakpoint
CREATE TABLE "maintenance" (
	"MaintenanceID" serial PRIMARY KEY NOT NULL,
	"CarID" integer NOT NULL,
	"MaintenanceDate" date NOT NULL,
	"Description" varchar(255),
	"Cost" numeric(10, 2)
);
--> statement-breakpoint
CREATE TABLE "payment" (
	"PaymentID" serial PRIMARY KEY NOT NULL,
	"BookingID" integer NOT NULL,
	"PaymentDate" date NOT NULL,
	"Amount" numeric(10, 2) NOT NULL,
	"PaymentMethod" text
);
--> statement-breakpoint
CREATE TABLE "reservation" (
	"ReservationID" serial PRIMARY KEY NOT NULL,
	"CustomerID" integer NOT NULL,
	"CarID" integer NOT NULL,
	"ReservationDate" date NOT NULL,
	"PickupDate" date NOT NULL,
	"ReturnDate" date
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_CarID_car_CarID_fk" FOREIGN KEY ("CarID") REFERENCES "public"."car"("CarID") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_CustomerID_customer_customerID_fk" FOREIGN KEY ("CustomerID") REFERENCES "public"."customer"("customerID") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "car" ADD CONSTRAINT "car_LocationID_location_LocationID_fk" FOREIGN KEY ("LocationID") REFERENCES "public"."location"("LocationID") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance" ADD CONSTRAINT "insurance_CarID_car_CarID_fk" FOREIGN KEY ("CarID") REFERENCES "public"."car"("CarID") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance" ADD CONSTRAINT "maintenance_CarID_car_CarID_fk" FOREIGN KEY ("CarID") REFERENCES "public"."car"("CarID") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_BookingID_bookings_BookingID_fk" FOREIGN KEY ("BookingID") REFERENCES "public"."bookings"("BookingID") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_CustomerID_customer_customerID_fk" FOREIGN KEY ("CustomerID") REFERENCES "public"."customer"("customerID") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_CarID_car_CarID_fk" FOREIGN KEY ("CarID") REFERENCES "public"."car"("CarID") ON DELETE cascade ON UPDATE no action;