// Import dependencies
import express from "express";
import 'dotenv/config';
import cors from "cors";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";
import interviewRoutes from "./routes/interview.js";



// Initialize Express app
const app = express();

// Middleware setup
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON request bodies


app.use("/api",chatRoutes);
// app.use("/api/interview", interviewRoutes);

// Server port
const PORT = process.env.PORT || 3000;

const uri = process.env.MONGO_URL;


const connectDb = async() => {
  try{
    await mongoose.connect(uri);
    console.log(`mongodb is connected successfully`);
  
  }catch(err){
    console.log(`some error ${err}`);
  }

}

// Start server
connectDb().then(() => {
 
  app.listen(PORT, () => {
    console.log(`🚀 Server running at${PORT}`);
    
  });
});

// app.post("/test", async (req, res) => {

//   const message = req.body.message || "Hello";
//   console.log("User Message:", message);

//   const requestBody = {
//     contents: [
//       {
//         role: "user",
//         parts: [{ text: message }]
//       }
//     ]
//   };

//   try {
//     const response = await fetch(
//       `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(requestBody)
//       }
//     );

//     const data = await response.json();
//     console.log("Gemini  response:", data);

//     const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
//     res.send(text);
//   } catch (e) {
//     console.error("Error from Gemini API:", e);
//     res.status(500).send({ error: "Something went wrong with Gemini API" });
//   }
// });
