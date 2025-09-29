import express from "express";
import Thread from "../models/Thread.js";
import getGeminiApiResponse from "../utils/gemini.js";

const router = express.Router(); // ✅ define the router

// Route for interview question/answer evaluation
router.post("/ask", async (req, res) => {
  try {
    const { question, answer } = req.body;

    const prompt = `
You are acting as an interview panel. A candidate was asked:
Q: ${question}
Their answer: "${answer}"

1. Give short, helpful feedback.
2. Rate the answer out of 10.
3. Provide a better sample answer.

Return response in JSON format:
{
  "feedback": "...",
  "score": ...,
  "betterAnswer": "..."
}
`;

    const response = await getGeminiApiResponse(prompt);

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Gemini response not in JSON format");
    const parsed = JSON.parse(jsonMatch[0]);

    res.json(parsed);
  } catch (err) {
    console.error("Error in interview /ask:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Route for text analysis
router.post("/analysis", async (req, res) => {
  try {
    const { text } = req.body;

    const prompt = `
Act as a helpful writing assistant. A user wrote:

"${text}"

Give a clear analysis:
1. Grammar issues
2. Clarity improvements
3. Suggestions to improve impact

Respond in JSON format like this:
{
  "grammar": ["...issue 1...", "...issue 2..."],
  "clarity": ["...improvement 1...", "...improvement 2..."],
  "suggestions": ["...suggestion 1...", "...suggestion 2..."]
}
`;

    const response = await getGeminiApiResponse(prompt);

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Gemini response not in JSON format");
    const parsed = JSON.parse(jsonMatch[0]);

    res.json(parsed);
  } catch (err) {
    console.error("Error in /analysis:", err);
    res.status(500).json({ error: "Something went wrong during analysis." });
  }
});

export default router;
