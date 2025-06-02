import { eq, sql } from "drizzle-orm";
import db from "../drizzle/db";
import { CustomerTable, TICustomer } from "../drizzle/schema";
import customer from "./customer.router";


//create customer
export const createCustomerService = async (customer:TICustomer) => {
    await db.insert(CustomerTable).values(customer);
    return "Customer created successfully";
};
export const getCustomerByEmailService = async (email: string) => {
    return await db.query.CustomerTable.findFirst({
        where: sql`${CustomerTable.email} = ${email}`

    });
};

    
export const verifyCustomerService=async (email: string) => {
    await db.update(CustomerTable)
        .set({ isVerified: true, verificationCode: null })
        .where(sql`${CustomerTable.email} = ${email}`);
} 

//customer login service
export const customerLoginService = async(customer:TICustomer) => {
    const { email } = customer;
    return await db.query.CustomerTable.findFirst({
        columns: {
            customerID: true,
            firstName: true,
            lastName: true,
            email: true,
            password: true,
            phoneNumber: true,
            address: true,
            role: true
        },
        where: sql`${CustomerTable.email} = ${email}`
    });
};

//get customer
export const getCustomerService = async()=> {
    const customer = await db.query.CustomerTable.findMany();
    return customer;
};
//get customer by id
export const getCustomerByIdService = async (id: number) => {
    const customer = await db.query.CustomerTable.findFirst({
        where : eq(CustomerTable.customerID, id)        
    })
    return customer;
};

//update customer
export const updateCustomerService = async (id: number, customer: TICustomer) => {
    const updatedCustomer = await db.update(CustomerTable)
        .set(customer)
        .where(eq(CustomerTable.customerID, id))
        .returning();
    
    if (updatedCustomer.length === 0) {
        return null;
    }
    return "Customer updated successfully";
}

//delete customer
export const deleteCustomerService = async (id: number) => {
    const deletedCustomer = await db.delete(CustomerTable)
        .where(eq(CustomerTable.customerID, id))
        .returning();
    
    if (deletedCustomer.length === 0) {
        return null;
    }
    return "Customer deleted successfully";
};