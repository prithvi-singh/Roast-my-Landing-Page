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
    let { text } = body; // Grab text from body

    console.log(`Processing Request - Mode: ${mode}`); // Debug Log

    // --- MAGICAL FIX: Use Jina.ai for scraping ---
    if (mode === "url" && url) {
      try {
        console.log(`Asking Jina to scrape: ${url}`);
        const response = await fetch(`https://r.jina.ai/${url}`, {
          method: 'GET',
          headers: { "Accept": "text/plain" }
        });

        if (!response.ok) throw new Error(`Jina status: ${response.status}`);
        
        const rawText = await response.text();
        text = rawText.replace(/!\[.*?\]\(.*?\)/g, "").replace(/\[.*?\]\(.*?\)/g, "").slice(0, 4000);
        console.log(`Scraped Text Length: ${text.length}`);
      
      } catch (error) {
        console.error("Jina Error:", error);
        return NextResponse.json(
          { error: "Could not scrape site. Please use Paste Copy tab." },
          { status: 400 }
        );
      }
    }

    // FINAL CHECK
    console.log(`Final Text to Roast Length: ${text ? text.length : 0}`);

    if (!text || text.length < 50) {
      return NextResponse.json(
        { error: "Content too short (under 50 chars) or blocked. Try pasting more text." },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a brutal VC investor roasting a landing page.
          Return valid JSON only.
          Format: { "score": number, "roast": "string", "fixes": [{ "problem": "string", "solution": "string" }] }`,
        },
        {
          role: "user",
          content: `Roast this content: ${text}`,
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