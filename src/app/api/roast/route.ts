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

    // --- Jina AI Scraping (Standard) ---
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

    // --- THE "COMEDY ROAST" PROMPT ---
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a savage, cynical Silicon Valley VC who is roasting this startup on a live comedy show. 
          
          Your persona is "Gordon Ramsay meets Steve Jobs." You are allergic to corporate jargon.
          
          RULES FOR THE ROAST:
          1. Be MEAN but FUNNY. Use metaphors. (e.g., "This reads like it was written by a depressed HR bot.")
          2. The "Roast" field must be a punchline.
          3. The "Fixes" must be TACTICAL. 
             - The 'problem' field should be the insult.
             - The 'solution' field must be the actual helpful advice.
          
          Return JSON format:
          { 
            "score": number (0-50 for bad sites, be stingy), 
            "roast": "A 1-2 sentence devastatingly funny summary using a metaphor.", 
            "fixes": [
              { 
                "problem": "Quote the bad text and insult it (e.g. 'Empower your dreams? This sounds like a fortune cookie.')", 
                "solution": "The actual fix (e.g. 'Change to: We help you save 50% on tax.')" 
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
          content: `Roast this landing page copy. Make it hurt: \n\n${text}`,
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