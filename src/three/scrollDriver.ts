/* ------------------------------------------------------------
   A single read-only scroll driver shared by the 3D layer.

   It does not listen to scroll events, hijack scrolling, or push
   React state. One requestAnimationFrame loop samples window.scrollY
   into a mutable object that the scene reads in its own frame loop.
   Section waypoints are remeasured on resize, visualViewport changes,
   font load, and layout mutations (including the pinned Projects
   section, whose scroll range is measured explicitly).

   This is deliberately independent from the existing Framer Motion
   scroll sources used by Projects, Experience, Contact and Navbar.
   ------------------------------------------------------------ */

import type { Waypoint } from "./snakePath";

export type ScrollState = {
  /** Raw document progress, 0..1. */
  progress: number;
  /** The max scroll distance used to normalize progress. */
  maxScroll: number;
  /** Progress at which #contact becomes the active composition. */
  contactProgress: number;
  /** Rebuilt waypoints for the current layout. */
  waypoints: Waypoint[];
  viewportWidth: number;
  viewportHeight: number;
  /** Bumped every time the layout is remeasured. */
  version: number;
};

export const scrollState: ScrollState = {
  progress: 0,
  maxScroll: 1,
  contactProgress: 1,
  waypoints: [],
  viewportWidth: 0,
  viewportHeight: 0,
  version: 0,
};

const clamp01 = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value);

let subscribers = 0;
let raf = 0;
let measureQueued = false;
let resizeObserver: ResizeObserver | null = null;
let lastNow = 0;
let started = false;

function docTop(el: Element): number {
  return el.getBoundingClientRect().top + window.scrollY;
}

function find(selector: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(selector);
}

function buildWaypoints(): void {
  const doc = document.documentElement;
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  const maxScroll = Math.max(1, doc.scrollHeight - viewportHeight);

  const toProgress = (docY: number) => clamp01(docY / maxScroll);

  const hero = find("#top");
  const marquee = find(".marquee");
  const projects = find("#projects");
  const hscroll = find(".projects-hscroll");
  const experience = find("#experience");
  const skills = find("#skills");
  const education = find("#education");
  const contact = find("#contact");

  const entries: Array<{ id: string; y: number; x: number; ny: number; z: number; scale: number; alpha: number }> = [];

  const add = (
    id: string,
    y: number,
    x: number,
    ny: number,
    z: number,
    scale: number,
    alpha: number,
  ) => {
    entries.push({ id, y, x, ny, z, scale, alpha });
  };

  if (hero) {
    const top = docTop(hero);
    const height = hero.offsetHeight || viewportHeight;
    add("hero-emerge", top, 0.84, 0.5, -1.2, 0.86, 0);
    add("hero-in", top + height * 0.36, 0.82, 0.31, -0.4, 0.94, 0.62);
    add("hero-out", top + height * 0.84, 0.92, 0.62, 0.2, 1, 0.72);
  }

  if (marquee) {
    const top = docTop(marquee);
    const height = marquee.offsetHeight || 80;
    add("marquee", top + height * 0.5, 0.12, 0.3, 0.4, 0.82, 0.5);
  }

  if (projects) {
    add("projects-in", docTop(projects), 0.07, 0.66, 0.2, 0.9, 0.26);
  }

  /* The horizontal turntable pins for 100dvh + track distance.
     These in-between beats keep the creature travelling through
     the gutters instead of freezing for the whole pinned range. */
  if (hscroll) {
    const top = docTop(hscroll);
    const height = Math.max(1, hscroll.offsetHeight);
    const at = (fraction: number) => top + height * fraction;
    add("projects-a", at(0.06), 0.08, 0.62, -0.2, 0.86, 0.3);
    add("projects-b", at(0.28), 0.93, 0.29, 0.8, 1.02, 0.84);
    add("projects-c", at(0.52), 0.06, 0.7, -0.6, 0.94, 0.64);
    add("projects-d", at(0.76), 0.94, 0.36, 0.5, 1.05, 0.82);
    add("projects-e", at(0.98), 0.13, 0.62, -0.2, 0.88, 0.24);
  }

  if (experience) {
    const top = docTop(experience);
    const height = experience.offsetHeight;
    add("experience-in", top + height * 0.18, 0.9, 0.36, 0.3, 0.94, 0.72);
    add("experience-out", top + height * 0.76, 0.86, 0.64, -0.4, 1, 0.86);
  }

  if (skills) {
    const top = docTop(skills);
    const height = skills.offsetHeight;
    add("skills-in", top + height * 0.22, 0.06, 0.34, 0.2, 0.82, 0.42);
    add("skills-out", top + height * 0.78, 0.1, 0.68, -0.7, 0.72, 0.36);
  }

  if (education) {
    const top = docTop(education);
    const height = education.offsetHeight;
    add("education", top + height * 0.52, 0.93, 0.44, -1.1, 0.68, 0.14);
  }

  if (contact) {
    const top = docTop(contact);
    const height = contact.offsetHeight;
    add("contact-in", top + height * 0.18, 0.8, 0.26, 0.1, 0.96, 0.68);
    add("contact-out", top + height * 0.76, 0.9, 0.66, -0.3, 0.9, 0.82);
  }

  add("document-end", maxScroll, 0.86, 0.54, -0.2, 0.82, 0.45);

  entries.sort((a, b) => a.y - b.y);

  const waypoints: Waypoint[] = [];
  for (const entry of entries) {
    const p = toProgress(entry.y);
    const prev = waypoints[waypoints.length - 1];
    if (prev && p <= prev.p + 1e-5) {
      // Keep the last beat at this progress (more specific sections win).
      waypoints[waypoints.length - 1] = {
        id: entry.id,
        p,
        x: entry.x,
        y: entry.ny,
        z: entry.z,
        scale: entry.scale,
        alpha: entry.alpha,
      };
      continue;
    }
    waypoints.push({
      id: entry.id,
      p,
      x: entry.x,
      y: entry.ny,
      z: entry.z,
      scale: entry.scale,
      alpha: entry.alpha,
    });
  }

  scrollState.progress = clamp01(window.scrollY / maxScroll);
  scrollState.maxScroll = maxScroll;
  scrollState.waypoints = waypoints;
  scrollState.viewportWidth = viewportWidth;
  scrollState.viewportHeight = viewportHeight;
  scrollState.contactProgress = contact ? toProgress(docTop(contact)) : 1;
  scrollState.version += 1;
}

