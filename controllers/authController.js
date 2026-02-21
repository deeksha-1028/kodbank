const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = (req, res) => {
  const { username, email, password, phone } = req.body;

  if (!username || !email || !password || !phone) {
    return res.status(400).json({ message: "All fields required" });
  }

  const hashedPassword = bcrypt.hashSync(password, 8);

  const sql =
    "INSERT INTO KodUser (username, email, password, phone, role) VALUES (?, ?, ?, ?, ?)";

  db.query(
    sql,
    [username, email, hashedPassword, phone, "customer"],
    (err) => {
      if (err) {
        return res.status(500).json(err);
      }
      res.json({ message: "User registered successfully" });
    }
  );
};

exports.login = (req, res) => {
  const { username, password } = req.body;

  const sql = "SELECT * FROM KodUser WHERE username = ?";

  db.query(sql, [username], (err, result) => {
    if (result.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = result[0];
    const valid = bcrypt.compareSync(password, user.password);

    if (!valid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { uid: user.uid, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token });
  });
};