import React from 'react';
import Header, { type SectionId } from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import KolamAnalyzer from './components/KolamAnalyzer';
import KolamGenerator from './components/KolamGenerator';
import KolamWalkthrough from './components/KolamWalkthrough';
import Research from './components/Research';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { KolamProvider } from './components/KolamContext';

const scrollTo = (id: SectionId) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

const App: React.FC = () => (
    <KolamProvider>
        <div className="bg-[#0c0a18] min-h-screen text-gray-200 overflow-x-hidden relative">
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
                <div className="absolute bottom-0 left-0 h-96 w-96 bg-gradient-to-tr from-[#FF9933] to-transparent rounded-full blur-[150px]" />
                <div className="absolute top-0 right-0 h-96 w-96 bg-gradient-to-bl from-[#33A1C9] to-transparent rounded-full blur-[150px]" />
            </div>
            <div className="relative z-10">
                <Header onNavigate={scrollTo} />
                <main>
                    <div id="home"><Hero onStart={() => scrollTo('analyzer')} onGenerate={() => scrollTo('generator')} /></div>
                    <div id="about" className="scroll-mt-16"><About /></div>
                    <div id="analyzer" className="scroll-mt-16"><KolamAnalyzer /></div>
                    <div id="generator" className="scroll-mt-16"><KolamGenerator /></div>
                    <div id="walkthrough" className="scroll-mt-16"><KolamWalkthrough /></div>
                    <div id="research" className="scroll-mt-16"><Research /></div>
                    <div id="contact" className="scroll-mt-16"><Contact /></div>
                </main>
                <Footer />
            </div>
        </div>
    </KolamProvider>
);

export default App;
