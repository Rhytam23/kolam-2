import React from 'react';
import { TRADITIONS } from '../data/traditions';
import { COLOUR_STORY } from '../data/colourStory';
import { SectionHeading } from './ui/SectionHeading';

/** About page: why each art form's page is coloured as it is, with its four main colours. */
const ColourStory: React.FC = () => (
    <section className="py-20 px-4" aria-labelledby="why-colours">
        <div className="container mx-auto max-w-6xl">
            <SectionHeading title="Why these colours" kicker="Each art form has its own" className="mb-4" />
            <p id="why-colours" className="text-center text-muted mb-10 max-w-2xl mx-auto">
                Each page is coloured from its art form&apos;s own materials and from one colour tradition of its region. These are
                an outsider&apos;s readings, offered for correction by the people who practise each art.
            </p>
            <ul className="grid md:grid-cols-2 gap-5">
                {TRADITIONS.map(t => {
                    const story = COLOUR_STORY[t.slug];
                    const swatches = [t.theme.floor, t.theme.rice, t.theme.brassLight, t.theme.kaavi];
                    return (
                        <li key={t.slug} className="rounded-2xl border border-kaavi/15 bg-white/80 p-5">
                            <p className="font-heading text-2xl text-kaavi">{t.name} <span className="text-base text-muted">· {story.looks}</span></p>
                            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2" aria-label={`${t.name} colours`}>
                                {swatches.map((hex, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-ink">
                                        <span className="h-5 w-5 rounded-full ring-1 ring-black/20" style={{ background: hex }} aria-hidden />
                                        {story.names[i]}
                                    </li>
                                ))}
                            </ul>
                            <p className="mt-3 text-sm text-muted leading-relaxed">{story.reason}</p>
                        </li>
                    );
                })}
            </ul>
        </div>
    </section>
);

export default ColourStory;
