import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import { GoogleAuth } from "google-auth-library";
import bodyParser from "body-parser";
import connectDB from "./config.js";
import FCM from "./schema.js";
import cors from "cors";

dotenv.config();

const app = express();


app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  })
);

app.use(bodyParser.json());

connectDB();

const getAccessToken = async () => {
  const auth = new GoogleAuth({
    credentials: {
      client_email: process.env.CLIENT_EMAIL,
      private_key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
  });

  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  return accessToken.token;
};

app.get("/", (req, res) => {
  res.send("Server is working");
});

// app.post("/save-fcm-token", async (req, res) => {
//   try {
//     const { fcmtokennumber } = req.body;

//     if (!fcmtokennumber) {
//       throw new Error("fcmtokennumber is required");
//     }

//     const newFCM = await FCM.create({ fcmtokennumber });
//     res.status(201).json({ _id: newFCM._id, fcmtokennumber: newFCM.fcmtokennumber });
//   } catch (err) {
//     console.error("Error saving token:", err.message);
//     res.status(400).json({ error: err.message });
//   }
// });

app.post("/save-fcm-token", async (req, res) => {
  try {
    const { fcmtokennumber, devicename } = req.body;

    if (!fcmtokennumber) {
      throw new Error("fcmtokennumber is required");
    }

    // Check if token already exists
    let existingToken = await FCM.findOne({ fcmtokennumber });

    if (existingToken) {
      return res.status(200).json({ 
        message: "Token already exists", 
        _id: existingToken._id, 
        fcmtokennumber: existingToken.fcmtokennumber,
        devicename: existingToken.devicename // include devicename in response
      });
    }

    // Create new token with devicename
    const newFCM = await FCM.create({ fcmtokennumber, devicename });
    res.status(201).json({ 
      _id: newFCM._id, 
      fcmtokennumber: newFCM.fcmtokennumber, 
      devicename: newFCM.devicename 
    });

  } catch (err) {
    console.error("Error saving token:", err.message);
    res.status(400).json({ error: err.message });
  }
});


app.post("/send-notification", async (req, res) => {
  const { fcmToken, title, body } = req.body;

  try {
    const accessToken = await getAccessToken();

    const response = await axios.post(
      "https://fcm.googleapis.com/v1/projects/virtual-sound-box/messages:send",
      {
        message: {
          token: fcmToken,
          notification: {
            title: title || "Test Notification",
            body: body || "This is a test from server",
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    console.error("Error sending FCM:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/get-all-facm", async (req, res) => {
  try {
    const getAllFCMtoken = await FCM.find();
    const istFormattedData = getAllFCMtoken.map((token) => ({
      _id: token._id,
      fcmtokennumber: token.fcmtokennumber,
      createdAt: new Date(token.createdAt).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      }),
      updatedAt: new Date(token.updatedAt).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      }),
      __v: token.__v,
    }));

    res.json(istFormattedData);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(4000, () => {
  console.log("Server running at http://localhost:4000");
});
