// // export const generateToken = (user, statusCode, message, res) => {
// //   const token = user.generateToken();

// //   // Convert the string from .env to a real number
// //   const cookieExpireDays = Number(process.env.COOKIE_EXPIRE); 

// //   res
// //     .status(statusCode)
// //     .cookie("token", token, {
// //       expires: new Date(
// //         Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000
// //       ),
// //       httpOnly: true,
// //       // Consider adding these for modern browser compatibility:
// //       secure: process.env.NODE_ENV === "production",
// //       sameSite: "None", 
// //     })
// //     .json({
// //       success: true,
// //       user,
// //       message,
// //       token,
// //     });
// // };


// export const generateToken = (user, statusCode, message, res) => {
//   const token = user.generateToken();

//   const cookieExpireDays = Number(process.env.COOKIE_EXPIRE) || 7; 

//   res
//     .status(statusCode)
//     .cookie("token", token, {
//       expires: new Date(
//         Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000
//       ),
//       httpOnly: true,
//       // CHANGE THESE TWO LINES:
//       secure: false,   // Set to false for localhost
//       sameSite: "Lax", // "Lax" is much better for localhost development
//     })
//     .json({
//       success: true,
//       user,
//       message,
//       token,
//     });
// };


export const generateToken = (user, statusCode, message, res) => {
  try {
    const token = user.generateToken(); // Verify this name in your User Model!

    const cookieExpireDays = Number(process.env.COOKIE_EXPIRE) || 1; 

    res
      .status(statusCode)
      .cookie("token", token, {
        expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: false, 
        sameSite: "Lax",
      })
      .json({
        success: true,
        user,
        message,
        token,
      });
  } catch (error) {
    console.log("Token Generation Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};