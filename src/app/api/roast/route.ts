import { NextResponse } from "next/server";
import OpenAI from "openai";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { url, text, mode } = await req.json();
    let contentToRoast = text;

    // --- MAGICAL FIX: Use Jina.ai for scraping ---
    if (mode === "url" && url) {
      try {
        console.log(`Asking Jina to scrape: ${url}`);
        
        // We fetch from r.jina.ai which turns any site into clean text
        const response = await fetch(`https://r.jina.ai/${url}`, {
          method: 'GET',
          headers: {
             // Jina requires no special headers, but good to be polite
             "Accept": "text/plain" 
          }
        });

        if (!response.ok) {
           throw new Error(`Jina failed with status: ${response.status}`);
        }

        // Jina returns pure text/markdown. No Cheerio needed!
        const rawText = await response.text();
        
        // Clean it up slightly (remove links and images to save tokens)
        contentToRoast = rawText
            .replace(/!\[.*?\]\(.*?\)/g, "") // remove images
            .replace(/\[.*?\]\(.*?\)/g, "") // remove links
            .slice(0, 4000); // Limit to 4000 chars

        console.log(`Jina returned ${contentToRoast.length} chars`);

      } catch (error) {
        console.error("Jina Scraping error:", error);
        return NextResponse.json(
          { error: "Could not read site. Please use the 'Paste Copy' tab." },
          { status: 400 }
        );
      }
    }
    // ---------------------------------------------

    if (!contentToRoast || contentToRoast.length < 50) {
      return NextResponse.json(
        { error: "Content too short. Try pasting the text manually." },
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
          content: `Roast this content: ${contentToRoast}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    return NextResponse.json(result);

  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}