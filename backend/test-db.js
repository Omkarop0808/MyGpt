import mongoose from 'mongoose';
import 'dotenv/config';

const uri = process.env.MONGO_URL;

console.log("Testing MongoDB Connection...");
console.log("URI:", uri ? "Found" : "Missing");

mongoose.connect(uri)
  .then(() => {
    console.log("✅ SUCCESS: Connected to MongoDB!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ ERROR: Could not connect to MongoDB.");
    console.error(err);
    process.exit(1);
  });
