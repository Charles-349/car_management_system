import express from 'express';
import customer from './customer/customer.router';
import car from "./car/car.router";

const app = express();

//middleware
app.use(express.json());

//routes
customer(app);
car(app);
app.get('/', (req, res) => {
    res.send('Welcome to the Car Rental API');
}
)

app.listen(8081, ()=>{
    console.log("server running on http://localhost:8081");
})