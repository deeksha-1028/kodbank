require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const { Client } = require("@gradio/client");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Middlewares
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// ✅ Correct static path for Render
app.use(express.static(path.join(__dirname, "public")));

// API routes
app.use("/api", authRoutes);
app.post("/ask-ai", async (req, res) => {
  const { message } = req.body;

  try {
    const client = await Client.connect("nsdeekshitha/kodbank-ai");

    const result = await client.predict("/generate_response", [
      message
    ]);

    res.json({
      success: true,
      reply: result.data[0]
    });

  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({
      success: false,
      error: "AI request failed"
    });
  }
});

// Default route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});