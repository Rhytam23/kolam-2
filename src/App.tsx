import React, { useRef } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import KolamAnalyzer from './components/KolamAnalyzer';
import KolamGenerator from './components/KolamGenerator';
import KolamWalkthrough from './components/KolamWalkthrough';
import Research from './components/Research';
import Team from './components/Team';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { KolamProvider } from './components/KolamContext';

const App: React.FC = () => {
    const sections = {
        home: useRef<HTMLDivElement>(null),
        about: useRef<HTMLDivElement>(null),
        analyzer: useRef<HTMLDivElement>(null),
        generator: useRef<HTMLDivElement>(null),
        walkthrough: useRef<HTMLDivElement>(null),
        research: useRef<HTMLDivElement>(null),
        team: useRef<HTMLDivElement>(null),
        contact: useRef<HTMLDivElement>(null),
    };

    const scrollToSection = (section: keyof typeof sections) => {
        sections[section].current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <KolamProvider>
            <div className="bg-[#0c0a18] min-h-screen text-gray-200 overflow-x-hidden">
                <div className="absolute inset-0 z-0 opacity-10">
                    <div className="absolute bottom-0 left-0 h-96 w-96 bg-gradient-to-tr from-[#FF9933] to-transparent rounded-full blur-[150px]"></div>
                    <div className="absolute top-0 right-0 h-96 w-96 bg-gradient-to-bl from-[#33A1C9] to-transparent rounded-full blur-[150px]"></div>
                </div>

                <div className="relative z-10">
                    <Header scrollToSection={scrollToSection} />
                    <main>
                        <div ref={sections.home}><Hero scrollToSection={() => scrollToSection('analyzer')} /></div>
                        <div ref={sections.about}><About /></div>
                        <div ref={sections.analyzer}><KolamAnalyzer /></div>
                        <div ref={sections.generator}><KolamGenerator /></div>
                        <div ref={sections.walkthrough}><KolamWalkthrough /></div>
                        <div ref={sections.research}><Research /></div>
                        <div ref={sections.team}><Team /></div>
                        <div ref={sections.contact}><Contact /></div>
                    </main>
                    <Footer />
                </div>
            </div>
        </KolamProvider>
    );
};

export default App;
