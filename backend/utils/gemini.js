import 'dotenv/config';

const getGeminiApiResponse = async(message) =>{

  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [{ text: message }]
      }
    ]
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      }
    );

    const data = await response.json();
    console.log("Gemini  response:", data);

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
    return ({response : text});
  } catch (e) {
    console.error("Error from Gemini API:", e);
    res.status(500).send({ error: "Something went wrong with Gemini API" });
  }
}

export default getGeminiApiResponse;