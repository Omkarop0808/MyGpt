import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';

// Retry configuration
const MAX_RETRIES = 5;
const INITIAL_DELAY = 2000; // 2 seconds
const MAX_DELAY = 30000; // 30 seconds

// Circuit breaker state
let apiFailureCount = 0;
let lastFailureTime = 0;
const FAILURE_THRESHOLD = 3;
const CIRCUIT_BREAK_DURATION = 60000; // 1 minute

// Fallback responses for when API is down
const FALLBACK_RESPONSES = [
  "I'm currently experiencing high traffic. The Gemini API is overloaded. Please try again in a few moments - the system will automatically recover!",
  "The AI service is temporarily overloaded. I'm retrying automatically. Please bear with me for a moment...",
  "Due to high demand, the AI service is busy. I'll keep retrying. Thank you for your patience!",
];

// Get fallback response
const getFallbackResponse = () => {
  return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
};

// Calculate delay with exponential backoff
const getDelay = (attempt) => {
  const delay = INITIAL_DELAY * Math.pow(2, attempt);
  return Math.min(delay, MAX_DELAY);
};

// Check if circuit breaker is open
const isCircuitBreakerOpen = () => {
  if (apiFailureCount >= FAILURE_THRESHOLD) {
    const timeSinceLastFailure = Date.now() - lastFailureTime;
    if (timeSinceLastFailure < CIRCUIT_BREAK_DURATION) {
      console.warn("⚠️ Circuit breaker OPEN - Using fallback response");
      return true;
    } else {
      // Reset after duration
      console.log("🔄 Circuit breaker RESETTING");
      apiFailureCount = 0;
      return false;
    }
  }
  return false;
};

// Retry with exponential backoff
const retryWithBackoff = async (fn, maxRetries = MAX_RETRIES) => {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`🔵 Attempt ${attempt + 1}/${maxRetries}`);
      const result = await fn();
      
      // Success - reset failure count
      apiFailureCount = 0;
      console.log("🟢 Success! Failure count reset");
      return result;
    } catch (error) {
      lastError = error;
      const errorMessage = error.message || String(error);
      
      // Check for retryable errors
      const isRetryable = errorMessage.includes("503") || 
                         errorMessage.includes("overloaded") ||
                         errorMessage.includes("429") ||
                         errorMessage.includes("UNAVAILABLE");
      
      if (!isRetryable) {
        console.error("❌ Non-retryable error:", errorMessage);
        throw error;
      }
      
      if (attempt < maxRetries - 1) {
        const delay = getDelay(attempt);
        console.log(`⏳ Retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // All retries exhausted
  apiFailureCount++;
  lastFailureTime = Date.now();
  console.error("❌ All retries exhausted after", maxRetries, "attempts");
  throw lastError;
};

const getGeminiApiResponse = async(message) => {
  console.log("🔵 Gemini function called with message:", message);
  
  // Check circuit breaker
  if (isCircuitBreakerOpen()) {
    console.log("🔴 Using fallback response (circuit breaker open)");
    return { response: getFallbackResponse() };
  }
  
  try {
    // Attempt with retries
    const result = await retryWithBackoff(async () => {
      console.log("🔵 Initializing Google Generative AI...");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      
      console.log("🔵 Getting model: gemini-2.5-flash");
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      console.log("🔵 Sending message to Gemini...");
      const result = await model.generateContent(message);
      
      console.log("🔵 Gemini response received");
      const response = await result.response;
      const text = response.text();
      
      if (!text) {
        console.error("❌ No text in Gemini response");
        throw new Error("Gemini returned empty response");
      }
      
      console.log("🟢 Successfully extracted response from Gemini");
      return text;
    });
    
    return { response: result };
  } catch (e) {
    console.error("❌ Error from Gemini API after all retries:", e.message);
    
    // Increment failure count
    apiFailureCount++;
    lastFailureTime = Date.now();
    
    // Use fallback response
    const fallback = getFallbackResponse();
    console.log("📍 Using fallback response due to API failure");
    return { response: fallback };
  }
};

export default getGeminiApiResponse;