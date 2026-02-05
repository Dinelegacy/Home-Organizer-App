const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

const router = express.Router();

const usersCollection = (req) => req.db.collection("users");

router.post("/register", async (req, res) => {
  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const existingEmail = await usersCollection(req).findOne({ email });

    if (existingEmail) {
      return res.status(409).json({ message: "This email already exists" });
    };

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = { email, password: hashedPassword };
    const result = await usersCollection(req).insertOne(newUser);

    res.status(201).json({
      message: "User registered successfully",
      _id: result.insertedId, email
    });

  } catch (error) {
    console.error("DB ERROR (POST REGISTER):", error);
    res.status(500).json({ message: "Database error" });
  }
});

router.post("/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await usersCollection(req).findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    const ok = await bcrypt.compare(password, user.password);

    if (!ok) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    const token = jwt.sign({ userId: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: "Login successful", token });
  }

  catch (error) {
    console.error("DB ERROR (POST LOGIN):", error)
    res.status(500).json({ message: "Database error" });
  }
});
module.exports = router;