// proxy-server.js
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/avatar/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const apiKey = "fU6kfn"; // Replace with your real key
    const avatarRes = await axios.get(`https://api.multiavatar.com/${id}?apikey=${apiKey}`, {
      headers: { Accept: "image/svg+xml" },
      responseType: "text",
    });

    res.setHeader("Content-Type", "image/svg+xml");
    res.send(avatarRes.data);
  } catch (err) {
    console.error("❌ Avatar fetch failed:");
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Data:", err.response.data);
    } else {
      console.error("Message:", err.message);
    }

    res.status(500).send("Error fetching avatar");
  }
});

app.listen(5001, () => console.log("✅ Proxy server running at http://localhost:5001"));
