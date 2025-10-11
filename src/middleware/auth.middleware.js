import jwt from "jsonwebtoken";
import {
  InvalidTokenException,
  LoginAgainException,
  NotConfiermedException,
  NotFoundException,
  UnAuthorizedException,
} from "../utils/exceptions.js";
import { findById } from "../DB/DBServices.js";
import { userModule } from "../DB/models/user.models.js";

export const tokenTypes = {
  access: "access",
  refresh: "refresh",
};
Object.freeze(tokenTypes);

export const decodeToken = async ({
  authorization = "",
  type = tokenTypes.access,
  next,
}) => {
  if (!authorization) {
    return next(new InvalidTokenException());
  }
  if (!authorization.startsWith(process.env.BEARER)) {
    return next(new InvalidTokenException());
  }

  const token = authorization.split(" ")[1];

  let signature = process.env.ACCESS_SEGNATURE;
  if (type === tokenTypes.refresh) {
    signature = process.env.REFRESH_SEGNATURE;
  }

  const data = jwt.verify(token, signature);
  const user = await findById({
    model: userModule,
    id: data._id,
  });

  if (!user) {
    return next(new NotFoundException("user"));
  }
  if (!user.confirmed) {
    return next(new NotConfiermedException());
  }
  if (user.changedCradentialAt?.getTime() >= data.iat * 1000) {
    throw new LoginAgainException();
  }
  return user;
};

export const auth = () => {
  return async (req, res, next) => {
    const authorization = req.headers.authorization;
    const user = await decodeToken({ authorization, next });
    req.user = user;
    next();
  };
};

export const allowTo = (...roles) => {
  return async (req, res, next) => {
    const user = req.user;
    if (!roles.includes(user.role)) {
      throw new UnAuthorizedException();
    }
    next();
  };
};
