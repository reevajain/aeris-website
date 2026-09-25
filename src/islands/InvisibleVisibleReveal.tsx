import { useEffect, useRef, useState } from 'react';
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';

const HINT_RADIUS = 80;

/**
 * A cursor-following circular "mask" that wipes away a hazy, muted scene
 * of hidden lung-health risks to reveal a vivid, hopeful scene underneath.
 * The interaction itself is the metaphor: invisible risks becoming visible.
 */
export default function InvisibleVisibleReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const radius = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 200, damping: 24, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 200, damping: 24, mass: 0.4 });
  const springRadius = useSpring(radius, { stiffness: 140, damping: 20 });

  const maskImage = useMotionTemplate`radial-gradient(circle ${springRadius}px at ${springX}px ${springY}px, black 55%, transparent 100%)`;

  // a glowing "lens" ring that traces the exact edge of the reveal mask
  const ringSize = useTransform(springRadius, (r) => r * 2 * 1.08);
  const ringLeft = useMotionTemplate`${springX}px`;
  const ringTop = useMotionTemplate`${springY}px`;
  const ringOpacity = useTransform(springRadius, [0, 12, HINT_RADIUS], [0, 0.9, 0.9]);

  useEffect(() => {
    if (hasInteracted) return;
    const el = containerRef.current;
    if (!el) return;

    x.set(el.offsetWidth * 0.5);
    y.set(el.offsetHeight * 0.38);

    const controls = animate(radius, [0, HINT_RADIUS, 0], {
      duration: 2.8,
      times: [0, 0.5, 1],
      repeat: Infinity,
      repeatDelay: 1.2,
      ease: 'easeInOut',
    });

    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasInteracted]);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left);
    y.set(event.clientY - rect.top);
  };

  const activate = () => {
    setHasInteracted(true);
    setIsActive(true);
    const el = containerRef.current;
    const maxDim = el ? Math.max(el.offsetWidth, el.offsetHeight) : 420;
    animate(radius, maxDim * 0.8, {
      type: 'spring',
      stiffness: 90,
      damping: 16,
    });
  };

  const deactivate = () => {
    setIsActive(false);
    animate(radius, 0, { type: 'spring', stiffness: 130, damping: 22 });
  };

  return (
    <div
      ref={containerRef}
      onPointerEnter={activate}
      onPointerMove={handlePointerMove}
      onPointerDown={activate}
      onPointerLeave={deactivate}
      className="group relative aspect-[4/5] w-full max-w-md touch-none select-none overflow-hidden rounded-[2.5rem] shadow-soft sm:aspect-square"
    >
      {/* Back layer: hazy, muted "invisible risk" scene */}
      <div className="absolute inset-0 bg-gradient-to-br from-lavender/80 via-sky/55 to-lavender/90 saturate-[0.55]">
        <div className="absolute inset-0 animate-pulse-soft bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.5),transparent_55%)]" aria-hidden="true" />
        <svg className="absolute inset-0 h-full w-full opacity-40" viewBox="0 0 400 400" aria-hidden="true">
          <path d="M40 320c40-30 30-70 10-100" stroke="#6B403B" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
          <path d="M70 300c30-25 25-60 5-85" stroke="#6B403B" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.35" />
          <path d="M300 90c25 20 15 50-5 65" stroke="#6B403B" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.4" />
        </svg>

        <div className="absolute left-[12%] top-[18%] flex flex-col items-center gap-1 text-cacao/45">
          <svg viewBox="0 0 64 64" className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 30 30 13l22 17" />
            <path d="M14 27v24h32V27" />
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-widest">home fumes</span>
        </div>

        <div className="absolute right-[14%] top-[12%] flex flex-col items-center gap-1 text-cacao/40">
          <svg viewBox="0 0 64 64" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="14" y="26" width="30" height="24" rx="2" />
            <path d="M22 26v-8h6v8M34 26v-14h6v14" />
            <path d="M25 12c2-3 0-5 2-8M41 6c2 3 0 5 2 8" strokeWidth="1.8" opacity="0.7" />
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-widest">workplace air</span>
        </div>

        <div className="absolute bottom-[24%] left-[20%] flex flex-col items-center gap-1 text-cacao/40">
          <svg viewBox="0 0 64 64" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 44h30v6H12z" />
            <path d="M42 44c4-4 8-4 10-10M42 44c6-1 10-6 9-13" strokeWidth="1.8" opacity="0.7" />
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-widest">secondhand smoke</span>
        </div>

        <div className="absolute right-[16%] bottom-[16%] text-4xl font-display font-bold text-cacao/25" aria-hidden="true">
          ?
        </div>

        <div
          className={`absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.2em] text-cacao/55 transition-opacity duration-300 ${
            isActive ? 'opacity-0' : 'opacity-100'
          }`}
        >
          hover or tap to reveal
        </div>
      </div>

      {/* Front layer: vivid, hopeful "now visible" scene — revealed via cursor mask */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-peony via-dustyRose/80 to-leaf/70 saturate-125"
        style={{
          WebkitMaskImage: maskImage,
          maskImage: maskImage,
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
        }}
      >
        <div className="absolute left-[10%] top-[16%] flex flex-col items-center gap-1 text-cacao">
          <svg viewBox="0 0 64 64" className="h-14 w-14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M32 8v20" />
            <path d="M32 28c-2-6-8-9-13-8-6 1-9 7-8 14 1 8 5 16 10 18 4 1.5 7-1 7-5V28Z" fill="#8D8B4C" fillOpacity="0.25" />
            <path d="M32 28c2-6 8-9 13-8 6 1 9 7 8 14 1 8-5 16-10 18-4 1.5-7-1-7-5V28Z" fill="#8D8B4C" fillOpacity="0.25" />
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-widest">breathe easy</span>
        </div>

        <div className="absolute right-[10%] top-[14%] flex flex-col items-center gap-1 text-cacao">
          <svg viewBox="0 0 64 64" className="h-11 w-11" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="20" cy="16" r="6" fill="#D8A4AF" fillOpacity="0.4" />
            <path d="M8 40c0-8 6-13 12-13s12 5 12 13" />
            <circle cx="44" cy="20" r="5" fill="#D8A4AF" fillOpacity="0.4" />
            <path d="M34 42c0-7 5-11 10-11s10 4 10 11" />
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-widest">talk it through</span>
        </div>

        <div className="absolute bottom-[22%] left-[16%] flex flex-col items-center gap-1 text-cacao">
          <svg viewBox="0 0 64 64" className="h-11 w-11" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M32 54V28" />
            <path d="M32 30c-2-10-10-14-20-13 0 11 8 18 20 15Z" fill="#C1BC77" fillOpacity="0.35" />
            <path d="M32 24c2-9 9-13 18-12 0 10-7 16-18 14Z" fill="#C1BC77" fillOpacity="0.35" />
            <path d="M20 54h24" />
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-widest">clean air, small steps</span>
        </div>

        <div className="absolute bottom-[18%] right-[12%] text-3xl" aria-hidden="true">
          ✓
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.2em] text-cacao/70">
          now you see it
        </div>
      </motion.div>

      {/* Glowing lens ring that traces the live edge of the reveal circle */}
      <motion.div
        className="pointer-events-none absolute rounded-full border-2 border-peony/90 shadow-[0_0_30px_8px_rgba(247,221,213,0.45)]"
        style={{
          width: ringSize,
          height: ringSize,
          left: ringLeft,
          top: ringTop,
          x: '-50%',
          y: '-50%',
          opacity: ringOpacity,
        }}
        aria-hidden="true"
      />

      <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] ring-1 ring-inset ring-cacao/10" />
    </div>
  );
}
