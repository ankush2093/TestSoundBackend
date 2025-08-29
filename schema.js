import mongoose from "mongoose";

const fcmSchema = new mongoose.Schema(
  {
    fcmtokennumber: { type: String, required: true, unique: true },
    devicename: { type: String },

    title: { type: String },
    body: { type: String },

    deviceInfo: {
      platform: { type: String },
      deviceId: { type: String },
      timestamp: { type: String },  // Alternatively, you could use `Date` if you prefer
      version: { type: String },
    },
  },
  { timestamps: true }
);

const FCM = mongoose.model("FCM", fcmSchema);
export default FCM;
