import React from 'react';
import { Link } from '../lib/router';
import { TRADITIONS, type Tradition } from '../data/traditions';
import { presetBackground } from '../data/designs';
import { DesignFrame } from './landing/FloorArt';
import Reveal from './landing/Reveal';

interface CardLink {
    /** Where each card leads: the art form's page unless given. */
    to?: (t: Tradition) => string;
    action?: string;
}

/** A card for each art form, in its own colours, with its signature design. */
export const TraditionCard: React.FC<{ tradition: Tradition; delay?: number } & CardLink> = ({ tradition: t, delay = 0, to, action = 'Explore and draw' }) => (
    <Reveal as="li" delay={delay}>
        <Link
            to={to ? to(t) : `/${t.slug}`}
            className="group block h-full overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/10 transition hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-brass-light"
            style={{ backgroundColor: t.theme.floor }}
        >
            <div className="relative aspect-square" style={{ backgroundColor: presetBackground(t.designs[0].spec) }}>
                <div className="absolute inset-[6%]"><DesignFrame spec={t.designs[0].spec} rough={false} /></div>
            </div>
            <div className="p-4" style={{ color: t.theme.rice }}>
                <p className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-heading text-xl">{t.name}</span>
                    <span lang={t.script.lang} className="font-script text-lg" style={{ color: t.theme.brassLight }}>{t.script.word}</span>
                </p>
                <p className="text-sm opacity-90">{t.region}</p>
                <p className="mt-2 text-sm font-semibold group-hover:underline underline-offset-4" style={{ color: t.theme.brassLight }}>{action} →</p>
            </div>
        </Link>
    </Reveal>
);

/** Every art form, or all but one. */
const TraditionGallery: React.FC<{ except?: string } & CardLink> = ({ except, to, action }) => (
    <ul className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {TRADITIONS.filter(t => t.slug !== except).map((t, i) => <TraditionCard key={t.slug} tradition={t} delay={(i % 4) * 80} to={to} action={action} />)}
    </ul>
);

export default TraditionGallery;
