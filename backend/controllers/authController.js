import { asyncHandler } from "../middleware/asyncHandler.js";
import ErrorHandler from "../middleware/error.js";
import { User } from "../models/user.js";
import { sendEmail } from "../services/emailService.js";
import { generateForgetPasswordEmailTemplate } from "../utils/emailTemplates.js";
import { generateToken } from "../utils/generateToken.js";
import crypto from "crypto";

// REGISTER USER
export const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }
  let user = await User.findOne({ email });
  if (user) {
    return next(new ErrorHandler("User already exists", 400));
  }
  user = new User({ name, email, password, role });
  await user.save();
  generateToken(user, 201, "User Registered successfully", res);
});

//login
export const login = asyncHandler(async (req, res, next) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }
  const user = await User.findOne({ email, role }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid email, password or role", 401));
  }
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email, password or role", 401));
  }
  generateToken(user, 201, "Logged in successfully", res);
});

export const getUser = asyncHandler(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

export const logout = asyncHandler(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "Logged out successfully",
    });
});

// export const forgotPassword = asyncHandler(async (req, res, next) => {

//   console.log("DEBUG: Is 'next' a function?", typeof next === 'function');
//   console.log("DEBUG: Email from body:", req.body.email);

//   // 1. Find user by email
//   const user = await User.findOne({ email: req.body.email });

//   if (!user) {
//     console.log("DEBUG: User not found, calling next with ErrorHandler");
//     return next(new ErrorHandler("User not found with this email", 404));
//   }

//   // 2. Get reset token from the model method
//   const resetToken = user.getResetPasswordToken();
// console.log("DEBUG: Token generated, attempting user.save()");
//   // 3. Save user with the hashed token and expiry (disable validation)
//   await user.save({ validateBeforeSave: false });

//   // 4. Create the URL for the frontend
//   const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

//   // 5. Generate the HTML message
//   const message = generateForgetPasswordEmailTemplate(resetPasswordUrl, user.name);

//   try {
//     // 6. Attempt to send the email
//     await sendEmail({
//       to: user.email,
//       subject: "FYP SYSTEM - 🔐 Password Reset Request",
//       message,
//     });

//     res.status(200).json({
//       success: true,
//       message: `Email sent to ${user.email} successfully`,
//     });

//   } catch (error) {
//     console.log("DEBUG: Catch block hit. Error:", error.message);
//     // 7. If email fails, cleanup the database fields
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpire = undefined;

//     await user.save({ validateBeforeSave: false });

//     return next(new ErrorHandler(error.message || "Cannot send email", 500));
//   }
// });

export const forgotPassword = asyncHandler(async (req, res, next) => {


  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    console.log("3. User not found, calling next(ErrorHandler)");
    return next(new ErrorHandler("User not found with this email", 404));
  }

  // 2. Token Generation
  console.log("4. User found, generating token...");
  const resetToken = user.getResetPasswordToken();


  try {
    console.log("5. Attempting to save user with token...");
    await user.save({ validateBeforeSave: false });
    console.log("6. User saved successfully!");
  } catch (saveError) {
    // ADD THIS LINE TO SEE THE REAL ERROR IN YOUR TERMINAL
    console.log("DETAILED DATABASE ERROR:", saveError);

    return next(new ErrorHandler("Database save failed", 500));
  }

  const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  // Use user.name for the template as discussed
  const message = generateForgetPasswordEmailTemplate(
    resetPasswordUrl,
    user.name,
  );

  try {
    console.log("7. Attempting to send email...");
    await sendEmail({
      to: user.email,
      subject: "FYP SYSTEM - 🔐 Password Reset Request",
      message,
    });

    console.log("8. Email sent successfully!");
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    console.log("9. Email failed, cleaning up fields...");
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    console.log("10. Calling next with Email Error");
    return next(new ErrorHandler(error.message || "Cannot send email", 500));
  }
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  // 1. Hash the token from the URL params to match the database version
  const { token } = req.params;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  // 2. Find user with matching token and an expiry date that hasn't passed
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler("Invalid or expired password reset token", 400),
    );
  }

  // 3. Validate that both password fields are provided
  if (!req.body.password || !req.body.confirmPassword) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  // 4. Check if passwords match
  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new ErrorHandler("Password and Confirm Password do not match", 400),
    );
  }

  // 5. Update password and clear reset fields
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  // 6. Save the user (this will trigger password hashing if set up in your model)
  await user.save();

  // 7. Log the user in immediately by generating a new JWT token
  generateToken(user, 200, "Password reset successful", res);
});
