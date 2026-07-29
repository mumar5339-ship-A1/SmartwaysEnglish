import { GraduationCap, Sparkles } from 'lucide-react';

export function Header({ onPractice }: { onPractice: () => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-600 text-white shadow-lg shadow-brand-500/25">
            <GraduationCap className="h-5 w-5" strokeWidth={2.2} />
          </div>
          <div className="leading-tight">
            <p className="font-display text-lg font-600 tracking-tight text-slate-900">
              Smartways
            </p>
            <p className="text-[11px] font-500 uppercase tracking-[0.18em] text-accent-600">
              English Learning Center
            </p>
          </div>
        </div>

        <button
          onClick={onPractice}
          className="group hidden items-center gap-2 rounded-xl bg-accent-600 px-4 py-2.5 text-sm font-600 text-white shadow-sm transition-all hover:bg-accent-700 hover:shadow-md active:scale-[0.97] sm:flex"
        >
          <Sparkles className="h-4 w-4 text-accent-200 transition-transform group-hover:rotate-12" />
          Practice with AI
        </button>
      </div>
    </header>
  );
}
