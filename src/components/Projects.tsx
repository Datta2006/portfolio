import { ArrowUpRight } from "@phosphor-icons/react";
import { Reveal } from "./motion-primitives";
import { SectionHeader } from "./SectionHeader";
import { projects } from "../data";

/* ------------------------------------------------------------
   Projects: an editorial project index instead of a horizontal
   turntable. Wide asymmetric rows, oversized outlined numerals,
   compact technical metadata and a sticky index rail. The first
   entry is featured at a larger scale. Every entry and source
   link stays visible and keyboard accessible without motion.
   ------------------------------------------------------------ */
export function Projects() {
  return (
    <section className="section projects" id="projects">
      <div className="shell">
        <SectionHeader
          index="01"
          label="SELECTED WORK"
          meta="03 PROJECTS / SOURCE ON GITHUB"
        >
          SELECTED
          <br />
          <span className="outline">WORK</span>
        </SectionHeader>

        <div className="projects-layout">
          <aside className="projects-rail">
            <span className="mono rail-label">INDEX</span>
            <span className="rail-count">03</span>
            <span className="mono rail-label">ENTRIES</span>
            <span className="rail-line" aria-hidden="true" />
            <span className="mono rail-note">SCROLL ↓</span>
            <span className="rail-orbit" aria-hidden="true">
              <span />
            </span>
          </aside>

          <div className="project-index">
            {projects.map((project, index) => (
              <Reveal key={project.title} delay={0.04 * index}>
                <article
                  className={`project-row ${index === 0 ? "is-featured" : ""}`.trim()}
                >
                  <div className="project-index-cell">
                    <span className="project-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="mono project-index-note">
                      / {String(projects.length).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="project-body">
                    <span className="mono project-kicker">
                      PROJECT_{String(index + 1).padStart(3, "0")} — {project.tags.length} TECHNOLOGIES
                    </span>
                    <h3 className="project-name">{project.title}</h3>
                    <p className="project-desc">{project.description}</p>
                  </div>

                  <div className="project-side">
                    <span className="mono project-side-label">STACK</span>
                    <ul className="project-tags">
                      {project.tags.map((tag) => (
                        <li key={tag} className="tag">
                          {tag}
                        </li>
                      ))}
                    </ul>
                    <a
                      href={project.repo}
                      target="_blank"
                      rel="noreferrer"
                      className="project-source"
                      aria-label={`View source for ${project.title} on GitHub`}
                    >
                      VIEW SOURCE
                      <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
                    </a>
                  </div>

                  <span className="project-corner" aria-hidden="true" />
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
