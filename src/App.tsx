import React from 'react';
import Header, { type SectionId } from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import KolamAnalyzer from './components/KolamAnalyzer';
import KolamGenerator from './components/KolamGenerator';
import DrawGuide from './components/DrawGuide';
import Research from './components/Research';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { KolamProvider } from './components/KolamContext';
import Process from './components/landing/Process';
import { FloorArtDefs } from './components/landing/FloorArt';
import KolamDivider from './components/landing/KolamDivider';

const scrollTo = (id: SectionId) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

const App: React.FC = () => (
    <KolamProvider>
        <div className="min-h-screen overflow-x-clip">
            <div>
                <FloorArtDefs />
                <a href="#analyzer" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:bg-paper focus:px-4 focus:py-2 focus:rounded-lg">Skip to the analyzer</a>
                <Header onNavigate={scrollTo} />
                <main>
                    {/* The landing: a dark red-oxide floor, like a threshold at dawn. */}
                    <div id="home"><Hero onStart={() => scrollTo('analyzer')} onGenerate={() => scrollTo('generator')} /></div>
                    <div className="floor-bg">
                        <KolamDivider tone="rice" spacing={40} className="pt-4" />
                        <div id="process" className="scroll-mt-16"><Process /></div>
                        <KolamDivider tone="rice" spacing={40} />
                        <div id="about" className="scroll-mt-16"><About /></div>
                        <KolamDivider tone="rice" spacing={40} className="pb-10" />
                    </div>
                    {/* The tools, on cream paper so they stay easy to read and use. */}
                    <div id="tools" className="paper-bg">
                        <div id="analyzer" className="scroll-mt-16"><KolamAnalyzer /></div>
                        <KolamDivider />
                        <div id="generator" className="scroll-mt-16"><KolamGenerator /></div>
                        <KolamDivider />
                        <div id="walkthrough" className="scroll-mt-16"><DrawGuide /></div>
                        <KolamDivider />
                        <div id="research" className="scroll-mt-16"><Research /></div>
                        <KolamDivider />
                        <div id="contact" className="scroll-mt-16"><Contact /></div>
                    </div>
                </main>
                <Footer />
            </div>
        </div>
    </KolamProvider>
);

export default App;
