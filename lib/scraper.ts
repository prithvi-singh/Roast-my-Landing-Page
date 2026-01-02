import * as cheerio from "cheerio";

export async function scrapeLandingPage(url: string): Promise<string> {
  try {
    // Ensure protocol exists
    const targetUrl = url.startsWith("http") ? url : `https://${url}`;

    const response = await fetch(targetUrl, {
      headers: {
        // Pretend to be a standard browser to bypass basic blocks
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove scripts, styles, and SVGs to reduce noise
    $("script, style, svg, nav, footer").remove();

    // Extract relevant content as requested
    const content: string[] = [];

    $("h1, h2, h3, p").each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 5) { // Filter out empty or tiny fragments
        content.push(text);
      }
    });

    const finalString = content.join("\n\n");

    // Fallback if scraping didn't get enough meaningful data (Anti-bot protection)
    if (finalString.length < 50) {
      throw new Error("ANTI_BOT_DETECTED");
    }

    // Truncate to avoid token limits (approx 1500 words)
    return finalString.substring(0, 10000); 

  } catch (error: any) {
    if (error.message === "ANTI_BOT_DETECTED") {
      throw error;
    }
    throw new Error("Could not access URL");
  }
}