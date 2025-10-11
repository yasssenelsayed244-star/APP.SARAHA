import { customAlphabet } from "nanoid";
import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    service: "gmail",
    auth: {
      user: process.env.USER,
      pass: process.env.PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const main = async () => {
    const info = await transporter.sendMail({
      from: `Saraha App <${process.env.USER}>`,
      to,
      subject,
      html,
    });
    console.log({ info });
  };

  main().catch((err) => {
    console.log({ emailError: err });
  });
};

export const createOtp = () => {
  const custom = customAlphabet("0123456789");
  const otp = custom(6);
  return otp;
};
