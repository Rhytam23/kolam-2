import React from 'react';
import Hero from '../components/Hero';
import Process from '../components/landing/Process';
import KolamDivider from '../components/landing/KolamDivider';
import Reveal from '../components/landing/Reveal';
import { DawnQuote } from '../components/About';
import TraditionGallery from '../components/TraditionGallery';
import { SectionHeading } from '../components/ui/SectionHeading';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Link, navigate } from '../lib/router';
import { TRADITIONS } from '../data/traditions';

const TOOLS = [
    { to: '/read', title: 'Read a design from a photo', text: 'Photograph a kolam, rangoli or alpana: find its dots, symmetry and colours, and redraw it.' },
    { to: '/studio', title: 'Design Studio', text: 'Make your own design in any style, change its size and colours, and download it.' },
    { to: '/studio#walkthrough', title: 'Learn and practise', text: 'Follow the steps one at a time, then draw it yourself by tapping the dots in order.' },
];

/** The home page: the drawing hero, every art form, how designs are made, and the tools. */
const Landing: React.FC = () => (
    <>
        <ErrorBoundary name="home page"><Hero onStart={() => navigate('/read')} onGenerate={() => navigate('/studio')} /></ErrorBoundary>
        <div className="floor-bg">
            <KolamDivider tone="rice" spacing={40} className="pt-4" />
            <section id="traditions" className="scroll-mt-16 py-20 px-4">
                <div className="container mx-auto max-w-6xl">
                    <SectionHeading dark title="The floor art of India" kicker={`${TRADITIONS.length} traditions, each in its own colours`} className="mb-4" />
                    <p className="text-center text-rice/85 mb-12 max-w-2xl mx-auto text-lg">
                        From the kolam of Tamil Nadu to the alpana of Bengal and the mandana of Rajasthan: choose one to learn how it is made, and draw it yourself.
                    </p>
                    <TraditionGallery />
                </div>
            </section>
            <KolamDivider tone="rice" spacing={40} />
            <div id="process" className="scroll-mt-16"><ErrorBoundary name="drawing steps"><Process /></ErrorBoundary></div>
            <KolamDivider tone="rice" spacing={40} />
            <DawnQuote />
            <KolamDivider tone="rice" spacing={40} />
            <section className="py-20 px-4 text-rice">
                <div className="container mx-auto max-w-6xl">
                    <SectionHeading dark title="Tools for every design" className="mb-10" />
                    <ul className="grid md:grid-cols-3 gap-5">
                        {TOOLS.map((tool, i) => (
                            <Reveal as="li" key={tool.to} delay={i * 100}>
                                <Link to={tool.to} className="group block h-full rounded-2xl border border-brass/40 bg-floor/60 p-6 hover:border-brass-light transition-colors">
                                    <p className="font-heading text-2xl text-brass-light">{tool.title}</p>
                                    <p className="mt-2 text-rice/90">{tool.text}</p>
                                    <p className="mt-4 font-semibold text-brass-light group-hover:underline underline-offset-4">Open →</p>
                                </Link>
                            </Reveal>
                        ))}
                    </ul>
                </div>
            </section>
        </div>
    </>
);

export default Landing;
