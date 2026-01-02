import { NextResponse } from "next/server";
import OpenAI from "openai";
import * as cheerio from "cheerio";

// 1. We do NOT initialize OpenAI here anymore.
// We just import it.

export async function POST(req: Request) {
  try {
    // 2. Initialize it INSIDE the function (Lazy loading)
    // This prevents the "Missing Credentials" error during build
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { url, text, mode } = await req.json();
    let contentToRoast = text;

    // Scrape if URL mode
    if (mode === "url" && url) {
      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
        });
        const html = await response.text();
        const $ = cheerio.load(html);

        // Extract meaningful text (Headings and paragraphs)
        contentToRoast = $("h1, h2, h3, p")
          .map((_, el) => $(el).text())
          .get()
          .join(" ")
          .slice(0, 3000); // Limit to 3000 chars to save tokens
      } catch (error) {
        return NextResponse.json(
          { error: "Failed to scrape site. Try pasting text." },
          { status: 400 }
        );
      }
    }

    if (!contentToRoast || contentToRoast.length < 50) {
      return NextResponse.json(
        { error: "Not enough content found to roast. Paste text manually." },
        { status: 400 }
      );
    }

    // Call OpenAI
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
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong during the roast." },
      { status: 500 }
    );
  }
}