import { useCallback, useEffect, useState } from 'react';
import {
  Sparkles,
  X,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Lightbulb,
  PenLine,
  Wand2,
  Trophy,
} from 'lucide-react';
import type { Word, QuizQuestion, Evaluation } from '@/types';
import { PRACTICE_AI_URL, practiceHeaders } from '@/lib/supabase';

type Phase = 'idle' | 'generating' | 'answering' | 'evaluating' | 'results';

interface QuizProps {
  words: Word[];
  open: boolean;
  onClose: () => void;
  onQuizCompleted: (score: number, total: number) => void;
}

export function Quiz({ words, open, onClose, onQuizCompleted }: QuizProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [score, setScore] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);

  const reset = useCallback(() => {
    setPhase('idle');
    setQuestions([]);
    setAnswers([]);
    setEvaluations([]);
    setScore(0);
    setError(null);
    setCurrent(0);
  }, []);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const generateQuiz = useCallback(async () => {
    if (words.length === 0) return;
    setPhase('generating');
    setError(null);
    try {
      const res = await fetch(PRACTICE_AI_URL, {
        method: 'POST',
        headers: practiceHeaders(),
        body: JSON.stringify({ action: 'generate', words: words.map((w) => ({ word: w.word, meaning: w.meaning })) }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }
      const data = await res.json();
      if (!data?.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error(data?.error ?? 'The AI did not return any questions. Please try again.');
      }
      setQuestions(data.questions);
      setAnswers(new Array(data.questions.length).fill(''));
      setPhase('answering');
      setCurrent(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate the quiz.');
      setPhase('idle');
    }
  }, [words]);

  const submitQuiz = useCallback(async () => {
    setPhase('evaluating');
    setError(null);
    try {
      const res = await fetch(PRACTICE_AI_URL, {
        method: 'POST',
        headers: practiceHeaders(),
        body: JSON.stringify({ action: 'evaluate', questions, answers }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }
      const data = await res.json();
      if (!data?.evaluations || !Array.isArray(data.evaluations)) {
        throw new Error(data?.error ?? 'The AI did not return feedback. Please try again.');
      }
      setEvaluations(data.evaluations);
      setScore(data.score ?? data.evaluations.filter((e: Evaluation) => e.correct).length);
      setPhase('results');
      onQuizCompleted(data.score ?? data.evaluations.filter((e: Evaluation) => e.correct).length, questions.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not evaluate your answers.');
      setPhase('answering');
    }
  }, [questions, answers, onQuizCompleted]);

  const canSubmit = answers.every((a) => a.trim().length > 0);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-6 animate-fade-in">
      <div
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl animate-pop"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-gradient-to-br from-brand-50 to-white px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-500/25">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-700 text-slate-900">Practice with AI</h2>
              <p className="text-xs font-500 text-slate-500">
                {phase === 'idle' && 'Test your vocabulary knowledge'}
                {phase === 'generating' && 'Creating your quiz…'}
                {phase === 'answering' && `Question ${current + 1} of ${questions.length}`}
                {phase === 'evaluating' && 'Checking your answers…'}
                {phase === 'results' && `You scored ${score}/${questions.length}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close quiz"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="scrollbar-thin flex-1 overflow-y-auto p-5 sm:p-6">
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {phase === 'idle' && (
            <IdlePhase words={words} onStart={generateQuiz} />
          )}

          {phase === 'generating' && <LoadingPhase label="The AI is writing 3 questions from your words…" />}

          {phase === 'evaluating' && <LoadingPhase label="The AI is reading your answers and preparing feedback…" />}

          {phase === 'answering' && questions.length > 0 && (
            <div className="space-y-5">
              {/* Progress dots */}
              <div className="flex items-center gap-2">
                {questions.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-all ${
                      i < current ? 'bg-brand-500' : i === current ? 'bg-brand-300' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              <QuestionCard
                question={questions[current]}
                index={current}
                value={answers[current]}
                onChange={(val) =>
                  setAnswers((prev) => {
                    const next = [...prev];
                    next[current] = val;
                    return next;
                  })
                }
              />

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                  disabled={current === 0}
                  className="rounded-xl px-4 py-2.5 text-sm font-600 text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Previous
                </button>

                {current < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
                    disabled={!answers[current].trim()}
                    className="group flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-600 text-white transition-all hover:bg-slate-800 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ) : (
                  <button
                    onClick={submitQuiz}
                    disabled={!canSubmit}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 px-5 py-2.5 text-sm font-600 text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Wand2 className="h-4 w-4" />
                    Get AI Feedback
                  </button>
                )}
              </div>
            </div>
          )}

          {phase === 'results' && (
            <ResultsPhase
              questions={questions}
              answers={answers}
              evaluations={evaluations}
              score={score}
              onRetry={generateQuiz}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function IdlePhase({ words, onStart }: { words: Word[]; onStart: () => void }) {
  if (words.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-500">
          <Lightbulb className="h-7 w-7" />
        </div>
        <h3 className="font-display text-lg font-600 text-slate-900">Add words first</h3>
        <p className="mt-1 max-w-xs text-sm text-slate-500">
          Save at least one vocabulary word and the AI will build a quiz from your list.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-xl shadow-brand-500/30">
        <Wand2 className="h-8 w-8" />
      </div>
      <h3 className="font-display text-xl font-700 text-slate-900">Ready to practice?</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
        The AI will create a short 3-question quiz — fill-in-the-blank and sentence-correction — using your{' '}
        <span className="font-600 text-brand-600">{words.length} saved {words.length === 1 ? 'word' : 'words'}</span>.
        Answer each one, then get instant feedback.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {words.slice(0, 6).map((w) => (
          <span
            key={w.id}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-600 text-slate-700"
          >
            {w.word}
          </span>
        ))}
        {words.length > 6 && (
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-600 text-brand-600">
            +{words.length - 6} more
          </span>
        )}
      </div>

      <button
        onClick={onStart}
        className="mt-7 flex items-center gap-2 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 px-6 py-3 text-sm font-600 text-white shadow-lg shadow-brand-500/25 transition-all hover:shadow-xl hover:shadow-brand-500/30 active:scale-[0.98]"
      >
        <Sparkles className="h-4 w-4" />
        Start Quiz
      </button>
    </div>
  );
}

function LoadingPhase({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="relative mb-5">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-xl shadow-brand-500/30">
          <Sparkles className="h-8 w-8 animate-pulse" />
        </div>
      </div>
      <p className="max-w-xs text-sm font-500 text-slate-600">{label}</p>
      <div className="mt-4 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full bg-brand-400"
            style={{ animation: `pop 0.6s ${i * 0.15}s infinite alternate` }}
          />
        ))}
      </div>
    </div>
  );
}

function QuestionCard({
  question,
  index,
  value,
  onChange,
}: {
  question: QuizQuestion;
  index: number;
  value: string;
  onChange: (val: string) => void;
}) {
  const isFill = question.type === 'fill_blank';
  return (
    <div className="animate-fade-up rounded-2xl border border-slate-200 bg-slate-50/40 p-5">
      <div className="mb-3 flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-600 ${
            isFill ? 'bg-brand-50 text-brand-700' : 'bg-violet-50 text-violet-700'
          }`}
        >
          {isFill ? <PenLine className="h-3 w-3" /> : <Wand2 className="h-3 w-3" />}
          {isFill ? 'Fill in the blank' : 'Fix the sentence'}
        </span>
        <span className="text-xs font-500 text-slate-400">Question {index + 1}</span>
      </div>

      <p className="mb-4 text-lg font-500 leading-relaxed text-slate-900">{question.question}</p>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={isFill ? 'Type the missing word…' : 'Write the corrected sentence…'}
        rows={isFill ? 2 : 3}
        autoFocus
        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-100"
      />
    </div>
  );
}

function ResultsPhase({
  questions,
  answers,
  evaluations,
  score,
  onRetry,
}: {
  questions: QuizQuestion[];
  answers: string[];
  evaluations: Evaluation[];
  score: number;
  onRetry: () => void;
}) {
  const total = questions.length;
  const pct = Math.round((score / total) * 100);
  const perfect = score === total;

  return (
    <div className="space-y-5">
      {/* Score banner */}
      <div
        className={`animate-pop rounded-2xl p-6 text-center ${
          perfect
            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30'
            : 'bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-500/30'
        }`}
      >
        <div className="mb-2 grid h-14 w-14 place-items-center rounded-2xl bg-white/20 backdrop-blur">
          <Trophy className="h-7 w-7" />
        </div>
        <p className="font-display text-4xl font-700 tabular-nums">
          {score}/{total}
        </p>
        <p className="mt-1 text-sm font-500 text-white/90">
          {perfect
            ? 'Perfect score! Excellent work.'
            : pct >= 67
              ? 'Great job! Keep practicing.'
              : 'Good effort — review and try again.'}
        </p>
      </div>

      {/* Per-question feedback */}
      <div className="space-y-3">
        {questions.map((q, i) => {
          const ev = evaluations[i];
          const correct = ev?.correct ?? false;
          return (
            <div
              key={i}
              className="animate-fade-up rounded-2xl border border-slate-200 bg-white p-4"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="mb-2 flex items-start gap-2.5">
                {correct ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                ) : (
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-600 text-slate-900">{q.question}</p>
                  <div className="mt-1.5 space-y-1 text-xs">
                    <p className="text-slate-500">
                      <span className="font-600 text-slate-600">Your answer:</span>{' '}
                      <span className={correct ? 'text-emerald-600' : 'text-rose-600'}>
                        {answers[i]?.trim() || '(no answer)'}
                      </span>
                    </p>
                    {!correct && (
                      <p className="text-slate-500">
                        <span className="font-600 text-slate-600">Correct answer:</span>{' '}
                        <span className="text-emerald-600">{q.answer}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {ev?.feedback && (
                <div className="mt-2.5 flex items-start gap-2 rounded-xl bg-brand-50/70 px-3 py-2.5 text-sm text-slate-700">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <p className="leading-relaxed">{ev.feedback}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={onRetry}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-600 text-white transition-all hover:bg-slate-800 active:scale-[0.98]"
      >
        <RotateCcw className="h-4 w-4" />
        Try Another Quiz
      </button>
    </div>
  );
}
