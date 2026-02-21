require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// ✅ Proper static serving
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", authRoutes);

app.get("/", (req, res) => {
  res.send("Kodbank API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});