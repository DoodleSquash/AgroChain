import { Request, Response } from 'express';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROK_API_KEY = process.env.GROK_API_KEY;

const AGENT_SYSTEM_PROMPT = `You are AgroBot, a warm and helpful multilingual voice assistant for AgroChain — a platform that connects Indian farmers with supermarkets and buyers.

You help farmers:
- Post and manage job listings for hiring workers
- Create and manage produce listings  
- Track orders and payments
- Answer questions about the platform

CRITICAL RULES:
1. Always DETECT the language the user is speaking and respond in the EXACT SAME LANGUAGE.
2. Keep responses SHORT and SPOKEN-WORD friendly (no bullet points, no markdown, no long sentences).
3. Be warm, confident, and proactive — like a helpful friend.
4. When filling a form, confirm what you filled and ask about any missing required fields.
5. If the user just says "hi" or asks a general question, respond conversationally.
7. If the user asks to navigate to a different page, YOU MUST use intent.action = "GLOBAL_NAVIGATE" and intent.fields.route = "<route>".
   Understand informal/broken language:
   - "Dashboard" / "Home" ➡️ "/farmer/dashboard"
   - "New Listing" / "Sell crops" / "Fasal bechni hai" ➡️ "/farmer/listings/new"
   - "My Listings" / "Mera saman" / "What am I selling" ➡️ "/farmer/listings"
   - "Orders" / "Past sales" / "Kisne kharida" / "Order history" ➡️ "/farmer/orders"
   - "Payments" / "Mera paisa" / "Escrow" / "Earnings" ➡️ "/farmer/payments"
   - "Hire" / "Workers chahiye" / "Mazdoor" ➡️ "/farmer/hire"
   - "Buyers" / "Connections" / "Log jo kharidte hai" ➡️ "/farmer/buyers"
   - "Profile edit" / "Settings" / "Details theek karna" ➡️ "/farmer/profile/edit"
8. If the schema contains "PAGE_CONTEXT", it means no specific actions are available except navigation. You must use that context data to answer the user's questions about their stats/data.
9. ONLY set "askingQuestion": false if the user says goodbye or explicitly ends the conversation. Otherwise, keep it true so the microphone stays open.

LANGUAGE DETECTION EXAMPLES:
- "Namaskar, ek nayi job post karni hai" → Respond in Hindi
- "Naan oru velai post seiya virumbugirien" → Respond in Tamil
- "Hello, I need to post a job" → Respond in English

You must respond with ONLY a valid JSON object with this exact structure:
{
  "intent": {
    "action": "action from page schema, 'GLOBAL_NAVIGATE', or null",
    "fields": { "route": "/farmer/dashboard" }, // MUST include 'route' if action is GLOBAL_NAVIGATE. Otherwise use page schema fields.
    "detectedLanguage": "BCP-47 (e.g. hi-IN, en-IN, mr-IN)"
  },
  "response": "Your spoken reply in the SAME LANGUAGE. Confirm what you did, or ask what you need.",
  "askingQuestion": true // true to keep mic open, false ONLY to say goodbye
}`;

export const handleVoiceIntent = async (req: Request, res: Response) => {
  try {
    const { transcript, schema, language, conversationHistory = [] } = req.body;

    console.log('[AgroBot] ─────────────────────────────────────────────');
    console.log('[AgroBot] 📥 Transcript:', transcript);
    console.log('[AgroBot] Language hint:', language, '| History msgs:', conversationHistory.length);

    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    const pageContext = schema
      ? `\n\nCURRENT PAGE ACTIONS (only use these for intent.action):\n${schema}`
      : '\n\nNo specific page context. Respond conversationally and helpfully.';

    const messages = [
      { role: 'system', content: `${AGENT_SYSTEM_PROMPT}${pageContext}` },
      ...conversationHistory.slice(-8), // last 8 exchanges for context
      { role: 'user', content: transcript }
    ];

    // ── Groq (Primary with rotation) ──
    const groqKeys = [
      process.env.GROQ_API_KEY,
      process.env.GROQ_API_KEY2,
      process.env.GROQ_API_KEY3,
      process.env.GROQ_API_KEY4,
    ].filter(Boolean) as string[];

    if (groqKeys.length > 0) {
      let groqRes, groqData, lastErr;

      for (const [index, key] of groqKeys.entries()) {
        console.log(`[AgroBot] 🤖 Sending to Groq ${index + 1}/${groqKeys.length}...`);
        
        groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages,
            response_format: { type: "json_object" },
            temperature: 0.4,
            max_tokens: 600
          })
        });

        console.log('[AgroBot] Groq HTTP status:', groqRes.status);
        
        if (groqRes.ok) {
          groqData = await groqRes.json() as any;
          break; // Success! Exit the loop.
        }
        
        lastErr = await groqRes.text();
        console.error(`[AgroBot] ⚠️ Groq Key ${index + 1} failed (Status ${groqRes.status}):`, lastErr.slice(0, 100));
        
        if (groqRes.status !== 429) {
          break; // Break if it's not a rate limit error so we don't spam bad requests
        }
      }

      if (!groqData) {
        console.error('[AgroBot] ❌ All Groq keys exhausted or failed.');
        return res.status(groqRes?.status || 500).json({ error: 'Groq API error across all keys', details: lastErr });
      }

      let rawContent = groqData.choices?.[0]?.message?.content?.trim() || '';
      console.log('[AgroBot] Raw response:', rawContent.slice(0, 400));

      rawContent = rawContent.replace(/^```json\s*/i, '').replace(/```$/g, '').trim();

      try {
        const parsed = JSON.parse(rawContent);
        console.log('[AgroBot] ✅ response:', parsed.response?.slice(0, 100));
        console.log('[AgroBot] ✅ intent action:', parsed.intent?.action);
        return res.json(parsed);
      } catch (e) {
        console.error('[AgroBot] ❌ JSON parse failed. Raw:', rawContent);
        return res.status(500).json({ error: 'Failed to parse agent response', rawContent });
      }
    }

    // ── xAI Grok (Fallback) ──
    if (GROK_API_KEY && GROK_API_KEY !== 'your_xai_grok_key_here') {
      console.log('[AgroBot] 🤖 Using xAI Grok as fallback...');
      const response = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROK_API_KEY}` },
        body: JSON.stringify({ model: "grok-beta", messages, stream: false, temperature: 0.3 })
      });
      if (!response.ok) {
        const err = await response.text();
        return res.status(response.status).json({ error: 'Grok API error', details: err });
      }
      const data = await response.json() as any;
      const rawContent = data.choices[0].message.content.trim()
        .replace(/^```json\s*/i, '').replace(/```$/g, '').trim();
      const parsed = JSON.parse(rawContent);
      return res.json(parsed);
    }

    console.error('[AgroBot] ❌ No AI API key configured.');
    return res.status(500).json({ error: 'No AI API key configured. Set GROQ_API_KEY in backend/.env' });

  } catch (error: any) {
    console.error('[AgroBot] ❌ Unhandled exception:', error.message);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};
