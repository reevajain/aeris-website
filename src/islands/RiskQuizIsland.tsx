import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type Option = {
  label: string;
  score: 0 | 1 | 2;
};

type Question = {
  id: string;
  category: string;
  prompt: string;
  options: Option[];
};

const QUESTIONS: Question[] = [
  {
    id: 'cooking-fuel',
    category: 'Home cooking',
    prompt: 'What do you mostly cook with at home?',
    options: [
      { label: 'Electric or induction stove', score: 0 },
      { label: 'Gas stove', score: 1 },
      { label: 'Wood, coal or an open flame', score: 2 },
    ],
  },
  {
    id: 'ventilation',
    category: 'Home cooking',
    prompt: 'While cooking, is a window open or an exhaust fan running?',
    options: [
      { label: 'Almost always', score: 0 },
      { label: 'Sometimes', score: 1 },
      { label: 'Rarely or never', score: 2 },
    ],
  },
  {
    id: 'occupational',
    category: 'Work exposure',
    prompt: "Does your (or a family member's) work involve regular dust, smoke, or chemical fumes?",
    options: [
      { label: 'No, not really', score: 0 },
      { label: 'Occasionally', score: 1 },
      { label: 'Yes, regularly', score: 2 },
    ],
  },
  {
    id: 'secondhand',
    category: 'Secondhand smoke',
    prompt: 'Does anyone smoke inside your home or car?',
    options: [
      { label: 'No one', score: 0 },
      { label: 'Occasionally, outdoors', score: 1 },
      { label: 'Yes, indoors regularly', score: 2 },
    ],
  },
  {
    id: 'family-history',
    category: 'Family history',
    prompt: 'Has anyone in your immediate family had lung cancer or a chronic lung condition?',
    options: [
      { label: 'Not that I know of', score: 0 },
      { label: 'One relative', score: 1 },
      { label: 'More than one relative', score: 2 },
    ],
  },
  {
    id: 'outdoor-air',
    category: 'Outdoor air',
    prompt: 'How would you describe outdoor air quality where you live?',
    options: [
      { label: 'Generally clean', score: 0 },
      { label: 'Moderate, some hazy days', score: 1 },
      { label: 'Frequently poor or smoggy', score: 2 },
    ],
  },
  {
    id: 'commute',
    category: 'Daily exposure',
    prompt: 'How do you usually get around day to day?',
    options: [
      { label: 'Mostly indoors or low-traffic routes', score: 0 },
      { label: 'Mixed — some traffic, some transit', score: 1 },
      { label: 'Heavy traffic on foot, bike, or two-wheeler', score: 2 },
    ],
  },
];

const MAX_SCORE = QUESTIONS.length * 2;

type Tier = {
  key: 'low' | 'mid' | 'high';
  title: string;
  message: string;
  chip: string;
  ring: string;
  bg: string;
};

