import { NextResponse } from "next/server";
import OpenAI from "openai";
import { scrapeLandingPage } from "@/lib/scraper";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System Prompt
const SYSTEM_PROMPT = `You are a legendary tech product critic known for being brutally honest but incredibly insightful (like Gordon Ramsay for landing pages).

Your goal is to analyze the provided landing page text and Output a JSON object.

### INSTRUCTIONS:
1. SCORE: Give a harsh score from 0-100. Be stingy. High scores are only for perfection.
2. ROAST: Write a 1-2 sentence "Devastating Summary." This should be witty, slightly mean, and attack the lack of clarity or overuse of jargon. Make it hurt a little.
3. ADVICE: Provide 3 "Tactical Fixes."
   - CRITICAL RULE: Do not give general advice like "Improve clarity."
   - You MUST quote the specific bad text and provide a specific rewrite or deletion.
   - Example: "Change 'Synergizing global paradigms' to 'We sell shoes'."

### OUTPUT FORMAT (JSON ONLY):
{
  "score": number,
  "roast": "string",
  "fixes": [
    { "problem": "string", "solution": "string" },
    { "problem": "string", "solution": "string" },
    { "problem": "string", "solution": "string" }
  ]
}`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, content } = body;

    // Validate input
    if (!type || !content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "Missing or invalid input. Please provide both type and content." },
        { status: 400 }
      );
    }

    if (type !== "url" && type !== "text") {
      return NextResponse.json(
        { error: "Invalid type. Must be 'url' or 'text'." },
        { status: 400 }
      );
    }

    let textToAnalyze = content;

    // 1. Handle Scraping
    if (type === "url") {
      try {
        textToAnalyze = await scrapeLandingPage(content);
      } catch (error: any) {
        if (error.message === "ANTI_BOT_DETECTED") {
          return NextResponse.json(
            { error: "This site is protected by anti-bots. Please use the 'Paste Text' tab." },
            { status: 422 }
          );
        }
        return NextResponse.json(
          { error: "Failed to load URL. Please double-check the link or paste text manually." },
          { status: 400 }
        );
      }
    }

    // 2. AI Processing
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `### INPUT TEXT:\n${textToAnalyze}` },
      ],
      response_format: { type: "json_object" },
    });

    const aiResponse = completion.choices[0].message.content;
    if (!aiResponse) {
      return NextResponse.json(
        { error: "No response from AI." },
        { status: 500 }
      );
    }

    let result;
    try {
      result = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return NextResponse.json(
        { error: "Invalid response format from AI." },
        { status: 500 }
      );
    }

    // Validate result structure
    if (
      typeof result.score !== "number" || 
      !result.roast || 
      !Array.isArray(result.fixes) ||
      result.fixes.length !== 3 ||
      !result.fixes.every((fix: any) => fix.problem && fix.solution)
    ) {
      return NextResponse.json(
        { error: "Invalid response structure from AI." },
        { status: 500 }
      );
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error("Roast error:", error);
    return NextResponse.json(
      { error: "Something went wrong during the roast." },
      { status: 500 }
    );
  }
}