import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { MaintenanceTable, TIMaintenance} from "../drizzle/schema";


//create maintenance service
export const createMaintenanceService =async(maintenance:TIMaintenance) => {
    const[inserted] = await db.insert(MaintenanceTable).values(maintenance).returning();
    if(inserted) {
        return inserted;
    }   
    return null;
}
// get a maintenance by id
export const getMaintenanceByIdService = async (id: number) => {
    const maintenance = await db.query.MaintenanceTable.findFirst({
        where: eq(MaintenanceTable.maintenanceID, id)
    });
    return maintenance;
}
//get a maintenance
export const getMaintenanceService = async () => {
    const maintenance = await db.query.MaintenanceTable.findMany();
    return maintenance;
}
//update maintenance
export const updateMaintenanceService = async (id: number, maintenance:TIMaintenance) => {
    const updatedMaintenance = await db.update(MaintenanceTable)
        .set(maintenance)
        .where(eq(MaintenanceTable.maintenanceID, id))
        .returning();

    if (updatedMaintenance.length === 0) {
        return null;
    }
    return "Maintenance updated successfully";
}
//delete maintenance
export const deleteMaintenanceService = async (id: number) => {
    const deletedMaintenance = await db.delete(MaintenanceTable)
        .where(eq(MaintenanceTable.maintenanceID, id))
        .returning();

    if (deletedMaintenance.length === 0) {
        return null;
    }
    return "Maintenance deleted successfully";
}