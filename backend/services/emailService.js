import nodeMailer from "nodemailer";

export const sendEmail = async ({ to, subject, message }) => {
  try {
    // 1. Create the transporter using SMTP settings
    const transporter = nodeMailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      service: process.env.SMTP_SERVICE,
    });

    // 2. Define the email options
    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject,
      html: message,
    };

    // 3. Send the mail and return the info
    const info = await transporter.sendMail(mailOptions);
    return info;

  } catch (error) {
    // 4. Throw error to be caught by the controller's catch block
    throw new Error(error.message || "Cannot send email");
  }
};