import mongoose from "mongoose";

const fcmSchema = new mongoose.Schema(
  {
    fcmtokennumber: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

const FCM = mongoose.model("FCM", fcmSchema);
export default FCM;
