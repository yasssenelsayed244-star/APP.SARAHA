import { compare } from "bcryptjs";
import { findByEmail } from "../../DB/DBServices.js";

import { decodeToken, tokenTypes } from "../../middleware/auth.middleware.js";
import {
  InvalidCredentialsException,
  InvalidLoginMethodException,
  InvalidOTPException,
  NotConfiermedException,
  NotFoundException,
  NotValidEmailException,
  OTPExpiredException,
} from "../../utils/exceptions.js";
import { successHandler } from "../../utils/successHandler.js";
import jwt from "jsonwebtoken";
import { createOtp, sendEmail } from "../../utils/sendEmail/sendEmail.js";
import { customAlphabet } from "nanoid";
import { template } from "../../utils/sendEmail/generateHTML.js";
import { hash } from "../../utils/bycrypt.js";
import { OAuth2Client } from "google-auth-library";
import { StatusCodes } from "http-status-codes";
import { providers, userModule } from "../../DB/models/user.models.js";

const client = new OAuth2Client();

export const signup = async (req, res, next) => {
  const { firstName, lastName, email, password, age, gendar, role, phone } =
    req.body;

  const isExist = await userModule.findOne({ email });
  if (isExist) {
    throw new NotValidEmailException();
  }

  const otp = createOtp();
  const subject = "Email confirmation";
  const html = template(otp, firstName, subject);

  const user = await userModule.create({
    firstName,
    lastName,
    email,
    password,
    age,
    gendar,
    role,
    phone,
    emailOtp: {
      otp: hash(otp),
      expiredAt: Date.now() + 1000 * 60 * 30,
    },
  });

  await sendEmail({ to: user.email, html, subject });
  return successHandler({ res, data: user, status: 201 });
};

export const confirmEmail = async (req, res, next) => {
  const { otp, email } = req.body;
  const user = await findByEmail(email);

  if (!user) {
    throw new NotFoundException("email");
  }
  if (!user.emailOtp.otp) {
    throw new Error("No OTP exists", { cause: 409 });
  }
  if (user.emailOtp.expiredAt <= Date.now()) {
    throw new OTPExpiredException();
  }
  if (!compare(otp, user.emailOtp.otp)) {
    throw new InvalidOTPException();
  }

  await user.updateOne({
    confirmed: true,
    $unset: {
      emailOtp: "",
    },
  });

  return successHandler({ res });
};

export const reSendEmailOtp = async (req, res, next) => {
  const { email } = req.body;
  const user = await findByEmail(email);

  if (!user) {
    throw new NotFoundException("email");
  }
  if (user.confirmed) {
    throw new Error("Already confirmed", { cause: 400 });
  }
  if (user.emailOtp.expiredAt > Date.now()) {
    throw new Error("Use last sent OTP", { cause: 400 });
  }

  const otp = createOtp();
  const subject = "Email confirmation (Resend OTP)";
  const html = template(otp, user.firstName, subject);

  await sendEmail({ to: user.email, html, subject });
  await user.updateOne({
    emailOtp: {
      otp: hash(otp),
      expiredAt: Date.now() + 1000 * 60 * 30,
    },
  });

  return successHandler({ res });
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await userModule.findOne({ email });

  if (!user || !user.checkPassword(password)) {
    throw new InvalidCredentialsException();
  }
  if (!user?.confirmed) {
    throw new NotConfiermedException();
  }
  if (user.provider === providers.google) {
    throw new InvalidLoginMethodException();
  }

  const accessToken = jwt.sign(
    { _id: user._id },
    process.env.ACCESS_SEGNATURE,
    { expiresIn: "1h" }
  );

  const refreshToken = jwt.sign(
    { _id: user._id },
    process.env.REFRESH_SEGNATURE,
    { expiresIn: "7d" }
  );

  return successHandler({
    res,
    data: {
      accessToken,
      refreshToken,
    },
    status: 200,
  });
};

export const refreshToken = async (req, res, next) => {
  const { refreshToken } = req.body;
  const user = await decodeToken({
    authorization: refreshToken,
    type: tokenTypes.refresh,
    next,
  });

  const accessToken = jwt.sign(
    { _id: user._id },
    process.env.ACCESS_SEGNATURE,
    { expiresIn: "1h" }
  );

  return successHandler({
    res,
    data: { accessToken },
  });
};

export const getUserProfile = async (req, res, next) => {
  const user = req.user;
  successHandler({ res, data: user });
};

