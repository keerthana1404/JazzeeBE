import {catchAsyncErrors} from "../middlewares/catchAsyncErrors.js"
import ErrorHandler from "../middlewares/error.js"
import {User} from "../models/userSchema.js"
import {v2 as cloudinary} from "cloudinary"
import {sendToken} from "../utils/jwtToken.js"

export const register =catchAsyncErrors(async(req,res,next)=>{
    try{
        const {
            name,
            email,
            phone,
            address,
            password,
            role,
            firstniche,
            secondniche,
            thirdniche,
            coverletter,
        } = req.body;
        
        if(!name || !email || !phone || !address || !password || !role){
            return next(new ErrorHandler("All feilds are required",400));
        }
        if(role === "job seeker" && (!firstniche || !secondniche || !thirdniche)){
            return next(new ErrorHandler("Please provide your preferred job niches",400));
        }
        const existingUser= await User.findOne({email});
        if(existingUser){
            return next(new ErrorHandler("Email registered already",400));
        }
        const userData={
            name,
            email,
            phone,
            address,
            password,
            role : role.toLowerCase(),
            niches:{
                firstniche,
                secondniche,
                thirdniche
            },
            coverletter,
        };
            if(req.files && req.files.resume){
                const {resume} = req.files;
                if(resume){
                    try{
                        const cloudinaryResponse= await cloudinary.uploader.upload(resume.tempFilePath,
                            {folder: "Job_seeker_resume"}
                        )
                        if(!cloudinaryResponse || cloudinaryResponse.error){
                            return next(
                                new ErrorHandler("Failed to upload resume to cloud",500)
                            );
                        }
                        userData.resume={
                            public_id : cloudinaryResponse.public_id,
                            url: cloudinaryResponse.secure_url
                        };
                    }catch(error){
                        return next(new ErrorHandler("Failed to upload resume",500));
                    }
                }
            }
            const user= await User.create(userData);
            sendToken(user,201,res,"User registered.")
            // res.status(201).json({
            //     success : true,
            //     message: " user registered"
            // })
    }catch (error){
        next(error);
    }
})


export const login = catchAsyncErrors(async (req, res, next) => {
    const { role, email, password } = req.body;
    
    if (!role || !email || !password) {
        return next(new ErrorHandler("Email, password, and role are required.", 400));
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return next(new ErrorHandler("Invalid email or password", 400));
    }

    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password", 400));
    }

    if (user.role.toLowerCase() !== role.toLowerCase()) {
        return next(new ErrorHandler("Invalid user role", 400));
    }

    sendToken(user, 200, res, "User logged in successfully");
});


export const logout = catchAsyncErrors(async(req,res,next)=>{
    res.status(200).cookie("token","",{
        expires: new Date(Date.now()),
        httpOnly: true,
    }).json({
        sucess:true,
        message:"Logged out successfully"
    })
})


export const getUser= catchAsyncErrors(async(req,res,next)=>{
    const user= req.user;
    res.status(200).json({
        success: true,
        user,
    })
})


export const updateProfile= catchAsyncErrors(async(req,res,next)=>{
    const newUserData= {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        coverletter: req.body.coverletter,
        niches:{
            firstNiche: req.body.firstNiche,
            secondNiche: req.body.secondNiche,
            thirdNiche: req.body.thirdNiche,
        }
    }
    const { firstNiche, secondNiche, thirdNiche } = newUserData.niches;

    if(req.user.role === "Job seeker" && (!firstNiche || !secondNiche || !thirdNiche)){
        return next(new ErrorHandler("Please provide your all preferred job niches",400))
    }
    if(req.files){
        const resume= req.files.resume;
        if(resume){
            const currentResumeId= req.user.resume.public_id;
            if(currentResumeId){
                await cloudinary.uploader.destroy(currentResumeId);
            }
            const newResume = await cloudinary.uploader.upload(resume.tempFilePath,{
                folder: "Job_seeker_resume"
            });
            newUserData.resume = {
                public_id: newResume.public_id,
                url: newResume.secure_url
            }
        }
    }

    const user = await User.findByIdAndUpdate(req.user.id , newUserData,{
        new: true,
        runValidators: true,
        useFindAndModify: false,
    })
    res.status(200).json({
        success: true,
        user,
        message: "Profile updated.",
    })

})


export const updatePassword = catchAsyncErrors(async (req, res, next) => {
    // Ensure oldPassword is provided
    if (!req.body.oldPassword) {
        return next(new ErrorHandler("Please provide your current password", 400));
    }

    // Fetch the user and explicitly select the password field
    const user = await User.findById(req.user.id).select("+password");

    // Log to debug
    console.log("Entered Password: ", req.body.oldPassword);
    console.log("Stored Hashed Password: ", user.password);

    // Check if the old password matches
    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Old password is incorrect", 400));
    }

    // Check if new password and confirm password match
    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler("New password and confirmed password do not match", 400));
    }

    // Update the password
    user.password = req.body.newPassword;
    await user.save();

    // Send token or response as needed
    sendToken(user, 200, res, "Password updated successfully");
});
