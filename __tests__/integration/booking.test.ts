import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../../src/index';
import db from "../../src/drizzle/db";
import {BookingsTable,CustomerTable,CarTable} from "../../src/drizzle/schema";
import { eq, is, TableAliasProxyHandler } from 'drizzle-orm';


let token: string;
let carID:number;
let customerID: number;
let bookingID: number;

const testUser = {
    firstName: "Todo",
    lastName: "Tester",
    email: "customer@gmail.com",
    password: "todopass123"
};
const testCar = {
   carModel: "Toyota Corolla", 
   year: "2020-01-01", 
   color: "Red", 
   rentalRate: "50.00", 
   availability: true, 
   locationID: 1 
}

beforeAll(async () => {
    // create a test car
    const [car] = await db.insert(CarTable).values({
        ...testCar,
    }).returning();
    carID = car.carID;
    // Create a test customer
    const hashedPassword = bcrypt.hashSync(testUser.password, 10);
    const [customer] = await db.insert(CustomerTable).values({
        ...testUser,
        password: hashedPassword,
        role: "admin", // to get access to the todo routes
        isVerified: true // to skip verification checks
    }).returning();
    customerID = customer.customerID;

    // login to get the token
    const res = await request(app)
        .post("/customer/login")
        .send({
            email: testUser.email,
            password: testUser.password
        });
    token = res.body.token;
})

afterAll(async () => {
    // Clean up the test user and booking
    await db.delete(BookingsTable).where(eq(BookingsTable.customerID, customerID));
    await db.delete(CarTable).where(eq(CarTable.carID, carID));
    await db.delete(CustomerTable).where(eq(CustomerTable.email, testUser.email));
    await db.$client.end();
});
describe("Booking API Integration Test", ()=>{
    it("should create a booking",async()=>{
       const booking = {
        carID, 
        customerID,
        rentalStartDate: "2024-06-05", 
        rentalEndDate: "2024-06-10", 
        totalAmount: "250.00" ,

       };
       const res = await request(app)
       .post("/booking")
       .set("Authorization",`Bearer ${token}`)
       .send(booking)

       expect(res.statusCode).toBe(201)
       expect(res.body).toHaveProperty("message", "Booking created successfully")
       bookingID = res.body.booking.bookingID;
       console.log(`Created booking ID : ${bookingID}`)
    })
    it("should get all bookings", async()=>{
       const res = await request(app)
       .get("/booking")
       .set("Authorization", `Bearer ${token}`);

       expect(res.statusCode).toBe(200);
       expect(res.body.bookings).toBeInstanceOf(Array);
       expect(res.body.bookings.length).toBeGreaterThan(0);
       console.log("Bookings:", res.body.bookings);
    })
     it("should get a booking by ID", async () => {
        const res = await request(app)
            .get(`/booking/${bookingID}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Booking retrieved successfully");
        expect(res.body.booking).toHaveProperty("bookingID");
        bookingID = res.body.booking.bookingID;

    });
    it("should update a booking", async()=>{
        const updated = {
          rentalEndDate: "2024-06-11", 
        totalAmount: "300.00" ,  
        };
        const res = await request(app)
        .put(`/booking/${bookingID}`)
         .set("Authorization", `Bearer ${token}`)
        .send(updated);

        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty("message", "Booking updated successfully" )
        
    })
    it("should delete a booking ", async()=>{
        const res = await request(app)
        .delete(`/booking/${bookingID}`)
        .set("Authorization", `Bearer ${token}`)

        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty("message", "Booking deleted successfully")
    })
    // it("should get a booking by ID", async () => {
    //     const res = await request(app)
    //         .get(`/booking/customer/${customerID}`)
    //         .set("Authorization", `Bearer ${token}`);

    //     // expect(res.statusCode).toBe(200);
    //        expect(res.body.bookings).toBeInstanceOf(Array);
    //     // expect(res.body).toHaveProperty("message", "Bookings retrieved successfully");
    //     // expect(res.body.bookings).toHaveProperty("bookingID");
    //     // bookingID = res.body.bookings.bookingID;

    // });
   it("should fail to create a booking with invalid credentials",async()=>{
       const booking = {
        // carID, 
        customerID,
        rentalStartDate: "2024-06-05", 
        rentalEndDate: "2024-06-10", 
        totalAmount: "250.00" ,

       };
       const res = await request(app)
       .post("/booking")
       .set("Authorization",`Bearer ${token}`)
       .send(booking);
       

       expect(res.statusCode).toBe(500)
       expect(res.body).toHaveProperty("message" )
    
 
    })
     it("should get all bookings", async()=>{
       const res = await request(app)
       .get("/booking")
       expect(res.statusCode).toBe(401)
       expect(res.body).toHaveProperty( "message", "Unauthorized")

      
    })
    it('should not get a booking with invalid id',async () => {
        const res = await request(app)
        .get('/booking/88888')
        .set("Authorization",`Bearer ${token}`)

        expect(res.statusCode).toBe(404)
       expect(res.body).toHaveProperty( "message", "Booking not found")


        
    })
      it("should not update a booking if id is not a number", async()=>{
        const updated = {
          rentalEndDate: "2024-06-11", 
        totalAmount: "300.00" ,  
        };
        const res = await request(app)
        .put("/booking/rr")
         .set("Authorization", `Bearer ${token}`)
        .send(updated);

        expect(res.statusCode).toBe(404)
        expect(res.body).toHaveProperty("message", "Invalid booking ID" )
        
    })
     it("should not update a booking with non exixting booking id", async()=>{
        const updated = {
          rentalEndDate: "2024-06-11", 
        totalAmount: "300.00" ,  
        };
        const res = await request(app)
        .put("/booking/9999")
         .set("Authorization", `Bearer ${token}`)
        .send(updated);

        expect(res.statusCode).toBe(404)
        expect(res.body).toHaveProperty("message", "Booking not found" )
        
    })
    it("should not update a booking", async()=>{
        const updated = {
          rentalEndDate: "2024-06-11", 
        totalAmount: "300.00" ,  
        };
        const res = await request(app)
        .put(`/booking/${bookingID}`)
         .set("Authorization", `Bearer ${token}`)
        .send(updated);

        expect(res.statusCode).toBe(404)
        // expect(res.body).toHaveProperty("message", "Booking not updated" )
        
    })
    
 it("should delete a non existing booking", async()=>{
        const res = await request(app)
        .delete(`/booking/9999`)
        .set("Authorization", `Bearer ${token}`)

        expect(res.statusCode).toBe(404)
        expect(res.body).toHaveProperty("message", "Booking not found or not deleted")
    })



})