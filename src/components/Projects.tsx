import { useLayoutEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { ArrowUpRight } from "@phosphor-icons/react";
import { Reveal } from "./motion-primitives";
import { projects, type Project } from "../data";

/* ------------------------------------------------------------
   Projects: horizontal turntable. Purpose: storytelling - the
   section pins, the track slides sideways with page scroll, and
   each card rotates in Y as it crosses the centre, like a rack
   turning past the viewer. Scroll-linked motion values only
   (no scroll listeners), transform/opacity only.
   Under reduced motion: plain stacked cards, no pinning.
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
          {projects.map((p, i) => (
            <ProjectCard key={p.title} project={p} index={i} />
          ))}
        </div>
      ) : (
        <HorizontalTurntable />
      )}
    </section>
  );
}

function HorizontalTurntable() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState({
    distance: 0,
    viewport: 0,
    centres: [] as number[],
  });

  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(scrollYProgress, [0, 1], [0, -layout.distance]);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () => {
      const viewport = document.documentElement.clientWidth;
      const cards = Array.from(track.children) as HTMLElement[];
      setLayout({
        distance: Math.max(0, track.scrollWidth - viewport),
        viewport,
        centres: cards.map((card) => card.offsetLeft + card.offsetWidth / 2),
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="projects-hscroll"
      ref={scrollRef}
      style={{ height: `calc(100dvh + ${layout.distance}px)` }}
    >
      <div className="projects-pin">
        <motion.div className="projects-track" ref={trackRef} style={{ x }}>
          {projects.map((project, i) => (
            <TurntableCard
              key={project.title}
              project={project}
              index={i}
              total={projects.length}
              trackX={x}
              centre={layout.centres[i] ?? 0}
              viewport={layout.viewport}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function TurntableCard({
  project,
  index,
  total,
  trackX,
  centre,
  viewport,
}: {
  project: Project;
  index: number;
  total: number;
  trackX: MotionValue<number>;
  centre: number;
  viewport: number;
}) {
  // Rotation is derived from where the card actually sits on screen,
  // so the rack arcs toward the viewer at the centre and turns away
  // at the edges.
  const rotateY = useTransform(trackX, (latest) => {
    if (!viewport) return 0;
    const ratio = (centre + latest - viewport / 2) / viewport;
    return Math.max(-1, Math.min(1, ratio)) * 22;
  });

  const scale = useTransform(rotateY, (angle) => 1 - (Math.abs(angle) / 22) * 0.1);
  const opacity = useTransform(rotateY, (angle) => 1 - (Math.abs(angle) / 22) * 0.45);

  return (
    <motion.article
      className="project-card project-card-gallery"
      data-tint={index}
      data-index={String(index + 1).padStart(2, "0")}
      style={{ rotateY, scale, opacity }}
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
    </motion.article>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <div
      className="project-card project-card-static"
      data-tint={index}
      data-index={String(index + 1).padStart(2, "0")}
    >
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
          {project.tags.map((t) => (
            <span key={t} className="chip">{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
