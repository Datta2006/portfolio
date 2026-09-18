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

export default function App() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <Preloader onDone={() => setLoaded(true)} />
      <Navbar ready={loaded} />
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
      <div className="grain" aria-hidden="true" />
    </>
  );
}
