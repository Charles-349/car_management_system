import db from "../drizzle/db";
import { eq } from "drizzle-orm";
import { LocationTable,TILocation } from "../drizzle/schema";

// Create location service
export const createLocationService = async (location: TILocation) => {
    await db.insert(LocationTable).values(location);
    return "Location created successfully";
};

//get all locations
export const getLocationsService = async () => {
    const locations = await db.query.LocationTable.findMany();
    return locations;
}

//get location by id
export const getLocationByIdService = async (id: number) => {
    const location = await db.query.LocationTable.findFirst({
        where: eq(LocationTable.locationID, id)
    });
    return location;
}
//update location
export const updateLocationService = async (id: number, location: TILocation) => {
    const updatedLocation = await db.update(LocationTable)
        .set(location)
        .where(eq(LocationTable.locationID, id))
        .returning();

    if (updatedLocation.length === 0) {
        return null;
    }
    return "Location updated successfully";
}

//delete location by id
export const deleteLocationService = async (id: number) => {
    const deletedLocation = await db.delete(LocationTable)
        .where(eq(LocationTable.locationID, id))
        .returning();

    if (deletedLocation.length === 0) {
        return null;
    }
    return "Location deleted successfully";
}