import { GraduationCap, BookOpen, Languages, Lightbulb, PenLine } from 'lucide-react';

interface FloatingCard {
  icon: React.ReactNode;
  word: string;
  meaning: string;
  className: string;
  iconBg: string;
  iconColor: string;
  delay: string;
}

const cards: FloatingCard[] = [
  {
    icon: <GraduationCap className="h-4 w-4" strokeWidth={2.2} />,
    word: 'perseverance',
    meaning: 'persistence in a course of action',
    className: 'top-0 right-0',
    iconBg: 'bg-brand-100',
    iconColor: 'text-brand-600',
    delay: '0s',
  },
  {
    icon: <Languages className="h-4 w-4" strokeWidth={2.2} />,
    word: 'eloquent',
    meaning: 'fluent and persuasive in speech',
    className: 'top-32 right-44',
    iconBg: 'bg-accent-100',
    iconColor: 'text-accent-600',
    delay: '0.8s',
  },
  {
    icon: <Lightbulb className="h-4 w-4" strokeWidth={2.2} />,
    word: 'diligent',
    meaning: 'showing care and effort',
    className: 'top-64 right-8',
    iconBg: 'bg-brand-100',
    iconColor: 'text-brand-600',
    delay: '1.6s',
  },
];

export function HeroIllustration() {
  return (
    <div className="pointer-events-none absolute inset-0 right-0 hidden lg:block">
      {/* Large gradient orb behind illustration */}
      <div className="absolute right-0 top-1/2 h-80 w-80 -translate-y-1/2 translate-x-20 rounded-full bg-gradient-to-br from-brand-200/40 to-accent-200/30 blur-3xl" />

      {/* Large book icon */}
      <div className="absolute right-20 top-16 animate-float-slow opacity-[0.07]">
        <BookOpen className="h-56 w-56 text-brand-600" strokeWidth={1} />
      </div>

      {/* Floating vocabulary cards */}
      {cards.map((card, i) => (
        <div
          key={i}
          className={`absolute ${card.className} animate-float rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-lg backdrop-blur-sm sm:p-3.5`}
          style={{ animationDelay: card.delay, width: '200px' }}
        >
          <div className="flex items-start gap-2.5">
            <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${card.iconBg} ${card.iconColor}`}>
              {card.icon}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-600 text-slate-900">{card.word}</p>
              <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-slate-500">{card.meaning}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Small floating icon badges */}
      <div
        className="absolute right-56 top-40 animate-float rounded-xl border border-accent-200/60 bg-white/90 p-2 shadow-md backdrop-blur-sm"
        style={{ animationDelay: '0.4s' }}
      >
        <PenLine className="h-5 w-5 text-accent-500" strokeWidth={2} />
      </div>
      <div
        className="absolute right-12 top-56 animate-float rounded-xl border border-brand-200/60 bg-white/90 p-2 shadow-md backdrop-blur-sm"
        style={{ animationDelay: '1.2s' }}
      >
        <BookOpen className="h-5 w-5 text-brand-500" strokeWidth={2} />
      </div>

      {/* Connecting dots */}
      <svg className="absolute inset-0 h-full w-full" fill="none" preserveAspectRatio="none">
        <circle cx="78%" cy="18%" r="3" fill="#3EB489" opacity="0.25" />
        <circle cx="62%" cy="42%" r="2.5" fill="#2f8eff" opacity="0.2" />
        <circle cx="88%" cy="58%" r="3.5" fill="#3EB489" opacity="0.2" />
        <circle cx="70%" cy="72%" r="2" fill="#2f8eff" opacity="0.15" />
        <circle cx="50%" cy="30%" r="2" fill="#3EB489" opacity="0.15" />
      </svg>
    </div>
  );
}
