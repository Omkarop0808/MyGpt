// Import dependencies
import express from "express";
import 'dotenv/config';
import cors from "cors";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";
import interviewRoutes from "./routes/interview.js";
import authRoutes from "./routes/auth.js";
import paymentRoutes from "./routes/payment.js";

// Initialize Express app
const app = express();

// Middleware setup
const allowedOrigins = (process.env.CLIENT_ORIGIN || "*").split(",").map(origin => origin.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is allowed, or if explicit "*" is set
    if (allowedOrigins.includes("*") || allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));



// API Routes
app.use("/api/auth", authRoutes);
app.use("/api", chatRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/payment", paymentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(500).json({ 
    error: "Internal server error",
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Server port
const PORT = process.env.PORT || 3000;
const uri = process.env.MONGO_URL;

const connectDb = async() => {
  try {
    await mongoose.connect(uri);
    console.log(`MongoDB connected successfully`);
  } catch(err) {
    console.error(`MongoDB connection error: ${err}`);
    process.exit(1);
  }
};

// Start server
connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
