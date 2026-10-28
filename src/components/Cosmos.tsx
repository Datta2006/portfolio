import { useMemo } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/* ------------------------------------------------------------
   Cosmos: the fixed star field behind the entire publication.
   Static SVG stars, two parallax layers driven by motion values,
   and two very soft atmospheric glows. No canvas, no WebGL, no
   per-frame React work. Under reduced motion the layers are still.
   ------------------------------------------------------------ */

const W = 1600;
const H = 1000;

type Star = {
  x: number;
  y: number;
  r: number;
  o: number;
  accent: boolean;
  pulse: boolean;
};

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildStars(seed: number, count: number, allowAccent: boolean): Star[] {
  const rand = mulberry32(seed);
  return Array.from({ length: count }, () => {
    const accent = allowAccent && rand() > 0.86;
    return {
      x: rand() * W,
      y: rand() * H,
      r: accent ? 1.5 + rand() * 1.2 : 0.5 + rand() * 1.1,
      o: accent ? 0.5 + rand() * 0.35 : 0.14 + rand() * 0.52,
      accent,
      pulse: rand() > 0.82,
    };
  });
}

export function Cosmos() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const yFar = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const yNear = useTransform(scrollYProgress, [0, 1], [0, -48]);
  const far = useMemo(() => buildStars(1907, 110, false), []);
  const near = useMemo(() => buildStars(4201, 22, true), []);

  return (
    <div className="cosmos" aria-hidden="true">
      <motion.svg
        className="cosmos-field cosmos-field-far"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        style={reduce ? undefined : { y: yFar }}
      >
        {far.map((star, i) => (
          <circle
            key={`f-${i}`}
            cx={star.x}
            cy={star.y}
            r={star.r}
            fill="#f0f0ea"
            opacity={star.o}
          />
        ))}
      </motion.svg>

      <motion.svg
        className="cosmos-field cosmos-field-near"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        style={reduce ? undefined : { y: yNear }}
      >
        {near.map((star, i) => (
          <circle
            key={`n-${i}`}
            className={star.pulse && !reduce ? "cosmos-star-pulse" : undefined}
            style={
              star.pulse && !reduce
                ? { animationDelay: `${(i % 7) * 1.3}s` }
                : undefined
            }
            cx={star.x}
            cy={star.y}
            r={star.r}
            fill={star.accent ? "#c5ff45" : "#f0f0ea"}
            opacity={star.o}
          />
        ))}
      </motion.svg>

      <div className="cosmos-glow cosmos-glow-a" />
      <div className="cosmos-glow cosmos-glow-b" />
      <div className="cosmos-orbit" />
    </div>
  );
}
