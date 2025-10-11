import { Router } from "express";
import {
  covarImages,
  deleteUser,
  getProfile,
  getUserById,
  profileImage,
  restoreAccount,
  shareProfile,
  softDelete,
  updateBasicInfo,
} from "./user.services.js";
import { validation } from "../../middleware/validation.middleware.js";
import {
  getUserByIdSchema,
  profileImageSchema,
  updateBasicInfoSchema,
} from "./user.validation.js";
import { allowTo, auth } from "../../middleware/auth.middleware.js";
import { uploadToCloud } from "../../utils/multer/multer.cloud.js";
import { errorHandle } from "../../utils/errorHandling.js";
// import messageRouters from "../messageModule/message.controller.js";
import { Roles } from "../../DB/models/user.models.js";

const router = Router();

// router.use("/get-user/:id/messages", messageRouters);

router.get("/share-profile", auth(), errorHandle(shareProfile));
router.patch(
  "/soft-delete/:id",
  auth(),
  allowTo(Roles.admin),
  errorHandle(softDelete)
);
router.patch(
  "/restore-account/:id",
  auth(),
  allowTo(Roles.admin),
  errorHandle(restoreAccount)
);
router.delete("/hard-delete", auth(), errorHandle(deleteUser));
router.get("/:id", validation(getUserByIdSchema), errorHandle(getProfile));
router.patch(
  "/update-basic-info",
  validation(updateBasicInfoSchema),
  auth(),
  errorHandle(updateBasicInfo)
);
router.patch(
  "/profile-image",
  auth(),
  uploadToCloud().single("profileImage"),
  validation(profileImageSchema),
  errorHandle(profileImage)
);
router.patch(
  "/cover-images",
  auth(),
  uploadToCloud().array("coverImages", 5),
  errorHandle(covarImages)
);
router.get("/get-user/:id", errorHandle(getUserById));

export default router;
