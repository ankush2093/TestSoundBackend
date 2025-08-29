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
    const { fcmtokennumber } = req.body;

    if (!fcmtokennumber) {
      throw new Error("fcmtokennumber is required");
    }

    // Check if token already exists
    let existingToken = await FCM.findOne({ fcmtokennumber });

    if (existingToken) {
      return res.status(200).json({ 
        message: "Token already exists", 
        _id: existingToken._id, 
        fcmtokennumber: existingToken.fcmtokennumber 
      });
    }

    // Otherwise, create new
    const newFCM = await FCM.create({ fcmtokennumber });
    res.status(201).json({ _id: newFCM._id, fcmtokennumber: newFCM.fcmtokennumber });

  } catch (err) {
    console.error("Error saving token:", err.message);
    res.status(400).json({ error: err.message });
  }
});