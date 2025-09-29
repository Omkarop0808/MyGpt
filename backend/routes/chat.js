import express from "express";
import Thread from "../models/Thread.js";
const router = express.Router();

import getGeminiApiResponse from "../utils/gemini.js";

// test 
router.post("/test",async(req,res)=>{
try{
    const newThread = new Thread({
    threadId:"xyz",
    title:"testing new thread id"
    })

    const response = await newThread.save();
    console.log(response);

}catch(err){
  console.log(err);
  res.status(500).json({error:"failed to save DB"});
}
});

// to get all threads

router.get("/thread",async(req,res)=>{
    try{

        const threads = await Thread.find({}).sort({updatedAt:-1});
        // but in descending order since i want (..most recent data on top)
        res.json(threads);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Failed to fetch the threads"});
    }
})

// to get the particular thread 

router.get("/thread/:threadId", async (req, res) => {
  try {
    const { threadId } = req.params;
    const thread = await Thread.findOne({ threadId });

    if (!thread) {
      return res.status(400).json({ error: "thread is not found" });
    }

    res.json(thread.message); // send only once
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Failed to fetch the chat" });
  }
});


// delete the existing thread
router.delete("/thread/:threadId", async (req, res) => {
  try {
    const { threadId } = req.params;
    const thread = await Thread.findOneAndDelete({ threadId });

    if (!thread) {
      return res.status(400).json({ error: "thread is not found" });
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
  if (!threadId || !message) {
    return res.status(400).json({ error: "missing required fields" });
  }

  try {
    let thread = await Thread.findOne({ threadId });

    if (!thread) {
      thread = new Thread({
        threadId: threadId,
        title: message,
        message: [{ role: "user", content: message }],
      });
    } else {
      if (!thread.message) {
        thread.message = [];
      }
      thread.message.push({ role: "user", content: message });
    }

    const assistantReply = await getGeminiApiResponse(message);
    
    // console.log(assistantReply);
    thread.message.push({
      role: "assistant",
      content:   assistantReply.response,
    });

    thread.updated_At = new Date();
    await thread.save();

    res.json({ reply: assistantReply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "something went wrong" });
  }
});



export default router;