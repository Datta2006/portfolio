import { useReducedMotion } from "framer-motion";

/* A single sparse technical ticker. Pauses on hover and wraps into
   a static index under reduced motion. The skill section carries
   the accessible list, so the moving duplicate is hidden from AT. */
const ITEMS = [
  "C++",
  "PYTHON",
  "TYPESCRIPT",
  "NODE.JS",
  "EXPRESS",
  "MYSQL",
  "REDIS",
  "DOCKER",
  "LINUX",
  "RAG",
  "GEMINI",
  "GPT",
  "GIT",
];

export function TechMarquee() {
  const reduce = useReducedMotion();

  return (
    <div className="marquee">
      <span className="marquee-label mono">STACK / INDEX</span>
      <div className={`marquee-window ${reduce ? "is-static" : ""}`.trim()}>
        <div className="marquee-track" aria-hidden={reduce ? undefined : true}>
          {[...ITEMS, ...ITEMS, ...ITEMS].map((item, index) => (
            <span className="marquee-item" key={`${item}-${index}`}>
              <span className="marquee-bullet" aria-hidden="true" />
              {item}
            </span>
          ))}
        </div>
      </div>
      <span className="marquee-tail mono" aria-hidden="true">
        EXEC / 2026
      </span>
    </div>
  );
}
