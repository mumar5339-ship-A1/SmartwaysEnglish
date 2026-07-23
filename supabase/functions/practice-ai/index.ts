import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GROQ_MODEL = "llama-3.3-70b-versatile";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { words } = await req.json();

    if (!words || !Array.isArray(words) || words.length === 0) {
      return jsonResponse({ error: "Words array is required" }, 400);
    }

    const wordList = words
      .map((w: { word: string; meaning: string }, i: number) => `${i + 1}. ${w.word}: ${w.meaning}`)
      .join("\n");

    const prompt = `You are a vocabulary tutor. Based on the following vocabulary words and their meanings, create a practice quiz with 3 multiple-choice questions. Each question should test the understanding of one word. For each question, provide 4 options and indicate the correct answer.

Words:
${wordList}

Return ONLY a valid JSON array with this exact format, no other text:
[
  {
    "question": "The question text here",
    "options": ["option A", "option B", "option C", "option D"],
    "correctIndex": 0
  }
]`;

    const groqKey = Deno.env.get("GROQ_API_KEY");
    if (!groqKey) {
      return jsonResponse({ error: "GROQ_API_KEY is not configured" }, 500);
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: "You are a helpful vocabulary tutor that creates practice quizzes. Always respond with valid JSON only." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    const rawBody = await response.text();

    if (!response.ok) {
      return jsonResponse({ error: `Groq API error: ${response.status}`, details: rawBody }, 502);
    }

    let data: { choices?: Array<{ message?: { content?: string } }> };
    try {
      data = JSON.parse(rawBody);
    } catch {
      return jsonResponse({ error: "Groq returned a non-JSON response", raw: rawBody.slice(0, 500) }, 502);
    }

    const content = data.choices?.[0]?.message?.content;

    if (typeof content !== "string" || content.trim().length === 0) {
      return jsonResponse({ error: "Groq response missing message content", responseKeys: Object.keys(data) }, 502);
    }

    let quiz: unknown;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      quiz = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      return jsonResponse({ error: "Failed to parse quiz from AI response", raw: content.slice(0, 500) }, 502);
    }

    if (!Array.isArray(quiz)) {
      return jsonResponse({ error: "Parsed quiz is not an array", raw: content.slice(0, 500) }, 502);
    }

    return jsonResponse({ quiz });
  } catch (err) {
    return jsonResponse({ error: "Internal server error", details: String(err) }, 500);
  }
});
