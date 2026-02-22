import express from "express";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const aiInvoiceRouter = express.Router();

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.warn("Missing GEMINI_API_KEY in .env");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const MODEL_CANDIDATES = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0"];

function buildInvoicePrompt(promptText) {
  const invoiceTemplate = {
    invoiceNumber: `INV-${Math.floor(Math.random() * 9000) + 1000}`,
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: "",
    fromBusinessName: "",
    fromEmail: "",
    fromAddress: "",
    fromPhone: "",
    client: { name: "", email: "", address: "", phone: "" },
    items: [{ id: "1", description: "", qty: 1, unitPrice: 0 }],
    taxPercent: 18,
    notes: "",
  };

  return `
You are an invoice generation assistant.

Task:
  - Analyze the user's input text and produce a valid JSON object only (no explanatory text).
  - The JSON MUST match the schema below (include all fields even if empty).
  - Ensure all dates are ISO 'YYYY-MM-DD' strings and numeric fields are numbers.

Schema:
${JSON.stringify(invoiceTemplate, null, 2)}

User input:
${promptText}

Output: valid JSON only (no surrounding code fences, no commentary).
`;
}

async function tryGenerateWithModel(modelName, prompt) {
  if (!ai) throw new Error("Missing GEMINI_API_KEY");

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
  });

  let text =
    (response && typeof response.text === "string" && response.text) ||
    (response &&
      response.output &&
      Array.isArray(response.output) &&
      response.output[0] &&
      response.output[0].content &&
      Array.isArray(response.output[0].content) &&
      response.output[0].content[0] &&
      response.output[0].content[0].text) ||
    (response &&
      response.outputs &&
      Array.isArray(response.outputs) &&
      response.outputs[0] &&
      (response.outputs[0].text || response.outputs[0].content)) ||
    null;

  if (!text && response && Array.isArray(response.outputs)) {
    const joined = response.outputs
      .map((o) => {
        if (!o) return "";
        if (typeof o === "string") return o;
        if (typeof o.text === "string") return o.text;
        if (Array.isArray(o.content)) {
          return o.content.map((c) => (c && c.text) || "").join("\n");
        }
        return JSON.stringify(o);
      })
      .filter(Boolean)
      .join("\n\n");
    if (joined) text = joined;
  }

  if (!text && response) {
    try {
      text = JSON.stringify(response);
    } catch {
      text = String(response);
    }
  }

  if (!text || !String(text).trim()) {
    throw new Error("Empty text returned from model");
  }
  return { text: String(text).trim(), modelName };
}

function extractJsonObject(text) {
  const trimmed = String(text || "").trim();
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }
  return trimmed.slice(firstBrace, lastBrace + 1);
}

aiInvoiceRouter.post("/generate", async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Server configuration failed: GEMINI_API_KEY not set",
      });
    }

    const prompt = req?.body?.prompt;
    if (typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: "Prompt text is required",
      });
    }

    const fullPrompt = buildInvoicePrompt(prompt.trim());
    let lastErr = null;
    let lastText = null;
    let usedModel = null;

    for (const m of MODEL_CANDIDATES) {
      try {
        const { text, modelName } = await tryGenerateWithModel(m, fullPrompt);
        lastText = text;
        usedModel = modelName;
        if (text && text.trim()) break;
      } catch (err) {
        console.warn(`Model ${m} failed:`, err?.message || err);
        lastErr = err;
      }
    }

    if (!lastText) {
      const errMsg =
        (lastErr && lastErr.message) ||
        "All candidate models failed. Check API key, network, or model availability.";
      return res.status(502).json({
        success: false,
        message: "AI generation failed",
        detail: errMsg,
      });
    }

    const jsonText = extractJsonObject(lastText);
    if (!jsonText) {
      return res.status(502).json({
        success: false,
        message: "AI returned malformed response (no JSON found)",
        raw: lastText,
        model: usedModel,
      });
    }

    let data;
    try {
      data = JSON.parse(jsonText);
    } catch (parseErr) {
      return res.status(502).json({
        success: false,
        message: "AI returned invalid JSON",
        model: usedModel,
        raw: lastText,
        detail: parseErr?.message || String(parseErr),
      });
    }

    return res.status(200).json({
      success: true,
      data,
      model: usedModel,
    });
  } catch (err) {
    console.error("AI invoice generation error:", err);
    return res.status(500).json({
      success: false,
      message: "AI generation failed",
      detail: err?.message || String(err),
    });
  }
});


// ── POST /api/ai/reminder ─────────────────────────────────────────────────────
// Body: { invoiceId, clientName, clientEmail, amount, currency, dueDate, notes, status }
// Returns: { subject: string, body: string }
aiInvoiceRouter.post("/reminder", async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({ success: false, message: "GEMINI_API_KEY not set" });
    }

    const { invoiceId, clientName, clientEmail, amount, currency, dueDate, notes, status } =
      req.body || {};

    if (!invoiceId) {
      return res.status(400).json({ success: false, message: "invoiceId is required" });
    }

    const prompt = `
You are a professional billing assistant. Write a concise, polite payment reminder email.

Invoice details:
- Invoice Number: ${invoiceId}
- Client Name: ${clientName || "Valued Client"}
- Client Email: ${clientEmail || ""}
- Amount Due: ${currency || "INR"} ${amount || 0}
- Due Date: ${dueDate || "as soon as possible"}
- Status: ${status || "Unpaid"}
- Notes: ${notes || "none"}

Return ONLY a valid JSON object with exactly two string fields:
{
  "subject": "...",
  "body": "..."
}

Rules:
- subject: short, professional email subject line
- body: full email body text (plain text, use \\n for line breaks)
- Keep it friendly but firm
- Do NOT include code fences or any text outside the JSON
`;

    let lastErr = null;
    let resultText = null;
    let usedModel = null;

    for (const m of MODEL_CANDIDATES) {
      try {
        const { text, modelName } = await tryGenerateWithModel(m, prompt);
        if (text && text.trim()) {
          resultText = text;
          usedModel = modelName;
          break;
        }
      } catch (err) {
        console.warn(`Reminder model ${m} failed:`, err?.message || err);
        lastErr = err;
      }
    }

    if (!resultText) {
      return res.status(502).json({
        success: false,
        message: "AI reminder generation failed",
        detail: lastErr?.message || "All models failed",
      });
    }

    const jsonText = extractJsonObject(resultText);
    if (!jsonText) {
      return res.status(502).json({
        success: false,
        message: "AI returned malformed response",
        raw: resultText,
      });
    }

    let data;
    try {
      data = JSON.parse(jsonText);
    } catch (e) {
      return res.status(502).json({
        success: false,
        message: "AI returned invalid JSON",
        raw: resultText,
        detail: e?.message,
      });
    }

    return res.status(200).json({ success: true, data, model: usedModel });
  } catch (err) {
    console.error("AI reminder error:", err);
    return res.status(500).json({ success: false, message: err?.message || "Failed" });
  }
});

export default aiInvoiceRouter;
