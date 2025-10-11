import { messageModel } from "../../DB/models/massege.model.js";
import { userModule } from "../../DB/models/user.models.js";

import { NotFoundException } from "../../utils/exceptions.js";
import { successHandler } from "../../utils/successHandler.js";

export const sendMessage = async (req, res) => {
  const { to, content } = req.body;
  const reciever = await userModule.findById(to);

  if (!reciever) {
    throw new NotFoundException("receiver id");
  }

  const from = req.params.from;
  const data = {
    to,
    content,
  };

  if (from) {
    const sender = await userModule.findById(from);
    if (!sender) {
      throw new NotFoundException("sender id");
    }
    data.from = sender._id;
  }

  const message = await messageModel.create(data);
  return successHandler({ res, data: message });
};

export const getAllMessages = async (req, res) => {
  const user = req.user;
  const messages = await messageModel
    .find({ to: user._id })
    .select("-to")
    .populate([
      {
        path: "from",
        select: "firstName lastName email gendar profileImage.secure_url",
      },
    ]);

  return successHandler({ res, data: messages });
};

export const getSingleMessage = async (req, res) => {
  const messageId = req.params.id;
  const message = await messageModel
    .findOne({ _id: messageId, to: req.user._id })
    .select("-to")
    .populate([
      {
        path: "from",
        select: "firstName lastName email gendar profileImage.secure_url",
      },
    ]);

  if (!message) {
    throw new NotFoundException("message");
  }

  return successHandler({ res, data: message });
};

export const deleteMessage = async (req, res) => {
  const { id } = req.params;
  const message = await messageModel.findOne({ _id: id, to: req.user._id });

  if (!message) {
    throw new NotFoundException("message");
  }

  await message.deleteOne();
  return successHandler({ res });
};

export const getUserMessages = async (req, res) => {
  const messages = await messageModel.find({ to: req.params.id });
  return successHandler({ res, data: messages });
};
