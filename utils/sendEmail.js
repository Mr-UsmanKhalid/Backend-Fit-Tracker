require("dotenv").config();

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  const info = await transporter.sendMail({
    from: `"Fitness Tracking" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });

  console.log("Email sent:", info.messageId);
};

module.exports = sendEmail;