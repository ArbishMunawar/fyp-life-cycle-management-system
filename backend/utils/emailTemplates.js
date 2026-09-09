export const generateForgetPasswordEmailTemplate = (resetPasswordUrl, name) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2>Password Reset Request</h2>
      <p>Hello ${name},</p>
      <p>You are receiving this email because a password reset request for your <b>FYP Lifecycle Management System</b> account was received.</p>
      <p>Please click the button below to reset your password. This link is valid for <b>15 minutes</b>:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetPasswordUrl}" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
      </div>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      <hr style="border: none; border-top: 1px solid #eee;" />
      <p style="font-size: 0.8em; color: #777;">If you're having trouble clicking the button, copy and paste the link below into your web browser:</p>
      <p style="font-size: 0.8em; color: #007bff;">${resetPasswordUrl}</p>
    </div>
  `;
};

/**
 * Request Accepted Email
 */
export function generateRequestAcceptedTemplate(supervisorName) {
  return `
    <div style="font-family: Arial; padding:20px; background:#fff; border:1px solid #ddd; border-radius:8px;">
      <h2 style="color:#10b981;">✅ Supervisor Request Accepted</h2>
      <p>Your supervisor request has been accepted by <strong>${supervisorName}</strong>.</p>
      <p>You can now start working on your project and upload files.</p>
    </div>
  `;
}

/**
 * Request Rejected Email
 */
export function generateRequestRejectedTemplate(supervisorName) {
  return `
    <div style="font-family: Arial; padding:20px; background:#fff; border:1px solid #ddd; border-radius:8px;">
      <h2 style="color:#ef4444;">❌ Supervisor Request Rejected</h2>
      <p>Your supervisor request has been rejected by <strong>${supervisorName}</strong>.</p>
      <p>You can try requesting another supervisor.</p>
    </div>
  `;
}
