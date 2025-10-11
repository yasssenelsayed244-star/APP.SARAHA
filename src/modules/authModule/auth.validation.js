import Joi from "joi";
import { generalValidation } from "../../utils/generalValidation.js";

export const signupSchema = Joi.object({
  firstName: generalValidation.firstName.required(),
  lastName: generalValidation.lastName.required(),
  email: generalValidation.email.required(),
  password: generalValidation.password.required(),
  confirmPassword: generalValidation.confirmPassword.required(),
  age: generalValidation.age,
  gendar: generalValidation.gendar,
  role: generalValidation.role,
  phone: generalValidation.phone.required(),
});

export const loginSchema = Joi.object({
  email: generalValidation.email.required(),
  password: generalValidation.password.required(),
}).required();

export const confirmEmailSchema = Joi.object({
  email: generalValidation.email.required(),
  otp: generalValidation.otp.required(),
});

export const reSendEmailOtp = Joi.object({
  email: generalValidation.email.required(),
});
