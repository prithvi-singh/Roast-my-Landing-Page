import { NextResponse } from "next/server";
import OpenAI from "openai";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const body = await req.json();
    const { url, mode } = body;
    let { text } = body;

    console.log(`Processing Request - Mode: ${mode}`);

    // --- Jina AI Scraping (unchanged) ---
    if (mode === "url" && url) {
      try {
        const response = await fetch(`https://r.jina.ai/${url}`, {
          method: 'GET',
          headers: { "Accept": "text/plain" }
        });
        if (!response.ok) throw new Error(`Jina status: ${response.status}`);
        const rawText = await response.text();
        text = rawText.replace(/!\[.*?\]\(.*?\)/g, "").replace(/\[.*?\]\(.*?\)/g, "").slice(0, 4000);
      } catch (error) {
        return NextResponse.json(
          { error: "Could not scrape site. Please use Paste Copy tab." },
          { status: 400 }
        );
      }
    }

    if (!text || text.length < 50) {
      return NextResponse.json(
        { error: "Content too short. Try pasting more text." },
        { status: 400 }
      );
    }

    // --- THE UPGRADED "SURGICAL ROAST" PROMPT ---
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a world-class Conversion Rate Optimization (CRO) expert known for being brutally honest. 
          
          Your job is to audit a landing page and find specific flaws that kill conversions.
          
          RULES:
          1. DO NOT be vague. Never say "make it clearer." Say "The word 'Synergy' is meaningless here."
          2. YOU MUST QUOTE the specific text you are roasting.
          3. Focus on:
             - The Value Proposition (Is it clear what they do in 5 seconds?)
             - The Call to Action (Is it weak/hidden?)
             - User Objections (What are they failing to answer?)
          
          Return JSON format:
          { 
            "score": number (0-100), 
            "roast": "A 1-sentence savage summary of the main problem.", 
            "fixes": [
              { 
                "problem": "Quote the exact bad text or describe the missing element", 
                "solution": "Specific rewrite or tactical fix (e.g., 'Change button to 'Get Demo'')" 
              },
              { 
                "problem": "...", 
                "solution": "..." 
              },
              { 
                "problem": "...", 
                "solution": "..." 
              }
            ] 
          }`,
        },
        {
          role: "user",
          content: `Analyze this landing page copy: \n\n${text}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Server Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}