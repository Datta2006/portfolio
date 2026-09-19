import { useRef, type MouseEvent } from "react";
import {
  Atom,
  Plugs,
  Database,
  Cube,
  Robot,
  Crosshair,
  Code,
  Cpu,
  type Icon,
} from "@phosphor-icons/react";
import { Reveal } from "./motion-primitives";
import { skills, type SkillGroup } from "../data";

const ICONS: Record<SkillGroup["icon"], Icon> = {
  atom: Atom,
  plugs: Plugs,
  database: Database,
  cube: Cube,
  robot: Robot,
  crosshair: Crosshair,
  code: Code,
  cpu: Cpu,
};

/* ------------------------------------------------------------
   Skills: asymmetric bento with spotlight cards. Purpose:
   state indication - the lit border shows where the cursor is.
   Motion values drive CSS vars directly; zero React re-renders.
   ------------------------------------------------------------ */
export function Skills() {
  return (
    <section className="section section-line skills" id="skills">
      <div className="container">
        <Reveal>
          <p className="mono-label">Stack</p>
          <h2 className="display-lg skills-title">What I work with</h2>
        </Reveal>

        <div className="bento">
          {skills.map((group, i) => (
            <Reveal key={group.label} delay={0.05 * i} className={group.span === 2 ? "bento-span-2" : ""}>
              <SpotlightCard group={group} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function SpotlightCard({ group }: { group: SkillGroup }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  const Icon = ICONS[group.icon];

  return (
    <div className="spotlight" ref={ref} onMouseMove={onMove}>
      <div className="spotlight-card">
        <span className="spotlight-icon">
          <Icon size={22} weight="regular" />
        </span>
        <h3 className="spotlight-title">{group.label}</h3>
        <p className="spotlight-items">{group.items.join(" / ")}</p>
      </div>
    </div>
  );
}
