import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const OPENROUTER_MODEL = "google/gemma-4-31B-it:free";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { words } = await req.json();

    if (!words || !Array.isArray(words) || words.length === 0) {
      return new Response(JSON.stringify({ error: "Words array is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("OPENROUTER_API_KEY")}`,
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: "system", content: "You are a helpful vocabulary tutor that creates practice quizzes. Always respond with valid JSON only." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(JSON.stringify({ error: `OpenRouter API error: ${response.status}`, details: errText }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    let quiz;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      quiz = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      return new Response(JSON.stringify({ error: "Failed to parse quiz from AI response", raw: content }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ quiz }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error", details: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
