import { compareSync, hashSync } from "bcryptjs";

export const hash = (password) => {
  return hashSync(password, Number(process.env.BCRTPT_SALT_ROUNDS));
};

export const compare = (text, hashedText) => {
  return compareSync(text, hashedText);
};
