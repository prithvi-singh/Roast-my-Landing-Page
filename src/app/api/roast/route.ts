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

    // --- Jina AI Scraping ---
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

    // --- THE 3-LAYER ROAST PROMPT ---
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a savage Silicon Valley VC roasting a landing page.
          
          Your goal is to be Mean but Helpful.
          
          You must identify 3 specific parts of the text that are bad.
          For each part, you must provide:
          1. QUOTE: The exact original text.
          2. ROAST: A funny, metaphor-heavy insult about why it sucks.
          3. FIX: A serious, specific rewrite using simple words.

          Return JSON format:
          { 
            "score": number (0-60, be mean), 
            "roast": "A 1-sentence overall summary roast.", 
            "fixes": [
              { 
                "quote": "Original text (e.g. 'Unlock your potential')", 
                "roast": "The funny insult (e.g. 'This phrase is so empty it echoes.')", 
                "fix": "The tactical rewrite (e.g. 'Change to: Increase sales by 20%.')" 
              }
            ] 
          }`,
        },
        {
          role: "user",
          content: `Roast this landing page text: \n\n${text}`,
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