import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import authenticate from "../middleware/auth.js";

const router = express.Router();

// Password strength validation
const validatePassword = (password) => {
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }
  return null;
};

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ 
        error: "Name, email, and password are required" 
      });
    }

    // Validate name length
    if (name.trim().length < 2 || name.trim().length > 60) {
      return res.status(400).json({ 
        error: "Name must be between 2 and 60 characters" 
      });
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ 
        error: "Please provide a valid email address" 
      });
    }

    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    // Check if email already exists
    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(409).json({ 
        error: "Email is already registered. Please log in instead." 
      });
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
    });

    const token = signToken(user._id);
    
    // Return user without password
    const userResponse = user.toJSON();
    return res.status(201).json({ user: userResponse, token });
  } catch (error) {
    console.error("Signup error:", error);
    
    // Handle specific database errors
    if (error.code === 11000) {
      return res.status(409).json({ 
        error: "Email is already registered" 
      });
    }
    
    return res.status(500).json({ 
      error: "Unable to create account. Please try again later." 
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email?.trim() || !password) {
      return res.status(400).json({ 
        error: "Email and password are required" 
      });
    }

    // Find user by email - include password for comparison
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ 
        error: "Invalid email or password" 
      });
    }

    // Compare passwords
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ 
        error: "Invalid email or password" 
      });
    }

    const token = signToken(user._id);
    
    // Return user without password
    const userResponse = user.toJSON();
    return res.json({ user: userResponse, token });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ 
      error: "Unable to log in. Please try again later." 
    });
  }
});

router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        error: "User not found" 
      });
    }
    
    const userResponse = user.toJSON();
    return res.json({ user: userResponse });
  } catch (error) {
    console.error("Fetch profile error:", error);
    return res.status(500).json({ 
      error: "Unable to fetch profile. Please try again later." 
    });
  }
});

export default router;

