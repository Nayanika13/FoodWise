const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
const foodListingsRouter = require("./routes/foodListings");
app.use("/api/listings", foodListingsRouter);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database: mongoose.connection.readyState === 1
      ? "connected"
      : "disconnected"
  });
});


app.get("/api/ai/health", async (req, res) => {
  try {
    const response = await fetch("http://127.0.0.1:8000/health");

    if (!response.ok) {
      return res.status(502).json({
        status: "error",
        aiService: "unavailable"
      });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    return res.status(503).json({
      status: "error",
      aiService: "unavailable"
    });
  }
});
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`FoodWise backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Backend startup failed:", error.message);
    process.exit(1);
  }
}

startServer();