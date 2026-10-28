import { Reveal } from "./motion-primitives";
import { SectionHeader } from "./SectionHeader";
import { education } from "../data";

/* Education: a compact credentials index. No cards, no shadows:
   institution and qualification carry the hierarchy, dates and
   metrics sit in the monospace margin. */
export function Education() {
  return (
    <section className="section education" id="education">
      <div className="shell">
        <SectionHeader
          index="04"
          label="CREDENTIALS"
          meta="02 RECORDS / 2021—2027"
        >
          EDUCATION
          <br />
          <span className="outline">RECORD</span>
        </SectionHeader>

        <div className="edu-table">
          {education.map((entry, index) => (
            <Reveal key={entry.school} delay={0.05 * index}>
              <article className="edu-row">
                <span className="mono edu-num">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="edu-main">
                  <h3 className="edu-school">{entry.school}</h3>
                  <p className="edu-degree">{entry.degree}</p>
                </div>
                <span className="edu-metric mono">{entry.metric}</span>
                <span className="mono edu-period">{entry.period}</span>
                <span className="edu-marker" aria-hidden="true">
                  <span />
                </span>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
