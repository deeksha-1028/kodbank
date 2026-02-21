const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const router = express.Router();

/* ================= AUTH MIDDLEWARE ================= */
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

/* ================= REGISTER ================= */
router.post("/register", async (req, res) => {
  const { uid, username, password, email, phone } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO KodUser 
      (uid, username, password, email, phone, role, balance)
      VALUES (?, ?, ?, ?, ?, 'customer', 100000)
    `;

    db.query(sql, [uid, username, hashedPassword, email, phone], (err) => {
      if (err) return res.status(500).json({ error: err.message });

      res.status(201).json({
        message: "User registered successfully"
      });
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= LOGIN ================= */
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const sql = "SELECT * FROM KodUser WHERE username = ?";

  db.query(sql, [username], async (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { uid: user.uid, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Save token in UserToken table
    const expiry = new Date(Date.now() + 60 * 60 * 1000);

    db.query(
      "INSERT INTO UserToken (token, uid, expiry) VALUES (?, ?, ?)",
      [token, user.uid, expiry]
    );

    // Send token as cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 60 * 60 * 1000
    });

    res.json({
      message: "Login successful"
    });
  });
});

/* ================= DASHBOARD BALANCE ================= */
router.get("/balance", authMiddleware, (req, res) => {
  const sql = "SELECT balance FROM KodUser WHERE uid = ?";

  db.query(sql, [req.user.uid], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({
      message: "Balance fetched",
      balance: rows[0].balance
    });
  });
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});
module.exports = router;