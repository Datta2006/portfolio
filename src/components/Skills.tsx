import { Reveal } from "./motion-primitives";
import { SectionHeader } from "./SectionHeader";
import { skills } from "../data";

/* ------------------------------------------------------------
   Skills: a capability index crossed with a small star map.
   Domains are typography-led rows; the diagram is decorative,
   fixed and cheap (inline SVG). No proficiency levels are shown
   or implied beyond the real grouping in the data.
   ------------------------------------------------------------ */
export function Skills() {
  const entryCount = skills.reduce((total, group) => total + group.items.length, 0);

  return (
    <section className="section skills" id="skills">
      <div className="shell">
        <SectionHeader
          index="03"
          label="CAPABILITY INDEX"
          meta={`${String(skills.length).padStart(2, "0")} DOMAINS / ${entryCount} ENTRIES`}
        >
          TECHNICAL
          <br />
          <span className="outline">CONSTELLATION</span>
        </SectionHeader>

        <div className="skills-layout">
          <figure className="skills-map">
            <svg
              className="constellation"
              viewBox="0 0 400 400"
              role="presentation"
              aria-hidden="true"
            >
              <g className="constellation-lines">
                <line x1="74" y1="86" x2="186" y2="58" />
                <line x1="186" y1="58" x2="292" y2="116" />
                <line x1="292" y1="116" x2="248" y2="212" />
                <line x1="248" y1="212" x2="312" y2="304" />
                <line x1="312" y1="304" x2="166" y2="326" />
                <line x1="166" y1="326" x2="94" y2="236" />
                <line x1="94" y1="236" x2="74" y2="86" />
                <line x1="94" y1="236" x2="248" y2="212" />
              </g>
              <g className="constellation-rings">
                <circle cx="200" cy="200" r="164" />
                <circle cx="200" cy="200" r="108" />
                <ellipse cx="200" cy="200" rx="176" ry="58" transform="rotate(-18 200 200)" />
              </g>
              <g className="constellation-nodes">
                <circle cx="74" cy="86" r="3" />
                <circle cx="186" cy="58" r="4.5" className="is-accent" />
                <circle cx="292" cy="116" r="3" />
                <circle cx="248" cy="212" r="3" />
                <circle cx="312" cy="304" r="4.5" className="is-accent" />
                <circle cx="166" cy="326" r="3" />
                <circle cx="94" cy="236" r="3" />
              </g>
              <g className="constellation-labels">
                <text x="84" y="78">A</text>
                <text x="198" y="50">B</text>
                <text x="302" y="108">C</text>
                <text x="258" y="204">D</text>
                <text x="322" y="296">E</text>
                <text x="176" y="318">F</text>
                <text x="104" y="228">G</text>
              </g>
            </svg>
            <span className="map-tick map-tick-tl" aria-hidden="true" />
            <span className="map-tick map-tick-tr" aria-hidden="true" />
            <span className="map-tick map-tick-bl" aria-hidden="true" />
            <span className="map-tick map-tick-br" aria-hidden="true" />
            <figcaption className="mono map-caption">
              <span>FIG. 02</span>
              <span>CAPABILITY MAP</span>
            </figcaption>
          </figure>

          <div className="skill-list">
            {skills.map((group, index) => (
              <Reveal key={group.label} delay={0.03 * index}>
                <article className="skill-row">
                  <span className="mono skill-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="skill-domain">{group.label}</h3>
                  <ul className="skill-items">
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <span className="skill-marker" aria-hidden="true">
                    <span />
                  </span>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
