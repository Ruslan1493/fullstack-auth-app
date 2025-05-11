const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per window
  message: "Too many login attempts, please try again later.",
});

const roleMiddleware = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: "Access denied." });
  }
  next();
};

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Extract the token
  if (!token) {
    return res.status(401).json({ error: "No token, authorization denied" });
  }

  // console.log();

  console.log("Received Token:", token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Validate token
    req.user = decoded; // Attach user info to the request
    next();
  } catch (err) {
    console.error("Token Verification Error:", err.message);
    res.status(401).json({ error: "Token is not valid" });
  }
};

// @route   POST /auth/validate-token
// @desc    Validate token and return user info if valid
router.post("/validate-token", async (req, res) => {
  const { token } = req.body;
  console.log("🔐 Token received for validation:", token);

  if (!token) {
    return res.status(400).json({ valid: false, error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password"); // Don't return password

    if (!user) {
      return res.status(404).json({ valid: false, error: "User not found" });
    }
    console.log("HIT validate-token path: user found");

    res.status(200).json({ valid: true, user });
  } catch (err) {
    console.error("❌ Token validation error:", err.message);
    res.status(401).json({ valid: false, error: "Invalid or expired token" });
  }
});

router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    const payload = { id: decoded.id, name: decoded.name };
    const newToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ token: newToken });
  } catch (err) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }
});

router.get("/admin", authMiddleware, roleMiddleware(["admin"]), (req, res) => {
  res.status(200).json({ message: "Welcome, Admin" });
});

// @route   GET /auth/protected
// @desc    Example protected route
router.get("/protected", authMiddleware, (req, res) => {
  res.status(200).json({ message: `Welcome, ${req.user.name}` });
});

// @route   POST /auth/register
// @desc    Register user
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User already exists. Please log in instead." });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save the new user 
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    // Generate token
    const payload = { id: newUser.id, name: newUser.name };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Send the token along with a success message
    res.status(201).json({ message: "User registered successfully", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// @route   POST /auth/login
// @desc    Authenticate user and get token
router.post("/login", loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const payload = { id: user.id, name: user.name };

    // Access Token (short-lived)
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    // Refresh Token (long-lived, only stored in HTTP-only cookie)
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // Send refresh token in HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send access token in body
    res.status(200).json({ accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post('/refresh-token', (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ error: 'No refresh token' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const accessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        res.status(200).json({ accessToken });
    } catch (err) {
        return res.status(403).json({ error: 'Invalid refresh token' });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;
