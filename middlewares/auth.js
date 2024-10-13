
import jwt from "jsonwebtoken"; 
import { User } from "../models/userSchema.js";
import { catchAsyncErrors } from "./catchAsyncErrors.js";
import ErrorHandler from "./error.js";

export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return next(new ErrorHandler("User is not authenticated", 400));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = await User.findById(decoded.id);
        next();
    } catch (err) {
        return next(new ErrorHandler("Invalid token or expired session", 401));
    }

});


// export const isAutherised = (...roles)=>{
//     return(req,res,next)=>{
//         if(!roles.includes(req.user.role)){
//             return next(new ErrorHandler(`${req.user.role} not allowed to access this resource`))
//         }
//         next();
//     }
// }

export const isAutherised = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        console.log(req.user.role);
        console.log(roles);
      return next(
        new ErrorHandler(
          `${req.user.role} not allowed to access this resource`,
          403
        )
      );
    }
    next();
  };
};

