import express from 'express';
import customer from './customer/customer.router';
import car from "./car/car.router";
import payment from "./payment/payment.router";
import booking from "./booking/booking.router";
import location from "./location/location.router";
import insurance from './insurance/insurance.router';
import maintenance from './maintenance/maintenance.router';
import reservation from './reservation/reservation.router';


const initializeApp = ()=>{
const app = express();

//middleware
app.use(express.json());

//routes
customer(app);
car(app);
payment(app);
booking(app);
location(app);
insurance(app);
maintenance(app);
reservation(app);
app.get('/', (req, res) => {
    res.send('Welcome to the Car Rental API');
}
)
return app

}
const app = initializeApp()
export default app;



