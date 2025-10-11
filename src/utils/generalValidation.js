import Joi from "joi";

import mongoose from "mongoose";
import { fileTypes } from "./multer/multer.local.js";
import { Gendar, Roles } from "../DB/models/user.models.js";

const checkId = (value, helpers) => {
  if (mongoose.isValidObjectId(value)) {
    return true;
  } else {
    return helpers.message("Invalid object id");
  }
};

export const generalValidation = {
  firstName: Joi.string().min(3).max(15),
  lastName: Joi.string().min(3).max(15),
  email: Joi.string().email(),
  password: Joi.string().min(8).max(20),
  confirmPassword: Joi.string().valid(Joi.ref("password")),
  age: Joi.number().min(18).max(50),
  gendar: Joi.string().valid(Gendar.male, Gendar.female),
  role: Joi.string().valid(Roles.admin, Roles.user),
  phone: Joi.string().regex(/^(\+20|0020|0?)(1)([0125])\d{8}$/),
  otp: Joi.string().length(6),
  id: Joi.string().custom(checkId),

  fieldname: Joi.string().valid("profileImage"),
  originalname: Joi.string(),
  encoding: Joi.string(),
  mimetype: Joi.string().valid(...fileTypes.image),
  destination: Joi.string(),
  filename: Joi.string(),
  path: Joi.string(),
  size: Joi.number().max(10 * 1024 * 1024),
};
