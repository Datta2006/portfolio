import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "@phosphor-icons/react";
import { Reveal } from "./motion-primitives";
import { projects, type Project } from "../data";

/* ------------------------------------------------------------
   Projects: sticky stacking cards. Purpose: storytelling - each
   project arrives, pins, and the next slides over it. Scroll-driven
   via useScroll + transforms (no scroll listeners). Under reduced
   motion: plain stacked cards, no pinning.
   ------------------------------------------------------------ */
export function Projects() {
  const reduce = useReducedMotion();
  return (
    <section className="section projects" id="projects">
      <div className="container">
        <Reveal>
          <p className="mono-label">Selected work</p>
          <h2 className="display-lg projects-title">Things I have built</h2>
        </Reveal>
      </div>
      {reduce ? (
        <div className="container projects-static">
          {projects.map((p) => (
            <ProjectCard key={p.title} project={p} index={projects.indexOf(p)} />
          ))}
        </div>
      ) : (
        <StickyStack />
      )}
    </section>
  );
}

function StickyStack() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <div className="projects-stack" ref={containerRef}>
      {projects.map((project, i) => (
        <StackCard
          key={project.title}
          project={project}
          index={i}
          total={projects.length}
          progress={scrollYProgress}
        />
      ))}
    </div>
  );
}

function StackCard({
  project,
  index,
  total,
  progress,
}: {
  project: Project;
  index: number;
  total: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isLast = index === total - 1;

  // This card shrinks/dims as the next card scrolls in over it.
  const scale = useTransform(progress, [index / total, (index + 1) / total], [1, 0.92]);
  const opacity = useTransform(progress, [index / total, (index + 1) / total], [1, 0.4]);

  return (
    <div className="stack-card" ref={ref}>
      <motion.div
        className="project-card"
        style={isLast ? undefined : { scale, opacity }}
        data-accent={index % 2 === 0 ? "emerald" : "sage"}
        data-tint={index}
      >
        <div className="project-card-inner">
          <div className="project-head">
            <span className="project-index mono-label">
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
            <div className="project-links">
              <a href={project.repo} target="_blank" rel="noreferrer" className="project-link">
                Code <ArrowUpRight size={14} weight="bold" />
              </a>
              {project.demo && (
                <a href={project.demo} target="_blank" rel="noreferrer" className="project-link">
                  Demo <ArrowUpRight size={14} weight="bold" />
                </a>
              )}
            </div>
          </div>
          <h3 className="project-title display-md">{project.title}</h3>
          <p className="project-desc">{project.description}</p>
          <div className="project-tags">
            {project.tags.map((t) => (
              <span key={t} className="chip">{t}</span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <div className="project-card project-card-static" data-tint={index}>
      <div className="project-card-inner">
        <div className="project-head">
          <span className="project-index mono-label">{String(index + 1).padStart(2, "0")}</span>
          <div className="project-links">
            <a href={project.repo} target="_blank" rel="noreferrer" className="project-link">
              Code <ArrowUpRight size={14} weight="bold" />
            </a>
          </div>
          </div>
        <h3 className="project-title display-md">{project.title}</h3>
        <p className="project-desc">{project.description}</p>
        <div className="project-tags">
          {projects && project.tags.map((t) => <span key={t} className="chip">{t}</span>)}
        </div>
      </div>
    </div>
  );
}