function measure(): void {
  measureQueued = false;
  if (document.hidden) return;
  buildWaypoints();
}

function requestMeasure(): void {
  if (measureQueued) return;
  measureQueued = true;
  requestAnimationFrame(measure);
}

function tick(now: number): void {
  if (!started) return;

  if (!document.hidden) {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    if (Math.abs(maxScroll - scrollState.maxScroll) > 1) {
      requestMeasure();
    } else {
      scrollState.progress = clamp01(window.scrollY / maxScroll);
    }

    /* Mobile browser chrome can change innerHeight without a resize
       event on some browsers. Re-measure periodically, cheaply. */
    if (now - lastNow > 1200) {
      lastNow = now;
      if (
        window.innerHeight !== scrollState.viewportHeight ||
        window.innerWidth !== scrollState.viewportWidth
      ) {
        requestMeasure();
      }
    }
  }

  raf = requestAnimationFrame(tick);
}

function start(): void {
  if (started) return;
  started = true;
  lastNow = performance.now();

  resizeObserver = new ResizeObserver(requestMeasure);
  resizeObserver.observe(document.body);
  window.addEventListener("resize", requestMeasure, { passive: true });
  window.addEventListener("orientationchange", requestMeasure, { passive: true });
  window.visualViewport?.addEventListener("resize", requestMeasure, { passive: true });
  window.addEventListener("hashchange", requestMeasure, { passive: true });
  document.fonts?.ready.then(requestMeasure).catch(() => undefined);

  measure();
  raf = requestAnimationFrame(tick);
  // Layout settles after fonts, lazy sections, and the turntable measure.
  window.setTimeout(requestMeasure, 450);
  window.setTimeout(requestMeasure, 1400);
}

function stop(): void {
  if (!started) return;
  started = false;
  cancelAnimationFrame(raf);
  raf = 0;
  resizeObserver?.disconnect();
  resizeObserver = null;
  window.removeEventListener("resize", requestMeasure);
  window.removeEventListener("orientationchange", requestMeasure);
  window.visualViewport?.removeEventListener("resize", requestMeasure);
  window.removeEventListener("hashchange", requestMeasure);
}

/** Acquire the shared driver. Safe to call from React StrictMode. */
export function acquireScrollDriver(): () => void {
  subscribers += 1;
  if (subscribers === 1) start();

  let released = false;
  return () => {
    if (released) return;
    released = true;
    subscribers = Math.max(0, subscribers - 1);
    if (subscribers === 0) stop();
  };
}
