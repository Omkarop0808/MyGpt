import express from "express";
import Thread from "../models/Thread.js";
import getGeminiApiResponse from "../utils/gemini.js";
import authenticate from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);

// to get all threads

router.get("/thread", async (req, res) => {
  try {
    const threads = await Thread.find({ owner: req.user.id })
      .sort({ updated_At: -1 })
      .select("threadId title updated_At");
    res.json({ threads });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch the threads" });
  }
});

// to get the particular thread 

router.get("/thread/:threadId", async (req, res) => {
  try {
    const { threadId } = req.params;
    const thread = await Thread.findOne({
      threadId,
      owner: req.user.id,
    }).select("threadId title message updated_At");

    if (!thread) {
      return res.status(404).json({ error: "Thread not found" });
    }

    res.json({
      threadId: thread.threadId,
      title: thread.title,
      messages: thread.message,
      updated_At: thread.updated_At,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Failed to fetch the chat" });
  }
});


// delete the existing thread
router.delete("/thread/:threadId", async (req, res) => {
  try {
    const { threadId } = req.params;
    const thread = await Thread.findOneAndDelete({
      threadId,
      owner: req.user.id,
    });

    if (!thread) {
      return res.status(404).json({ error: "Thread not found" });
    }

    res.json({ success: "thread is deleted successfully", deletedThread: thread });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Failed to delete the chat" });
  }
});


// new chat message and reply  for existing chat and new chat

router.post("/chat", async (req, res) => {
  const { threadId, message } = req.body;
  console.log("📨 Chat endpoint called with:", { threadId, message });
  
  if (!threadId || !message) {
    return res.status(400).json({ error: "missing required fields" });
  }

  try {
    let thread = await Thread.findOne({
      threadId,
      owner: req.user.id,
    });

    if (!thread) {
      thread = new Thread({
        threadId: threadId,
        owner: req.user.id,
        title: message.slice(0, 60),
        message: [{ role: "user", content: message }],
      });
      console.log("✅ Created new thread");
    } else {
      if (!thread.message) {
        thread.message = [];
      }
      thread.message.push({ role: "user", content: message });
      console.log("✅ Added to existing thread");
    }

    console.log("🔵 Calling Gemini API with retry logic...");
    const assistantReply = await getGeminiApiResponse(message);
    console.log("🟢 Got Gemini reply:", assistantReply);

    thread.message.push({
      role: "assistant",
      content: assistantReply.response,
    });

    await thread.save();
    console.log("✅ Thread saved to database");

    res.json({
      reply: assistantReply.response,
      thread: {
        threadId: thread.threadId,
        title: thread.title,
        messages: thread.message,
        updated_At: thread.updated_At,
      },
    });
  } catch (err) {
    console.error("❌ Chat error:", err);
    
    // Return a user-friendly error message
    const errorMessage = err.message || "Unable to process request. Please try again.";
    res.status(200).json({
      reply: "⚠️ **System Message**: " + errorMessage + "\n\nThe system is working to recover. Please try again shortly!",
      thread: {
        threadId: null,
        title: null,
        messages: [],
        updated_At: new Date().toISOString(),
      },
    });
  }
});



export default router;