import { UIProvider } from '@/components/UIProvider';
import { Nav } from '@/components/Nav';
import { Hero } from '@/components/Hero';
import { Work } from '@/components/Work';
import { Gallery } from '@/components/Gallery';
import { Lab } from '@/components/Lab';
import { Services } from '@/components/Services';
import { About } from '@/components/About';
import { Marquee } from '@/components/Marquee';
import { Contact, Footer } from '@/components/Contact';
import { ProjectModal } from '@/components/ProjectModal';
import { Ask } from '@/components/Ask';

export default function Home() {
  return (
    <UIProvider>
      <div className="loader" aria-hidden="true"><i /></div>
      <Nav />
      <main>
        <Hero />
        <Work />
        <Gallery />
        <Lab />
        <Services />
        <About />
        <Marquee />
        <Contact />
      </main>
      <Footer />
      <ProjectModal />
      <Ask />
    </UIProvider>
  );
}
