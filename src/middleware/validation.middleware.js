import { StatusCodes } from "http-status-codes";

export const validation = (Schema) => {
  return (req, res, next) => {
    const data = {
      ...req.body,
      ...req.params,
      ...req.query,
      ...req.file,
    };

    const result = Schema.validate(data, { abortEarly: false });
    if (result.error) {
      throw new Error(result.error, { cause: StatusCodes.BAD_REQUEST });
    }

    next();
  };
};
