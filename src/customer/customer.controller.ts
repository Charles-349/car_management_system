import { Request, Response } from "express";
import {createCustomerService,getCustomerWithReservationsService,getCustomersWithPaymentsAndBookingsServiceById,getCustomersWithPaymentsAndBookingsService,getCustomerWithBookings,verifyCustomerService,updateVerificationCodeService,getCustomerByEmailService,customerLoginService ,deleteCustomerService, getCustomerService,updateCustomerService, getCustomerByIdService} from "./customer.service";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import"dotenv/config";
import { sendEmail } from "../mailer/mailer";
import reservation from "../reservation/reservation.router";


//create customer controller
export const createCustomerController = async (req: Request, res: Response) => {
    try {
        const customer = req.body;
        const password = customer.password;
        if (!password || password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }
        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);
        customer.password = hashedPassword;

        //generate a 6 digit verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expirationTime = new Date(Date.now() + 1 * 60 * 1000); // 1 minute from now
        customer.verificationCode = verificationCode;
        customer.verificationCodeExpiresAt = expirationTime;
        customer.isVerified = false; // Set isVerified to false by default
        const createCustomer = await createCustomerService(customer);
        if(!createCustomer) return res.json({message: "customer not created"})
            try {
                await sendEmail(
                    customer.email,
                    "Verify your account",
                    `Hello ${customer.firstName}, your verification code is: ${verificationCode}. Please use this code to verify your account`,
                    `<div>
                        <h2>Hello ${customer.firstName},</h2>
                        <p>Your verification code is <strong>${verificationCode}</strong>.</p>
                        <p>Please use this code to verify your account.</p>
                        <p>Thank you!</p>
                    </div>`
                );
            } catch (emailError) {
                console.error("Failed to send verification email:", emailError);
            
                
            }
        return res.status(201).json({
            message: "Customer created successfully. Please check your email for the verification code.",
        });
        
    } catch (error:any) {
        return res.status(500).json({
            message: error.message});
    
        
    }
};

export const verifyCustomerController = async (req: Request, res: Response) => {
    const { email, code } = req.body;
    try {
        const customer = await getCustomerByEmailService(email);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
          // Insert expiration check 
        if (!customer.verificationCodeExpiresAt || new Date() > new Date(customer.verificationCodeExpiresAt)) {
            return res.status(400).json({ message: "Verification code has expired. Please request a new one." });
        }

        if (customer.verificationCode === code) {
            await verifyCustomerService(email);

            // Send verification success email
            try {
                await sendEmail(
                    customer.email,
                    "Account Verified Successfully",
                    `Hello ${customer.lastName}, your account has been verified. You can now log in and use all features.`,
                    `<div>
                    <h2>Hello ${customer.lastName},</h2>
                    <p>Your account has been <strong>successfully verified</strong>!</p>
                     <p>You can now log in and enjoy our services.</p>
                     </div>`
                )

            } catch (error: any) {
                console.error("Failed to send verification success email:", error);

            }
            return res.status(200).json({ message: "User verified successfully" });
        } else {
            return res.status(400).json({ message: "Invalid verification code" });
        }
    } catch (error: any) {
        return res.status(500).json({ error: error.message });

    }
}

export const resendVerificationCodeController = async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        const customer = await getCustomerByEmailService(email);

        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        if (customer.isVerified) {
            return res.status(400).json({ message: "Customer is already verified" });
        }

        // Generate new verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expirationTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

        // Update code and expiration
        await updateVerificationCodeService(email, verificationCode, expirationTime);

        // Send new verification email
        await sendEmail(
            email,
            "New Verification Code",
            `Hello ${customer.firstName}, here is your new verification code: ${verificationCode}`,
            `<div>
                <h2>Hello ${customer.firstName},</h2>
                <p>Your new verification code is <strong>${verificationCode}</strong>.</p>
                <p>Please use this code to verify your account.</p>
            </div>`
        );

        return res.status(200).json({ message: "New verification code sent successfully" });

    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};



