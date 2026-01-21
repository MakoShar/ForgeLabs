import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// ES module fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from this folder's .env (not process.cwd())
dotenv.config({ path: path.join(__dirname, ".env") });

// Middleware
app.use(cors());
app.use(express.json());

// 🔹 Serve index.html from parent directory
const frontendPath = path.join(__dirname, "..");

app.use(express.static(frontendPath));

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Gemini setup
const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  console.warn("GEMINI_API_KEY is missing. Check ForgeLabs/gemini-chatbot/.env");
}

const genAI = new GoogleGenerativeAI(geminiApiKey || "");

// Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    if (!geminiApiKey) {
      return res.status(500).json({ error: "Server is missing GEMINI_API_KEY" });
    }

    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ error: "Message is required" });
    }

    const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
    const model = genAI.getGenerativeModel({ model: modelName });

    const result = await model.generateContent(userMessage);
    const reply = result.response.text();

    res.json({ reply });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Gemini error:", message);

    const isProd = String(process.env.NODE_ENV || "").toLowerCase() === "production";

    // Best-effort mapping for common Gemini API failures.
    const isQuota = /\b429\b/.test(message) || /quota exceeded/i.test(message) || /rate limit/i.test(message);
    let retryAfterSeconds;
    const retryMatch = message.match(/retry in\s+([0-9]+(?:\.[0-9]+)?)s/i) || message.match(/"retryDelay"\s*:\s*"([0-9]+)s"/i);
    if (retryMatch) retryAfterSeconds = Math.max(0, Math.ceil(Number(retryMatch[1])));

    const status = isQuota ? 429 : 500;
    res.status(status).json({
      error: isQuota ? "Gemini quota exceeded" : "Gemini failed to respond",
      ...(typeof retryAfterSeconds === "number" ? { retryAfterSeconds } : null),
      ...(isProd ? null : { details: message }),
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
