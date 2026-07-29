import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

interface WordInput {
  word: string;
  meaning: string;
}

interface QuizQuestion {
  type: "fill_blank" | "sentence_correction";
  question: string;
  answer: string;
  explanation: string;
}

interface Evaluation {
  correct: boolean;
  feedback: string;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function callGroq(systemPrompt: string, userPrompt: string): Promise<string> {
  const groqKey = Deno.env.get("GROQ_API_KEY");
  if (!groqKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${groqKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    }),
  });

  const rawBody = await response.text();

  if (!response.ok) {
    throw new Error(`Groq API error (${response.status}): ${rawBody.slice(0, 300)}`);
  }

  let data: { choices?: Array<{ message?: { content?: string } }> };
  try {
    data = JSON.parse(rawBody);
  } catch {
    throw new Error(`Groq returned non-JSON response: ${rawBody.slice(0, 300)}`);
  }

  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string" || content.trim().length === 0) {
    throw new Error(`Groq response missing message content (keys: ${Object.keys(data).join(", ")})`);
  }

  return content;
}

function extractJsonArray(content: string): unknown[] {
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
  if (!Array.isArray(parsed)) {
    throw new Error("AI response was valid JSON but not an array");
  }
  return parsed;
}

async function handleGenerate(words: WordInput[]): Promise<Response> {
  if (words.length === 0) {
    return jsonResponse({ error: "Words array is required" }, 400);
  }

  const wordList = words
    .map((w, i) => `${i + 1}. ${w.word}: ${w.meaning}`)
    .join("\n");

  const systemPrompt =
    "You are a helpful vocabulary tutor that creates practice quizzes. " +
    "Always respond with valid JSON only — no markdown, no explanation, no code fences.";

  const userPrompt = `Based on these vocabulary words and their meanings, create a 10-question practice quiz. Mix roughly evenly between "fill_blank" (fill in the blank) and "sentence_correction" (fix the sentence) types — aim for about 5 of each. Use a different word from the list for each question, drawing from as many of the words as possible.

Words:
${wordList}

Return ONLY a JSON array with this exact shape, no other text:
[
  {
    "type": "fill_blank",
    "question": "A sentence with a ______ blank using one of the words",
    "answer": "the correct word",
    "explanation": "a short explanation of why this word fits"
  },
  {
    "type": "sentence_correction",
    "question": "A sentence that misuses one of the words",
    "answer": "the corrected sentence",
    "explanation": "a short explanation of what was wrong"
  }
]`;

  const content = await callGroq(systemPrompt, userPrompt);

  let questions: QuizQuestion[];
  try {
    questions = extractJsonArray(content) as QuizQuestion[];
  } catch (err) {
    return jsonResponse({ error: `Failed to parse quiz: ${err instanceof Error ? err.message : String(err)}`, raw: content.slice(0, 500) }, 502);
  }

  const valid = questions.filter(
    (q): q is QuizQuestion =>
      q &&
      typeof q.type === "string" &&
      (q.type === "fill_blank" || q.type === "sentence_correction") &&
      typeof q.question === "string" &&
      typeof q.answer === "string",
  );

  if (valid.length === 0) {
    return jsonResponse({ error: "AI returned no valid questions", raw: content.slice(0, 500) }, 502);
  }

  return jsonResponse({ questions: valid });
}

async function handleEvaluate(questions: QuizQuestion[], answers: string[]): Promise<Response> {
  if (!Array.isArray(questions) || !Array.isArray(answers)) {
    return jsonResponse({ error: "questions and answers arrays are required" }, 400);
  }

  const pairs = questions.map((q, i) => ({
    question: q.question,
    expectedAnswer: q.answer,
    userAnswer: answers[i]?.trim() || "(no answer)",
  }));

  const systemPrompt =
    "You are a vocabulary tutor evaluating a student's answers. " +
    "Always respond with valid JSON only — no markdown, no explanation, no code fences.";

  const userPrompt = `Evaluate each student answer against the expected answer. Be lenient on capitalization and minor spelling. For each item, say whether the answer is correct and give a short, encouraging feedback sentence.

Items to evaluate:
${JSON.stringify(pairs, null, 2)}

Return ONLY a JSON array with this exact shape, one entry per item, in order:
[
  {
    "correct": true,
    "feedback": "Short feedback sentence"
  }
]`;

  const content = await callGroq(systemPrompt, userPrompt);

  let evaluations: Evaluation[];
  try {
    evaluations = extractJsonArray(content) as Evaluation[];
  } catch (err) {
    return jsonResponse({ error: `Failed to parse evaluations: ${err instanceof Error ? err.message : String(err)}`, raw: content.slice(0, 500) }, 502);
  }

  const valid = evaluations.filter(
    (e): e is Evaluation =>
      e &&
      typeof e.correct === "boolean" &&
      typeof e.feedback === "string",
  );

  if (valid.length === 0) {
    return jsonResponse({ error: "AI returned no valid evaluations", raw: content.slice(0, 500) }, 502);
  }

  const score = valid.filter((e) => e.correct).length;

  return jsonResponse({ evaluations: valid, score });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const action = body?.action;

    if (action === "generate") {
      return await handleGenerate(body.words ?? []);
    }

    if (action === "evaluate") {
      return await handleEvaluate(body.questions ?? [], body.answers ?? []);
    }

    return jsonResponse({ error: `Unknown action: "${action}". Expected "generate" or "evaluate".` }, 400);
  } catch (err) {
    return jsonResponse({ error: "Internal server error", details: String(err) }, 500);
  }
});
