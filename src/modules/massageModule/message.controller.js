import { Router } from "express";
import * as messageServices from "./message.services.js";
import { auth } from "../../middleware/auth.middleware.js";
import { errorHandle } from "../../utils/errorHandling.js";

export const messageRoutes = Router({
  mergeParams: true,
});

messageRoutes.post(
  "/send-message/:from",
  errorHandle(messageServices.sendMessage)
);
messageRoutes.get(
  "/get-all-messages",
  auth(),
  errorHandle(messageServices.getAllMessages)
);
messageRoutes.get(
  "/get-message/:id",
  auth(),
  errorHandle(messageServices.getSingleMessage)
);
messageRoutes.delete(
  "/delete-message/:id",
  auth(),
  errorHandle(messageServices.deleteMessage)
);
messageRoutes.get("/", errorHandle(messageServices.getUserMessages));
