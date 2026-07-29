import { BookOpen, CheckCircle2, Brain, TrendingUp } from 'lucide-react';

interface ProgressTrackerProps {
  totalWords: number;
  quizzesCompleted: number;
  avgScore: number;
}

function StatCard({
  icon,
  label,
  value,
  suffix,
  accent,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  accent: string;
  delay: string;
}) {
  return (
    <div
      className="animate-fade-up relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
      style={{ animationDelay: delay }}
    >
      <div className={`mb-3 grid h-10 w-10 place-items-center rounded-xl ${accent}`}>
        {icon}
      </div>
      <p className="text-3xl font-700 tracking-tight text-slate-900 tabular-nums">
        {value}
        {suffix && <span className="text-lg font-600 text-slate-400">{suffix}</span>}
      </p>
      <p className="mt-0.5 text-sm font-500 text-slate-500">{label}</p>
    </div>
  );
}

export function ProgressTracker({
  totalWords,
  quizzesCompleted,
  avgScore,
}: ProgressTrackerProps) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-slate-400" />
        <h2 className="text-sm font-600 uppercase tracking-wider text-slate-500">
          Your Progress
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          icon={<BookOpen className="h-5 w-5 text-brand-600" />}
          label="Words Learned"
          value={totalWords}
          accent="bg-brand-50"
          delay="0ms"
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5 text-accent-600" />}
          label="Quizzes Completed"
          value={quizzesCompleted}
          accent="bg-accent-50"
          delay="60ms"
        />
        <StatCard
          icon={<Brain className="h-5 w-5 text-brand-600" />}
          label="Avg. Score"
          value={avgScore}
          suffix="/10"
          accent="bg-brand-50"
          delay="120ms"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-accent-600" />}
          label="Practice Streak"
          value={quizzesCompleted}
          accent="bg-accent-50"
          delay="180ms"
        />
      </div>
    </section>
  );
}
