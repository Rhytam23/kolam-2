import React from 'react';
import KolamGenerator from '../components/KolamGenerator';
import DrawGuide from '../components/DrawGuide';
import Research from '../components/Research';
import Contact from '../components/Contact';
import TraditionGallery from '../components/TraditionGallery';
import { ProjectPanel } from '../components/About';
import ColourStory from '../components/ColourStory';
import CultureDivider from '../components/culture/CultureDivider';
import { Ornament } from '../components/culture/Ornaments';
import { SectionHeading } from '../components/ui/SectionHeading';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Link } from '../lib/router';

/** /studio: every style, with the guide and practice below. */
export const StudioPage: React.FC = () => (
    <div data-paper className="paper-bg pt-16">
        <div id="generator" className="scroll-mt-16"><ErrorBoundary name="design studio"><KolamGenerator /></ErrorBoundary></div>
        <CultureDivider index={3} />
        <div id="walkthrough" className="scroll-mt-16"><ErrorBoundary name="drawing guide"><DrawGuide /></ErrorBoundary></div>
    </div>
);

/** /about: the project, its name, the research behind it, and feedback. */
export const AboutPage: React.FC = () => (
    <>
        <section className="floor-bg px-4 pt-28 pb-20 text-rice">
            <SectionHeading dark title="About Chittara" kicker="Why it was made" className="mb-12" />
            <ProjectPanel />
        </section>
        <div data-paper className="paper-bg">
            <div id="colours" className="scroll-mt-16"><ColourStory /></div>
            <div id="research" className="scroll-mt-16"><ErrorBoundary name="reference list"><Research /></ErrorBoundary></div>
            <CultureDivider index={5} />
            <div id="contact" className="scroll-mt-16"><ErrorBoundary name="feedback section"><Contact /></ErrorBoundary></div>
        </div>
    </>
);

/** Any address the app does not know. */
export const NotFoundPage: React.FC = () => (
    <section className="floor-bg px-4 pt-28 pb-20 text-rice">
        <div className="container mx-auto max-w-6xl text-center">
            <SectionHeading dark title="This page is not on our doorstep" className="mb-4" />
            <div className="flex justify-center gap-6 mb-6 text-brass-light" aria-hidden>{(['footprints', 'lotus', 'footprints'] as const).map((id, i) => <Ornament key={i} id={id} className="h-10 w-10" />)}</div>
            <p className="text-lg text-rice/85 mb-8">The address may be mistyped. <Link to="/" className="underline decoration-brass/60 underline-offset-4 hover:text-brass-light">Go to the home page</Link>, or choose an art form:</p>
            <TraditionGallery />
        </div>
    </section>
);
