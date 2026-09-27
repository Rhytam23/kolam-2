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

const scrollTo = (id: SectionId) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

const App: React.FC = () => (
    <KolamProvider>
        <div className="min-h-screen overflow-x-hidden">
            <div>
                <FloorArtDefs />
                <a href="#analyzer" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:bg-paper focus:px-4 focus:py-2 focus:rounded-lg">Skip to the analyzer</a>
                <Header onNavigate={scrollTo} />
                <main>
                    <div id="home"><Hero onStart={() => scrollTo('analyzer')} onGenerate={() => scrollTo('generator')} /></div>
                    <div id="process" className="scroll-mt-16"><Process /></div>
                    <div id="about" className="scroll-mt-16"><About /></div>
                    <div id="analyzer" className="scroll-mt-16"><KolamAnalyzer /></div>
                    <div id="generator" className="scroll-mt-16"><KolamGenerator /></div>
                    <div id="walkthrough" className="scroll-mt-16"><DrawGuide /></div>
                    <div id="research" className="scroll-mt-16"><Research /></div>
                    <div id="contact" className="scroll-mt-16"><Contact /></div>
                </main>
                <Footer />
            </div>
        </div>
    </KolamProvider>
);

export default App;
