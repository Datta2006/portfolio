import { useState } from "react";
import { Navbar } from "./components/Navbar";
import { Preloader } from "./components/Preloader";
import { Hero } from "./components/Hero";
import { TechMarquee } from "./components/TechMarquee";
import { Projects } from "./components/Projects";
import { Experience } from "./components/Experience";
import { Skills } from "./components/Skills";
import { Education } from "./components/Education";
import { Contact, Footer } from "./components/Contact";
import { Cosmos } from "./components/Cosmos";
import { AmbientCosmos } from "./components/ambient/AmbientCosmos";
import { CursorOrb } from "./components/CursorOrb";

export default function App() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <a className="skip-link" href="#main">
        SKIP TO CONTENT
      </a>
      <Cosmos />
      <AmbientCosmos />
      <div className="structural-grid" aria-hidden="true" />
      <CursorOrb />
      <Preloader onDone={() => setLoaded(true)} />
      <Navbar ready={loaded} />

      <main id="main" className="app-root" tabIndex={-1}>
        <Hero ready={loaded} />
        <TechMarquee />
        <Projects />
        <Experience />
        <Skills />
        <Education />
        <Contact />
      </main>

      <Footer />
      <div className="grain" aria-hidden="true" />
    </>
  );
}
