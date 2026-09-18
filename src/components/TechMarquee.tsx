import { useReducedMotion } from "framer-motion";

/* One marquee for the whole page. Two rows, opposite directions,
   pause on hover. Purpose: breadth signal without a spec sheet.
   Pure CSS animation, static under reduced motion. */
export function TechMarquee() {
  const reduce = useReducedMotion();
  if (reduce) {
    return (
      <div className="marquee marquee-static">
        <div className="marquee-row">
          {ALL_ITEMS.map((item) => (
            <span key={item} className="marquee-item">{item}</span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="marquee" aria-hidden="true">
      {[A, B].map((items, row) => (
        <div className={`marquee-row marquee-row-${row}`} key={row}>
          {[...items, ...items, ...items].map((item, i) => (
            <span key={`${item}-${i}`} className="marquee-item">
              {item}
              <span className="marquee-dot" />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

const A = ["React", "TypeScript", "Node.js", "Redis", "MySQL", "Socket.IO"];
const B = ["Docker", "Python", "Express", "RAG", "Gemini", "GPT"];
const ALL_ITEMS = [...A, ...B];
