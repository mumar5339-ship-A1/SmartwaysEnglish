import { useMemo, useState } from 'react';
import { BookOpen, Trash2, Sparkles, Search, Loader2 } from 'lucide-react';
import type { Word } from '@/types';

interface WordListProps {
  words: Word[];
  loading: boolean;
  onDelete: (id: string) => Promise<void>;
  onPractice: () => void;
}

export function WordList({ words, loading, onDelete, onPractice }: WordListProps) {
  const [query, setQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return words;
    return words.filter(
      (w) => w.word.toLowerCase().includes(q) || w.meaning.toLowerCase().includes(q),
    );
  }, [words, query]);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="animate-fade-up rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-brand-600" />
          <h2 className="font-display text-lg font-600 text-slate-900">My Vocabulary</h2>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-600 text-slate-600 tabular-nums">
            {words.length}
          </span>
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search words…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-100"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 p-12 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading your words…
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          hasWords={words.length > 0}
          query={query}
          onPractice={onPractice}
        />
      ) : (
        <ul className="divide-y divide-slate-100">
          {filtered.map((w, i) => (
            <li
              key={w.id}
              className="group animate-fade-up flex items-start gap-3 p-4 transition-colors hover:bg-slate-50/60 sm:px-6"
              style={{ animationDelay: `${Math.min(i * 40, 300)}ms` }}
            >
              <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-xs font-700 text-brand-600">
                {i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-600 text-slate-900">{w.word}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-slate-500">{w.meaning}</p>
              </div>
              <button
                onClick={() => handleDelete(w.id)}
                disabled={deletingId === w.id}
                className="shrink-0 rounded-lg p-2 text-slate-300 opacity-0 transition-all hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100 disabled:opacity-60"
                aria-label={`Delete ${w.word}`}
              >
                {deletingId === w.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EmptyState({
  hasWords,
  query,
  onPractice,
}: {
  hasWords: boolean;
  query: string;
  onPractice: () => void;
}) {
  if (!hasWords) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
        <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-500">
          <BookOpen className="h-7 w-7" />
        </div>
        <h3 className="font-display text-lg font-600 text-slate-900">No words yet</h3>
        <p className="mt-1 max-w-xs text-sm text-slate-500">
          Add your first vocabulary word using the form on the left to start building your list.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <p className="text-sm text-slate-500">
        No words match “{query}”. Try a different search.
      </p>
      <button
        onClick={onPractice}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-600 text-white transition-colors hover:bg-slate-800"
      >
        <Sparkles className="h-4 w-4 text-brand-300" />
        Practice with AI
      </button>
    </div>
  );
}