export const forgetPass = async (req, res, next) => {
  const { email } = req.body;
  const user = await findByEmail(email);

  if (!user) {
    throw new NotFoundException("email");
  }
  if (!user.confirmed) {
    throw new Error("User not confirmed", { cause: 409 });
  }

  const otp = createOtp();
  const subject = "Forget Password";
  const html = template(otp, user.firstName, subject);

  await sendEmail({ to: user.email, html, subject });
  await user.updateOne({
    passwordOtp: {
      otp: hash(otp),
      expiredAt: Date.now() + 1000 * 60 * 60,
    },
  });

  return successHandler({ res });
};

export const changePass = async (req, res, next) => {
  const { email, otp, password } = req.body;
  const user = await findByEmail(email);

  if (!user) {
    throw new NotFoundException("user");
  }
  if (!user.passwordOtp.otp) {
    throw new Error("No OTP exists", { cause: 409 });
  }
  if (user.passwordOtp.expiredAt <= Date.now()) {
    throw new OTPExpiredException();
  }
  if (!compare(otp, user.passwordOtp.otp)) {
    throw new InvalidOTPException();
  }

  await user.updateOne({
    password,
    $unset: {
      passwordOtp: "",
    },
    changedCradentialAt: Date.now(),
  });

  return successHandler({ res });
};

export const socialLogin = async (req, res, next) => {
  const idToken = req.body.idToken;
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const {
    email,
    email_verified,
    given_name: firstName,
    family_name: lastName,
  } = ticket.getPayload();

  let user = await findByEmail(email);

  if (user?.provider === providers.system) {
    throw new InvalidLoginMethodException();
  }
  if (!user) {
    user = await userModule.create({
      email,
      firstName,
      lastName,
      confirmed: email_verified,
      provider: providers.google,
    });
  }
  if (!user.confirmed) {
    throw new NotConfiermedException();
  }

  const accessToken = jwt.sign(
    { _id: user._id },
    process.env.ACCESS_SEGNATURE,
    { expiresIn: "1h" }
  );

  const refreshToken = jwt.sign(
    { _id: user._id },
    process.env.REFRESH_SEGNATURE,
    { expiresIn: "7d" }
  );

  return successHandler({
    res,
    data: {
      accessToken,
      refreshToken,
    },
  });
};

export const updateEmail = async (req, res, next) => {
  const user = req.user;
  const { email } = req.body;

  if (user.email === email) {
    throw new Error("Update your email with new email", {
      cause: StatusCodes.BAD_REQUEST,
    });
  }

  const isExist = await findByEmail(email);
  if (isExist) {
    throw new NotValidEmailException();
  }

  const oldEmailOtp = createOtp();
  const oldEmailHTML = template(
    oldEmailOtp,
    user.firstName,
    "Confirm update email"
  );
  sendEmail({
    to: user.email,
    subject: "Confirm update email",
    html: oldEmailHTML,
  });

  user.oldEmailOtp = {
    otp: hash(oldEmailOtp),
    expiredAt: Date.now() + 5 * 60 * 60 * 1000,
  };

  const newEmailOtp = createOtp();
  const newEmailHTML = template(
    newEmailOtp,
    user.firstName,
    "Confirm new email"
  );
  sendEmail({
    to: email,
    subject: "Confirm new email",
    html: newEmailHTML,
  });

  user.newEmailOtp = {
    otp: hash(newEmailOtp),
    expiredAt: Date.now() + 5 * 60 * 60 * 1000,
  };
  user.newEmail = email;
  await user.save();

  return successHandler({ res });
};

export const confirmNewEmail = async (req, res, next) => {
  const user = req.user;
  const { oldEmailOtp, newEmailOtp } = req.body;

  if (!user.newEmailOtp?.otp) {
    throw new InvalidOTPException();
  }
  if (
    user.oldEmailOtp?.expiredAt <= Date.now() ||
    user.newEmailOtp?.expiredAt <= Date.now()
  ) {
    throw new OTPExpiredException();
  }
  if (
    !(await compare(oldEmailOtp, user.oldEmailOtp.otp)) ||
    !(await compare(newEmailOtp, user.newEmailOtp.otp))
  ) {
    throw new InvalidOTPException();
  }

  user.email = user.newEmail;
  user.newEmail = undefined;
  user.oldEmailOtp = undefined;
  user.newEmailOtp = undefined;
  await user.save();

  return successHandler({ res, data: user.email });
};
