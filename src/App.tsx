import { lazy, Suspense, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Navbar } from "./components/Navbar";
import { Preloader } from "./components/Preloader";
import { Hero } from "./components/Hero";
import { TechMarquee } from "./components/TechMarquee";
import { Projects } from "./components/Projects";
import { Experience } from "./components/Experience";
import { Skills } from "./components/Skills";
import { Education } from "./components/Education";
import { Contact, Footer } from "./components/Contact";

const SnakeLayer = lazy(() => import("./components/SnakeLayer"));

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const reduce = useReducedMotion();

  return (
    <>
      <Preloader onDone={() => setLoaded(true)} />
      <Navbar ready={loaded} />
      <div className="page-fog" aria-hidden="true" />
      {loaded && !reduce && (
        <Suspense fallback={null}>
          <SnakeLayer />
        </Suspense>
      )}
      <main className="app-root">
        <Hero ready={loaded} />
        <TechMarquee />
        <Projects />
        <Experience />
        <Skills />
        <Education />
        <Contact />
      </main>
      <Footer />
      <div className="vignette" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
    </>
  );
}
