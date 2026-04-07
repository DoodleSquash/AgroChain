import { Request, Response } from 'express';
import Groq from 'groq-sdk';

export const getMarketPrices = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!process.env.GROQ_API_KEY) {
      res.status(500).json({ error: 'Groq API Key not configured' });
      return;
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const lang = req.query.lang || 'English';
    const prompt = `
You are an expert agricultural market analyzer in India.
Provide current live market pricing trends for three major crops: Tomatoes, Wheat, and Onions.
The output MUST be in the language: ${lang}.
For each crop, give:
1. "crop": The name of the crop (in ${lang}).
2. "priceRange": A realistic current price range per kg (e.g., "₹15 - ₹20").
3. "trend": Either "UP", "DOWN", or "STABLE".
4. "advice": A short 1-sentence advisory for farmers on whether to hold, sell, or lock in escrow contracts right now (in ${lang}).

Respond ONLY with valid JSON. Do NOT wrap in markdown \`\`\`json blocks.
The format must be exact:
{
  "insights": [
    {
      "crop": "Tomatoes",
      "priceRange": "...",
      "trend": "UP",
      "advice": "..."
    }
  ]
}
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an AI that outputs strictly valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.5,
      max_tokens: 1024,
    });

    let rawOutput = chatCompletion.choices[0]?.message?.content || "";
    
    // Safely parse JSON if the model returns markdown or plain text accidentally
    rawOutput = rawOutput.trim();
    if (rawOutput.startsWith('```json')) {
      rawOutput = rawOutput.replace(/```json/g, '').replace(/```/g, '').trim();
    } else if (rawOutput.startsWith('```')) {
      rawOutput = rawOutput.replace(/```/g, '').trim();
    }

    const data = JSON.parse(rawOutput);

    res.json(data);
  } catch (error) {
    console.error('Groq AI Error:', error);
    res.status(500).json({ error: 'Failed to generate AI insights' });
  }
};

import prisma from '../db';

export const evaluateBuyerRisk = async (req: Request, res: Response): Promise<void> => {
  try {
    const { buyer_id, lang = 'English' } = req.body;
    if (!buyer_id) {
      res.status(400).json({ error: 'buyer_id is required' });
      return;
    }

    if (!process.env.GROQ_API_KEY) {
      res.status(500).json({ error: 'Groq API Key not configured' });
      return;
    }

    // Fetch buyer history
    const orders = await prisma.order.findMany({
      where: { buyer_id },
      select: {
        status: true,
        total_amount: true,
        created_at: true,
      }
    });

    if (orders.length === 0) {
      // New buyer - Need to translate the default response too
      const defaultPrompt = `
        Translate the following risk assessment into ${lang}:
        Flags: ["New Buyer on Platform (No significant history)"]
        Analysis: "This buyer has no prior order history on AgroChain. Proceed normally, but ensure standard escrow holds are applied."
        Respond only with JSON: {"flags": ["..."], "analysis": "..."}
      `;
      
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: defaultPrompt }],
        model: "llama-3.1-8b-instant",
        temperature: 0.1,
      });

      const translated = JSON.parse(completion.choices[0]?.message?.content || '{"flags":[], "analysis":""}');

      res.json({
        riskScore: 20,
        isVerified: true,
        flags: translated.flags,
        analysis: translated.analysis
      });
      return;
    }

    const totalOrders = orders.length;
    const cancelledOrders = orders.filter(o => o.status === 'CANCELLED').length;
    const completedOrders = orders.filter(o => o.status === 'COMPLETED' || o.status === 'DELIVERED').length;

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const prompt = `
You are an expert fraud and risk analyst for an agricultural marketplace.
Evaluate the risk of doing business with a buyer who has the following transaction history:
- Total Orders Placed: ${totalOrders}
- Cancelled Orders: ${cancelledOrders}
- Successful/Completed Orders: ${completedOrders}

Important context: A high cancellation rate means high probability of ghost buying. 

Output language: ${lang}. 

Output strictly valid JSON with the following schema, do NOT wrap with markdown \`\`\`json:
{
  "riskScore": (number from 0 to 100, where higher is riskier. E.g. > 50 if high cancellations),
  "isVerified": (boolean, true if safe, false if risky),
  "flags": (array of 1 to 3 strings in ${lang} highlighting key risk points or positive signs, e.g. "Frequent Cancellations", "Trusted History"),
  "analysis": (a 2-3 sentence executive summary in ${lang} advising the farmer on whether they should accept this order or drop it)
}
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are a specialized Risk AI outputting strictly valid JSON." },
        { role: "user", content: prompt }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.2,
      max_tokens: 500,
    });

    let rawOutput = chatCompletion.choices[0]?.message?.content || "";
    rawOutput = rawOutput.trim();
    if (rawOutput.startsWith('\`\`\`json')) rawOutput = rawOutput.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    else if (rawOutput.startsWith('\`\`\`')) rawOutput = rawOutput.replace(/\`\`\`/g, '').trim();

    const data = JSON.parse(rawOutput);
    res.json(data);

  } catch (error) {
    console.error('Groq Risk Analysis Error:', error);
    res.status(500).json({ error: 'Failed to analyze buyer risk' });
  }
};
