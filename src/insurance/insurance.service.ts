import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { InsuranceTable, TIInsurance } from "../drizzle/schema";


//create insurance service
export const createInsuranceService =async(insurance:TIInsurance) => {
    const[inserted] = await db.insert(InsuranceTable).values(insurance).returning();
    if(inserted) {
        return inserted;
    }   
    return null;
}
// get a insurance  by id
export const getInsuranceByIdService = async (id: number) => {
    const insurance  = await db.query.InsuranceTable.findFirst({
        where: eq(InsuranceTable.insuranceID, id)
    });
    return insurance ;
}
//get a insurance 
export const getInsuranceService = async () => {
    const insurance  = await db.query.InsuranceTable.findMany();
    return insurance;
}
//update insurance 
export const updateInsuranceService = async (id: number, insurance:TIInsurance) => {
    const updatedInsurance  = await db.update(InsuranceTable)
        .set(insurance )
        .where(eq(InsuranceTable.insuranceID, id))
        .returning();

    if (updatedInsurance.length === 0) {
        return null;
    }
    return "Insurance updated successfully";
} 
//delete insurance 
export const deleteInsuranceService = async (id: number) => {
    const deletedInsurance = await db.delete(InsuranceTable)
        .where(eq(InsuranceTable.insuranceID, id))
        .returning();

    if (deletedInsurance.length === 0) {
        return null;
    }
    return "Insurance deleted successfully";
};  
