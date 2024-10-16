import {catchAsyncErrors} from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js"
import { User } from "../models/userSchema.js";
import {generateToken} from "../utils/jwtToken.js"

export const patientRegister = catchAsyncErrors(async(req, res, next)=>{
    const {
        firstName, 
        lastName, 
        email, 
        phone, 
        password, 
        gender, 
        dob, 
        nic, 
        role
    } = req.body;
    if(
        ! firstName ||
        ! lastName ||
        ! email ||
        ! phone ||
        ! password || 
        ! gender || 
        ! dob ||
        ! nic ||
        ! role 
    ){
        return next(new ErrorHandler("Pleasaae Fill Form Fully!", 400));
    }
    let user = await User.findOne({ email });
    if(user){
        return next(new ErrorHandler("User Already Registered!", 400));
    }
    user = await User.create({
        firstName, 
        lastName, 
        email, 
        phone, 
        password, 
        gender, 
        dob, 
        nic, 
        role,
    });
    generateToken(user, "User Registered!", 400, res);
    

});

export const login = catchAsyncErrors(async(req, res, next)=>{
    const {email, password, confirmPassword, role} = req.body;
    if(!email || !password || !confirmPassword || !role){
        return next(new ErrorHandler("Please Provide All Details!", 400));
    }
    if(password !== confirmPassword){
        return next(new ErrorHandler("The password you've entered is Incorrect!", 400));
    }
    const user = await User.findOne({email}).select("+password");
    if(!user){
        return next(new ErrorHandler("Invalid Password Or Email", 400)); 
    }
    const isPasswordMatched = await user.comparePassword(password);
    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid Password Or Email", 400));
    }
    if(role !== user.role){
        return next(new ErrorHandler("User with this Role not found!", 400)); 
    }
    generateToken(user, "User Logged-In Successfully!", 400, res);
});
