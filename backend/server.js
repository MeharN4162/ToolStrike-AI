import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

// UNIVERSAL AI CALLER
async function callGroq(messages) {
  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  console.log("Groq response:", JSON.stringify(data, null, 2));

  if (!response.ok) {
    return { error: data.error?.message || `Groq request failed (${response.status}).` };
  }

  if (!data.choices?.[0]?.message?.content) {
    return { error: "AI returned no content." };
  }

  return { content: data.choices[0].message.content.trim() };
}

// SAFE BODY CHECKER (GLOBAL FIX)
function requireInput(req, res) {
  if (!req.body || !req.body.input) {
    return res.status(400).json({ error: "Missing input." });
  }
  return null;
}

// SUMMARIZER
app.post("/summarizer", async (req, res) => {
  if (requireInput(req, res)) return;

  const input = req.body.input;
  const length = req.body.length;

  const lengthLabel =
    length === "short" ? "very short" :
    length === "long" ? "detailed" :
    "medium";

  try {
    const { content, error } = await callGroq([
      { role: "system", content: "Summarize clearly. Return ONLY the summary." },
      { role: "user", content: `Summarize this text in a ${lengthLabel} way:\n\n${input}` }
    ]);

    if (error) return res.json({ error });
    res.json({ result: content });
  } catch (err) {
    res.json({ error: "AI request failed." });
  }
});

// PARAPHRASER
app.post("/paraphraser", async (req, res) => {
  if (requireInput(req, res)) return;

  const input = req.body.input;
  const tone = req.body.tone;

  const toneLabel =
    tone === "formal" ? "more formal" :
    tone === "simple" ? "simpler" :
    "neutral";

  try {
    const { content, error } = await callGroq([
      { role: "system", content: "Paraphrase naturally. Return ONLY the rewritten text." },
      { role: "user", content: `Paraphrase this text in a ${toneLabel} tone:\n\n${input}` }
    ]);

    if (error) return res.json({ error });
    res.json({ result: content });
  } catch (err) {
    res.json({ error: "AI request failed." });
  }
});

// GRAMMAR FIXER
app.post("/grammar", async (req, res) => {
  if (requireInput(req, res)) return;

  const input = req.body.input;

  try {
    const { content, error } = await callGroq([
      { role: "system", content: "Fix grammar. Return ONLY the corrected text." },
      { role: "user", content: `Fix this text:\n\n${input}` }
    ]);

    if (error) return res.json({ error });
    res.json({ result: content });
  } catch (err) {
    res.json({ error: "AI request failed." });
  }
});

// EMAIL WRITER
app.post("/email", async (req, res) => {
  if (requireInput(req, res)) return;

  const input = req.body.input;
  const type = req.body.type;
  const tone = req.body.tone;

  try {
    const { content, error } = await callGroq([
      { role: "system", content: "Write clean emails. Return ONLY the email." },
      { role: "user", content: `Write an email:\n\n${input}\n\nType: ${type}\nTone: ${tone}` }
    ]);

    if (error) return res.json({ error });
    res.json({ result: content });
  } catch (err) {
    res.json({ error: "AI request failed." });
  }
});

// STUDY HELPER
app.post("/study", async (req, res) => {
  if (requireInput(req, res)) return;

  const input = req.body.input;
  const level = req.body.level;
  const format = req.body.format;

  const levelLabel =
    level === "advanced" ? "advanced" :
    level === "intermediate" ? "intermediate" :
    "basic";

  const formatInstruction =
    format === "bullet" ? "Use bullet points." :
    format === "qa" ? "Use Q&A format." :
    "Use paragraphs.";

  try {
    const { content, error } = await callGroq([
      { role: "system", content: "Explain clearly. Return ONLY the explanation." },
      { role: "user", content: `Explain at a ${levelLabel} level.\n${formatInstruction}\n\n${input}` }
    ]);

    if (error) return res.json({ error });
    res.json({ result: content });
  } catch (err) {
    res.json({ error: "AI request failed." });
  }
});

// LENGTH CONTROL
app.post("/length", async (req, res) => {
  if (requireInput(req, res)) return;

  const input = req.body.input;
  const mode = req.body.mode;

  const action = mode === "expand" ? "Expand" : "Shorten";

  try {
    const { content, error } = await callGroq([
      { role: "system", content: "Adjust length. Return ONLY the rewritten text." },
      { role: "user", content: `${action} this text:\n\n${input}` }
    ]);

    if (error) return res.json({ error });
    res.json({ result: content });
  } catch (err) {
    res.json({ error: "AI request failed." });
  }
});

// TONE CHANGER
app.post("/tone", async (req, res) => {
  if (requireInput(req, res)) return;

  const input = req.body.input;
  const mode = req.body.mode;

  try {
    const { content, error } = await callGroq([
      { role: "system", content: "Rewrite tone. Return ONLY the rewritten text." },
      { role: "user", content: `Rewrite this text in a ${mode} tone:\n\n${input}` }
    ]);

    if (error) return res.json({ error });
    res.json({ result: content });
  } catch (err) {
    res.json({ error: "AI request failed." });
  }
});

// START SERVER! (Render-compatible)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT} (GROQ MODE)`);
});
