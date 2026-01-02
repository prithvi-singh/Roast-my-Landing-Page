import { NextResponse } from "next/server";
import OpenAI from "openai";
import * as cheerio from "cheerio";

export const dynamic = 'force-dynamic'; // CRITICAL: Forces Vercel to not cache this route

export async function POST(req: Request) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { url, text, mode } = await req.json();
    let contentToRoast = text;
    let scrapeStatus = "skipped"; // For debugging

    // Scrape if URL mode
    if (mode === "url" && url) {
      try {
        console.log(`Attempting to scrape: ${url}`);
        
        const response = await fetch(url, {
          method: 'GET',
          cache: 'no-store', // CRITICAL: Disable caching
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
          },
        });

        scrapeStatus = `HTTP ${response.status}`;
        
        if (!response.ok) {
           throw new Error(`Failed to fetch. Status: ${response.status}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Remove scripts, styles, and navbars to clean up the text
        $('script').remove();
        $('style').remove();
        $('nav').remove();
        $('footer').remove();

        // Extract meaningful text
        contentToRoast = $("body")
          .text()
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 3000);
          
        console.log(`Scraped length: ${contentToRoast.length} chars`);

      } catch (error: any) {
        console.error("Scraping error:", error);
        return NextResponse.json(
          { error: `Scraping failed (${scrapeStatus}). Website might be blocking Vercel IPs. Please use Paste mode.` },
          { status: 400 }
        );
      }
    }

    // Lowered limit to 20 chars so 'example.com' passes
    if (!contentToRoast || contentToRoast.length < 20) {
      return NextResponse.json(
        { error: "Content too short or blocked. Try pasting the text manually." },
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
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}