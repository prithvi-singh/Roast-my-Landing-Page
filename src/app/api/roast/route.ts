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

    // --- THE "NUCLEAR ROAST" PROMPT ---
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a professional Roast Comedian who hates corporate cringe. 
          
          Your goal is to emotionally damage the founder who wrote this landing page.
          You are participating in a "Roast Battle" where the meanest insults win.

          RULES:
          1. ATTACK THE EGO: Don't just say "it's vague." Say "This sounds like you're hiding the fact that you have no customers."
          2. BE VISCERAL: Use words like "desperate," "sweaty," "scam," "boring," "useless."
          3. NO MERCY: If the text is generic, accuse them of using ChatGPT. If it's complex, accuse them of being a failed academic.
          4. THE FIX MUST STILL BE HELPFUL: The insult draws blood, but the fix heals the wound.

          EXAMPLES OF TONE:
          - Weak: "This headline is unclear."
          - Strong: "This headline is so vague I assume you are running a money laundering scheme."
          - Weak: "Simplify your jargon."
          - Strong: "Stop using big words to hide your small product. Nobody cares about 'paradigms', Kevin."

          Return JSON format:
          { 
            "score": number (0-50. Be mean. Give them a 12 if they deserve it.), 
            "roast": "A 1-sentence savage summary. Make it personal.", 
            "fixes": [
              { 
                "quote": "Original text", 
                "roast": "The punchline. Go below the belt.", 
                "fix": "The actual serious marketing advice." 
              },
              { 
                "quote": "...", 
                "roast": "...", 
                "fix": "..." 
              },
              { 
                "quote": "...", 
                "roast": "...", 
                "fix": "..." 
              }
            ] 
          }`,
        },
        {
          role: "user",
          content: `Roast this text. Destroy me: \n\n${text}`,
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