//customer login controller
export const customerLoginController = async (req: Request, res: Response) => {
    try {
        const customer = req.body;
//check if user exists
        const customerExist = await customerLoginService(customer);
        if (!customerExist) {
            return res.status(404).json({ message: "customer not found" });
        }
        //verify password
        const customerMatch = await bcrypt.compare(customer.password, customerExist.password);
        if (!customerMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        //create a payload for JWT
        const payload = {
            sub : customerExist.customerID,
            customerID: customerExist.customerID,
            firstName: customerExist.firstName,
            lastName: customerExist.lastName,
            email: customerExist.email,
            phoneNumber: customerExist.phoneNumber,
            address: customerExist.address,
            role: customerExist.role,
            // exp : Math.floor(Date.now() / 1000) + 60  // 1 minute expiration
        };
        //generate JWT token
        const secret = process.env.JWT_SECRET_KEY as string;
        if (!secret) {
            throw new Error("JWT secret is not defined in the environment variables");
        }
        // const token = jwt.sign(payload, secret);
        const token = jwt.sign(payload, secret, { expiresIn: '3600s' });
        return res.status(200).json({
            message: "Login successful",
            token,
            customer: {
                customerID: customerExist.customerID,
                firstName: customerExist.firstName,
                lastName: customerExist.lastName,
                email: customerExist.email,
                phoneNumber: customerExist.phoneNumber,
                address: customerExist.address,
                role: customerExist.role
            }
        });
    } catch (error: any) {
        return res.status(500).json({message:error.message});
    }
};
export const getCustomerController = async (req: Request, res: Response) => {
      try {
        const customers = await getCustomerService();
        if (!customers || customers.length === 0) {
            return res.status(404).json({ message: "No customers found" });
        }
        return res.status(200).json({ message: "Customers retrieved successfully", customers });
    } catch (error: any) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}
//get customer by id controller
export const getCustomerByIdController = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid customer ID" });
        }
        const customer = await getCustomerByIdService(id);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        return res.status(200).json({ message: "Customer retrieved successfully", customer });
    } catch (error: any) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}


//get customer with bookings controller
export const getCustomerWithBookingsController = async(req: Request, res: Response)=>{
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid customer ID' });
    }

    try {
        const customer = await getCustomerWithBookings(id);

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        return res.status(200).json(customer);
    } catch (error) {
        console.error('Error fetching customer with bookings:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

//bookings and payments
export const getCustomersWithPaymentsAndBookingsController = async (req: Request, res: Response) => {
    try {
        const customers = await getCustomersWithPaymentsAndBookingsService();
        if (!customers || customers.length === 0) {
            return res.status(404).json({ message: "No customers with bookings and payments found" });
        }
        return res.status(200).json({ message: "Customers with bookings and payments retrieved successfully", customers });
    } catch (error: any) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

//update customer controller
export const updateCustomerController = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(404).json({ message: "Invalid customer ID" });
        }
        const customer = req.body;
        const existingCustomer = await getCustomerByIdService(id);
        if (!existingCustomer) {
            return res.status(404).json({ message: "Customer not found" });

        }
        const updatedCustomer = await updateCustomerService(id, customer);
        if (!updatedCustomer) {
            return res.status(404).json({ message: "Customer not updated" });
        }
        return res.status(200).json({ message: "Customer updated successfully" });

        
    } catch (error:any) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
        
    }
}

//delete customer controller
export const deleteCustomerController = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(404).json({ message: "Invalid customer ID" });
        }
        const existingCustomer = await getCustomerByIdService(id);
        if (!existingCustomer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        const deletedCustomer = await deleteCustomerService(id);
        if (!deletedCustomer) {
            return res.status(404).json({ message: "Customer not deleted" });
        }
        return res.status(200).json({ message: "Customer deleted successfully" });
        
    } catch (error:any) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
        
    }
}
export const getCustomerWithReservationsController = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid customer ID" });
        }
        const customer = await getCustomerWithReservationsService(id);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        return res.status(200).json({ message: "Customer with reservations retrieved successfully", customer });
    } catch (error: any) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
export const getCustomersWithPaymentsAndBookingsControllerById = async(req: Request, res: Response)=>{
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid customer ID' });
    }

    try {
        const customer = await getCustomersWithPaymentsAndBookingsServiceById(id);

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        return res.status(200).json(customer);
    } catch (error) {
        console.error('Error fetching customer with bookings:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