function getTier(score: number): Tier {
  const pct = score / MAX_SCORE;
  if (pct <= 0.34) {
    return {
      key: 'low',
      title: 'Low Awareness Needed',
      message:
        "Nice — your everyday exposure looks fairly low right now. Keep the habits that are working, and it's still worth checking in on air quality and ventilation now and then.",
      chip: 'Steady as you go',
      ring: 'from-leaf to-grass',
      bg: 'bg-leaf/20',
    };
  }
  if (pct <= 0.68) {
    return {
      key: 'mid',
      title: 'Worth a Conversation',
      message:
        "A few everyday exposures showed up in your answers. That doesn't mean anything is wrong — it just means this could be a good thing to casually bring up with your family or a doctor.",
      chip: 'Bring it up at dinner',
      ring: 'from-dustyRose to-sky',
      bg: 'bg-dustyRose/25',
    };
  }
  return {
    key: 'high',
    title: 'Consider Talking to a Doctor',
    message:
      'Several invisible risk factors showed up together in your answers. That\'s useful information, not a diagnosis — a good next step is a relaxed, honest conversation with a doctor about screening.',
    chip: "Don't wait to ask",
    ring: 'from-cacao to-jungle',
    bg: 'bg-cacao/15',
  };
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

export default function RiskQuizIsland() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Array<number | null>>(
    Array(QUESTIONS.length).fill(null)
  );
  const [direction, setDirection] = useState(1);
  const [showResult, setShowResult] = useState(false);
  const [shareState, setShareState] = useState<'idle' | 'copied' | 'shared'>('idle');

  const total = useMemo(
    () => answers.reduce((sum: number, v) => sum + (v ?? 0), 0),
    [answers]
  );
  const tier = useMemo(() => getTier(total), [total]);
  const progress = showResult
    ? 100
    : Math.round((index / QUESTIONS.length) * 100);

  function selectOption(score: number) {
    const next = [...answers];
    next[index] = score;
    setAnswers(next);

    window.setTimeout(() => {
      if (index < QUESTIONS.length - 1) {
        setDirection(1);
        setIndex(index + 1);
      } else {
        setShowResult(true);
      }
    }, 220);
  }

  function goBack() {
    if (index === 0) return;
    setDirection(-1);
    setIndex(index - 1);
  }

  function retake() {
    setAnswers(Array(QUESTIONS.length).fill(null));
    setIndex(0);
    setDirection(-1);
    setShowResult(false);
    setShareState('idle');
  }

  async function shareResult() {
    const text = `I checked my everyday lung-health risk with AERIS's Invisible Risk Translator: "${tier.title}." Try it yourself:`;
    const url = typeof window !== 'undefined' ? window.location.href : '';

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'AERIS Invisible Risk Translator', text, url });
        setShareState('shared');
        return;
      } catch {
        // user cancelled or share failed — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setShareState('copied');
      window.setTimeout(() => setShareState('idle'), 2200);
    } catch {
      setShareState('idle');
    }
  }

  const question = QUESTIONS[index];

  return (
    <div className="mx-auto w-full max-w-2xl rounded-[2.25rem] bg-white/70 p-6 shadow-soft backdrop-blur-sm sm:p-10">
      {/* progress */}
      <div className="mb-8 flex items-center gap-4">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-cacao/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-dustyRose to-cacao"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
        </div>
        <span className="whitespace-nowrap text-xs font-bold uppercase tracking-widest text-cacao/50">
          {showResult ? 'Result' : `${index + 1} / ${QUESTIONS.length}`}
        </span>
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        {!showResult ? (
          <motion.div
            key={question.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <span className="eyebrow">{question.category}</span>
            <h3 className="mt-3 text-xl font-bold text-cacao sm:text-2xl">
              {question.prompt}
            </h3>

            <div className="mt-6 flex flex-col gap-3">
              {question.options.map((option) => {
                const selected = answers[index] === option.score;
                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => selectOption(option.score)}
                    className={`flex items-center justify-between rounded-2xl border-2 px-5 py-4 text-left text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:border-cacao/40 hover:bg-peony/60 sm:text-base ${
                      selected
                        ? 'border-cacao bg-peony/70 text-cacao'
                        : 'border-cacao/10 bg-white/60 text-cacao/85'
                    }`}
                  >
                    {option.label}
                    <span
                      className={`ml-3 flex h-5 w-5 flex-none items-center justify-center rounded-full border-2 ${
                        selected ? 'border-cacao bg-cacao' : 'border-cacao/25'
                      }`}
                    >
                      {selected && (
                        <svg viewBox="0 0 24 24" className="h-3 w-3 text-peony" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12l5 5L20 7" />
                        </svg>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={goBack}
                disabled={index === 0}
                className="text-sm font-bold text-cacao/50 transition-colors hover:text-cacao disabled:cursor-not-allowed disabled:opacity-0"
              >
                &larr; Back
              </button>
              <p className="text-xs text-cacao/40">Pick the option closest to your everyday life.</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 140, damping: 18 }}
          >
            <div className={`inline-flex items-center gap-2 rounded-full ${tier.bg} px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-cacao`}>
              {tier.chip}
            </div>

            <h3 className="mt-4 text-2xl font-bold text-cacao sm:text-3xl">{tier.title}</h3>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-cacao/75 sm:text-base">
              {tier.message}
            </p>

            <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-cacao/10">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${tier.ring}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.round((total / MAX_SCORE) * 100)}%` }}
                transition={{ duration: 0.9, ease: 'easeOut', delay: 0.15 }}
              />
            </div>

            <p className="mt-6 rounded-2xl bg-peony/60 px-4 py-3 text-xs text-cacao/60 sm:text-sm">
              This is a friendly conversation-starter, not a diagnosis or medical
              advice. Only a licensed doctor can assess your personal risk.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button type="button" onClick={shareResult} className="pill-btn bg-cacao text-peony">
                {shareState === 'copied' ? 'Link copied!' : shareState === 'shared' ? 'Shared!' : 'Share your result'}
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="2.6" />
                  <circle cx="6" cy="12" r="2.6" />
                  <circle cx="18" cy="19" r="2.6" />
                  <path d="M8.3 10.7l7.4-4.4M8.3 13.3l7.4 4.4" />
                </svg>
              </button>
              <button type="button" onClick={retake} className="pill-btn bg-white/70 text-cacao hover:bg-white">
                Retake quiz
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
