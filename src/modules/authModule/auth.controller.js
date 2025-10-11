import { Router } from "express";
import * as authServices from "./auth.services.js";
import { errorHandle } from "../../utils/errorHandling.js";
import { auth } from "../../middleware/auth.middleware.js";
import { loginSchema, signupSchema } from "./auth.validation.js";
import { validation } from "../../middleware/validation.middleware.js";

const router = Router();

router.post(
  "/signup",
  validation(signupSchema),
  errorHandle(authServices.signup)
);
router.post("/confirm-email", errorHandle(authServices.confirmEmail));
router.post("/resend-email-otp", errorHandle(authServices.reSendEmailOtp));
router.post("/login", validation(loginSchema), errorHandle(authServices.login));
router.get("/", auth(), errorHandle(authServices.getUserProfile));
router.post("/refresh-token", errorHandle(authServices.refreshToken));
router.post("/forget-Password", errorHandle(authServices.forgetPass));
router.post("/change-Password", errorHandle(authServices.changePass));
router.post("/social-login", errorHandle(authServices.socialLogin));
router.patch("/update-email", auth(), errorHandle(authServices.updateEmail));
router.patch(
  "/confirm-new-email",
  auth(),
  errorHandle(authServices.confirmNewEmail)
);

export default router;
