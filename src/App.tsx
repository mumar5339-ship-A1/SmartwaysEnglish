import { useCallback, useEffect, useMemo, useState } from 'react';
import { Sparkles, BookOpen, Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Word, QuizResult } from '@/types';
import { Header } from '@/components/Header';
import { ProgressTracker } from '@/components/ProgressTracker';
import { AddWordForm } from '@/components/AddWordForm';
import { WordList } from '@/components/WordList';
import { Quiz } from '@/components/Quiz';

export default function App() {
  const [words, setWords] = useState<Word[]>([]);
  const [quizzes, setQuizzes] = useState<QuizResult[]>([]);
  const [loadingWords, setLoadingWords] = useState(true);
  const [quizOpen, setQuizOpen] = useState(false);

  const loadWords = useCallback(async () => {
    setLoadingWords(true);
    const { data, error } = await supabase
      .from('words')
      .select('id, word, meaning, created_at')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Failed to load words:', error.message);
    }
    setWords(data ?? []);
    setLoadingWords(false);
  }, []);

  const loadQuizzes = useCallback(async () => {
    const { data, error } = await supabase
      .from('quiz_results')
      .select('id, score, total, created_at')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Failed to load quizzes:', error.message);
    }
    setQuizzes(data ?? []);
  }, []);

  useEffect(() => {
    loadWords();
    loadQuizzes();
  }, [loadWords, loadQuizzes]);

  const addWord = useCallback(async (word: string, meaning: string) => {
    const { data, error } = await supabase
      .from('words')
      .insert({ word, meaning })
      .select('id, word, meaning, created_at')
      .single();
    if (error) throw new Error(error.message);
    if (data) setWords((prev) => [data as Word, ...prev]);
  }, []);

  const deleteWord = useCallback(async (id: string) => {
    const { error } = await supabase.from('words').delete().eq('id', id);
    if (error) throw new Error(error.message);
    setWords((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const recordQuiz = useCallback(async (score: number, total: number) => {
    const { data, error } = await supabase
      .from('quiz_results')
      .insert({ score, total })
      .select('id, score, total, created_at')
      .single();
    if (error) {
      console.error('Failed to record quiz:', error.message);
      return;
    }
    if (data) setQuizzes((prev) => [data as QuizResult, ...prev]);
  }, []);

  const avgScore = useMemo(() => {
    if (quizzes.length === 0) return 0;
    const sum = quizzes.reduce((acc, q) => acc + q.score, 0);
    return Math.round((sum / quizzes.length) * 10) / 10;
  }, [quizzes]);

  const openQuiz = useCallback(() => setQuizOpen(true), []);
  const closeQuiz = useCallback(() => setQuizOpen(false), []);

  return (
    <div className="min-h-screen bg-grid">
      <Header onPractice={openQuiz} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200/70">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-accent-200/30 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-600 text-brand-700">
              <Sparkles className="h-3 w-3" />
              AI-Powered Practice
            </span>
            <h1 className="mt-4 font-display text-3xl font-700 leading-tight tracking-tight text-slate-900 text-balance sm:text-4xl">
              Grow your English vocabulary, one word at a time.
            </h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-600">
              Save new words you learn in class, then practice them with a short AI-generated quiz.
              Get instant feedback so you keep improving between lessons.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={openQuiz}
                className="group flex items-center gap-2 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 px-5 py-3 text-sm font-600 text-white shadow-lg shadow-brand-500/25 transition-all hover:shadow-xl hover:shadow-brand-500/30 active:scale-[0.98]"
              >
                <Sparkles className="h-4 w-4 transition-transform group-hover:rotate-12" />
                Practice with AI
              </button>
              <a
                href="#add-word"
                className="flex items-center gap-2 rounded-xl border border-accent-200 bg-white px-5 py-3 text-sm font-600 text-accent-700 shadow-sm transition-all hover:border-accent-300 hover:bg-accent-50 active:scale-[0.98]"
              >
                <BookOpen className="h-4 w-4 text-accent-600" />
                Add a Word
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <main className="mx-auto max-w-6xl space-y-8 px-5 py-8 sm:px-6 sm:py-10">
        <ProgressTracker
          totalWords={words.length}
          quizzesCompleted={quizzes.length}
          avgScore={avgScore}
        />

        <div className="grid gap-6 lg:grid-cols-5">
          <div id="add-word" className="lg:col-span-2">
            <AddWordForm onAdd={addWord} />
          </div>
          <div className="lg:col-span-3">
            <WordList
              words={words}
              loading={loadingWords}
              onDelete={deleteWord}
              onPractice={openQuiz}
            />
          </div>
        </div>

        <footer className="flex flex-col items-center gap-1 border-t border-slate-200 pt-8 pb-2 text-center">
          <p className="flex items-center gap-1.5 text-sm font-500 text-slate-500">
            Smartways English Learning Center
            <Heart className="h-3.5 w-3.5 fill-rose-400 text-rose-400" />
          </p>
          <p className="text-xs text-slate-400">Practice makes progress. Keep going!</p>
        </footer>
      </main>

      <Quiz
        words={words}
        open={quizOpen}
        onClose={closeQuiz}
        onQuizCompleted={recordQuiz}
      />
    </div>
  );
}
