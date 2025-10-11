import Joi from "joi";
import { generalValidation } from "../../utils/generalValidation.js";

export const getUserByIdSchema = Joi.object({
  id: generalValidation.id.required(),
});

export const updateBasicInfoSchema = Joi.object({
  firstName: generalValidation.firstName,
  lastName: generalValidation.lastName,
  age: generalValidation.age,
  phone: generalValidation.phone,
});

export const profileImageSchema = Joi.object({
  fieldname: generalValidation.fieldname.required(),
  originalname: generalValidation.originalname.required(),
  encoding: generalValidation.encoding.required(),
  mimetype: generalValidation.mimetype.required(),
  destination: generalValidation.destination.required(),
  filename: generalValidation.filename.required(),
  path: generalValidation.path.required(),
  size: generalValidation.size.required(),
});
