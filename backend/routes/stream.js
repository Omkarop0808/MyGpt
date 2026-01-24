import express from 'express';
import { StreamClient } from '@stream-io/node-sdk';
import authenticate from '../middleware/auth.js';

const router = express.Router();

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_SECRET_KEY;

if (!apiKey || !apiSecret) {
  console.error("Missing Stream API Keys in environment variables");
}

const client = new StreamClient(apiKey, apiSecret);

router.get('/token', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    // Stream requires user IDs to be strings and alphanumeric/underscore/dash/at allowed
    // User._id is fine if converted to string
    const token = client.generateUserToken({ user_id: userId });
    
    res.json({ token, apiKey });
  } catch (error) {
    console.error("Error generating Stream token:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

export default router;
