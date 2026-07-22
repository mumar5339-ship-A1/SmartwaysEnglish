import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';

interface AddWordFormProps {
  onAdd: (word: string, meaning: string) => Promise<void>;
}

export function AddWordForm({ onAdd }: AddWordFormProps) {
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = word.trim().length > 0 && meaning.trim().length > 0 && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await onAdd(word.trim(), meaning.trim());
      setWord('');
      setMeaning('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the word.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="animate-fade-up rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600">
          <Plus className="h-4 w-4" strokeWidth={2.5} />
        </div>
        <h2 className="font-display text-lg font-600 text-slate-900">Add a New Word</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="word-input" className="mb-1.5 block text-sm font-600 text-slate-700">
            Word
          </label>
          <input
            id="word-input"
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="e.g. perseverance"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-100"
            disabled={submitting}
            maxLength={80}
          />
        </div>

        <div>
          <label htmlFor="meaning-input" className="mb-1.5 block text-sm font-600 text-slate-700">
            Meaning
          </label>
          <textarea
            id="meaning-input"
            value={meaning}
            onChange={(e) => setMeaning(e.target.value)}
            placeholder="e.g. persistence in doing something despite difficulty or delay in achieving success."
            rows={3}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-100"
            disabled={submitting}
            maxLength={300}
          />
        </div>

        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-500 text-rose-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 px-4 py-3 text-sm font-600 text-white shadow-lg shadow-brand-500/25 transition-all hover:shadow-xl hover:shadow-brand-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
          )}
          {submitting ? 'Saving…' : 'Save Word'}
        </button>
      </form>
    </div>
  );
}
