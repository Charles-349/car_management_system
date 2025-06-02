import Jwt, {decode} from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import "dotenv/config"; 

//implementing a middware to check user roles
export const checkRoles = (requiredRole:"admin" | "user" | "both") => {
    return(req: Request, res: Response, next: NextFunction):void => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const token = authHeader.split(' ')[1];
        try {
            const decoded = Jwt.verify(token, process.env.JWT_SECRET_KEY as string);
            (req as any).user = decoded;
            
            //check for roles
        if(

            typeof decoded === 'object' &&
            decoded!==null &&
            'role' in decoded 
        ){//check if decoded is an object and has a role property
            if(requiredRole === "both"){
                if(decoded.role === "admin" || decoded.role === "user"){
                    next();
                    return;
                }
            } else if (decoded.role === requiredRole) {
                next();
                return;
            }
            res.status(401).json({ message: 'Unauthorized' });
        } else {
            res.status(401).json({ message: 'Invalid tiken payload' });
        }
        } catch (error) {
            res.status(401).json({ message: 'Invalid token' });
        }
    };
    };
export const adminRoleAuth = checkRoles("admin");
export const userRoleAuth = checkRoles("user");
export const bothRoleAuth = checkRoles("both");