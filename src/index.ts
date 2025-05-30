import express from 'express';
import customer from './customer/customer.router';
import car from "./car/car.router";
import payment from "./payment/payment.router";
import booking from "./booking/booking.router";
import location from "./location/location.router";




const app = express();

//middleware
app.use(express.json());

//routes
customer(app);
car(app);
payment(app);
booking(app);
location(app);
app.get('/', (req, res) => {
    res.send('Welcome to the Car Rental API');
}
)

app.listen(8081, ()=>{
    console.log("server running on http://localhost:8081");
})