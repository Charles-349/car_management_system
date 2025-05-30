import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { CarTable, TICar } from "../drizzle/schema";


//create car service
export const createCarService =async(car : TICar) => {
    const[inserted] = await db.insert(CarTable).values(car).returning();
    if(inserted) {
        return inserted;
    }   
    return null;
}
// get a car by id
export const getCarByIdService = async (id: number) => {
    const car = await db.query.CarTable.findFirst({
        where: eq(CarTable.carID, id)
    });
    return car;
}
//get a car
export const getCarService = async () => {
    const cars = await db.query.CarTable.findMany();
    return cars;
}
//update car
export const updateCarService = async (id: number, car: TICar) => {
    const updatedCar = await db.update(CarTable)
        .set(car)
        .where(eq(CarTable.carID, id))
        .returning();

    if (updatedCar.length === 0) {
        return null;
    }
    return "Car updated successfully";
} 
//delete car
export const deleteCarService = async (id: number) => {
    const deletedCar = await db.delete(CarTable)
        .where(eq(CarTable.carID, id))
        .returning();

    if (deletedCar.length === 0) {
        return null;
    }
    return "Car deleted successfully";
};  
