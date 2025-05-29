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