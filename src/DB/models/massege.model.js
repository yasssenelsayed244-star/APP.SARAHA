import { model, Schema, Types } from "mongoose";

const messageSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    from: {
      type: Types.ObjectId,
      ref: "user",
    },
    to: {
      type: Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const messageModel = model("message", messageSchema);
