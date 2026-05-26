// api/chat.js — Vercel Serverless Function
// Gemini AI chatbot backend for Shresth's portfolio

const { GoogleGenerativeAI } = require("@google/generative-ai");

const SYSTEM_PROMPT = `You are CubeBot, an AI assistant on Shreshth Chaurasiya's developer portfolio website.

ABOUT SHRESHTH:
Shreshth is a full-stack developer who builds modern websites, AI tools, automation systems, and business applications.

SERVICES & PRICING:
- Landing Page / Portfolio website: ₹5,000 – ₹10,000
- Business website (with contact form, SEO): ₹10,000 – ₹25,000
- E-commerce website (cart, payments, admin): ₹20,000 – ₹60,000
- Admin Dashboard / CRM / ERP system: ₹30,000 – ₹1,50,000+
- AI Chatbot & Agents (like this one): depends on features, starting ₹15,000
- Automation (n8n, Google Sheets, WhatsApp alerts): ₹5,000 – ₹30,000
- SaaS web application: ₹50,000 – ₹2,00,000+
- Payment gateway integration: Usually included in project scope
- Responsive UI/UX design: Included with all projects

TECH STACK:
HTML, CSS, JavaScript, React, Next.js, Node.js, Express, Python, FastAPI, MongoDB, PostgreSQL, Supabase, Firebase, n8n, Google Apps Script, Gemini AI, OpenAI, Vercel, Railway, GitHub.

TIMELINE (approx):
- Small landing page: 3–5 days
- Business website: 7–14 days
- E-commerce: 3–6 weeks
- CRM/Dashboard: 4–8 weeks
- AI Chatbot: 1–3 weeks depending on complexity

YOUR GOAL:
Understand the visitor's project needs and collect lead details to send to Shreshth.

REQUIRED LEAD DATA (collect naturally in conversation):
1. name — full name
2. phone — WhatsApp/phone number (must be 10+ digits)
3. email — valid email address
4. service — type of project/service needed
5. budget — their budget range
6. message — brief project description

BEHAVIOR RULES:
- Match user's language: Hinglish if user speaks Hindi/Hinglish, English if user speaks English
- Ask only ONE question at a time — never ask multiple things at once
- Be friendly, direct, helpful, and professional
- Never lie about pricing — give ranges honestly
- Never overpromise timelines
- Answer FAQs about services, pricing, tech stack naturally
- Guide user toward describing their project
- Once you have all 6 data points, set readyToSubmit to true
- For phone: only accept if it has 10+ digits (validate before setting)
- For email: only accept if it has @ and a valid domain format
- Keep replies SHORT (2-4 sentences max)

VALIDATION RULES:
- phone field: only mark as collected if it contains at least 10 digits
- email field: only mark as collected if it matches basic email format (contains @ and .)
- Do NOT set readyToSubmit: true unless ALL 6 fields are filled AND phone/email are valid

OUTPUT FORMAT (ALWAYS return valid JSON, nothing else):
{
  "reply": "your response message here (can include HTML like <b>bold</b>, emojis)",
  "leadData": {
    "name": "",
    "phone": "",
    "email": "",
    "service": "",
    "budget": "",
    "message": ""
  },
  "readyToSubmit": false
}

IMPORTANT: Your entire response must be ONLY valid JSON. No markdown, no code blocks, no extra text. Just the JSON object.`;

module.exports = async function handler(req, res) {
  // CORS headers — needed since portfolio may be on different domain
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages = [], leadData = {} } = req.body;

    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: "messages array is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY environment variable not set");
      return res.status(500).json({ error: "AI service not configured" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Build conversation history for Gemini
    // Gemini expects alternating user/model roles
    const historyForGemini = [];

    // Add current lead data context to first system message
    const currentDataContext = `\nCURRENT COLLECTED DATA (do not re-ask for fields already filled):
name: "${leadData.name || ""}"
phone: "${leadData.phone || ""}"
email: "${leadData.email || ""}"
service: "${leadData.service || ""}"
budget: "${leadData.budget || ""}"
message: "${leadData.message || ""}"

Always include ALL 6 fields in your leadData output — copy the existing values and only update the ones extracted from this conversation turn.`;

    const fullSystemPrompt = SYSTEM_PROMPT + currentDataContext;

    // Build history (exclude the last message — that goes as current input)
    const conversationHistory = messages.slice(0, -1);
    const currentUserMessage = messages[messages.length - 1];

    // Map history to Gemini format
    for (let i = 0; i < conversationHistory.length; i++) {
      const msg = conversationHistory[i];
      historyForGemini.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      });
    }

    // Start chat with history
    const chat = model.startChat({
      history: historyForGemini,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 512,
      },
      systemInstruction: fullSystemPrompt,
    });

    // Send current message
    const result = await chat.sendMessage(currentUserMessage.content);
    const rawText = result.response.text().trim();

    // Parse JSON response from Gemini
    let parsed;
    try {
      // Clean up potential markdown code fences if Gemini adds them
      const cleanText = rawText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
      parsed = JSON.parse(cleanText);
    } catch (parseErr) {
      console.error("Failed to parse Gemini JSON:", rawText);
      // Fallback: return the raw text as a reply without structured data
      parsed = {
        reply: rawText || "Kuch problem aayi, please dobara try karein.",
        leadData: leadData,
        readyToSubmit: false,
      };
    }

    // Safety: merge existing leadData with new (never lose collected data)
    const mergedLeadData = {
      name: parsed.leadData?.name || leadData.name || "",
      phone: parsed.leadData?.phone || leadData.phone || "",
      email: parsed.leadData?.email || leadData.email || "",
      service: parsed.leadData?.service || leadData.service || "",
      budget: parsed.leadData?.budget || leadData.budget || "",
      message: parsed.leadData?.message || leadData.message || "",
    };

    // Server-side validation before allowing readyToSubmit
    const phoneDigits = mergedLeadData.phone.replace(/\D/g, "");
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mergedLeadData.email);
    const allFilled = Object.values(mergedLeadData).every((v) => v.trim() !== "");
    const safeReadyToSubmit = parsed.readyToSubmit && allFilled && phoneDigits.length >= 10 && emailValid;

    return res.status(200).json({
      reply: parsed.reply || "Main samajh nahi paya, please dobara batayein.",
      leadData: mergedLeadData,
      readyToSubmit: safeReadyToSubmit,
    });
  } catch (err) {
    console.error("API handler error:", err);
    return res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
};
