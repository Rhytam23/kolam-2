import React, { useMemo } from 'react';
import { SectionHeading } from './ui/SectionHeading';
import Diya from './landing/Diya';
import Reveal from './landing/Reveal';
import { FloorTile, KolamFrame, RICE, RED_FLOOR } from './landing/FloorArt';
import { diamondDesign, makeSingleLine, squareDesign } from '../utils/kolamLogic';
import { makeRadial, ringPath } from '../utils/radial';
import { BRAND } from '../lib/brand';

/** A square with stepped corners, the building block of a padi (step) kolam. */
const steppedSquare = (a: number, k: number) => {
    const q = [[-a + k, -a], [a - k, -a], [a - k, -a + k], [a, -a + k], [a, a - k], [a - k, a - k], [a - k, a], [-a + k, a], [-a + k, a - k], [-a, a - k], [-a, -a + k], [-a + k, -a + k]];
    return `M${q.map(p => p.join(' ')).join('L')}Z`;
};

const PadiArt: React.FC = () => {
    const lotus = useMemo(() => makeRadial({ petals: 8, layers: 1, style: 'lotus', background: RED_FLOOR, colors: [RICE] }), []);
    return (
        <svg viewBox="-1.15 -1.15 2.3 2.3" className="absolute inset-0 w-full h-full">
            <g filter="url(#rice)" fill="none" stroke={RICE} strokeWidth={0.022} strokeLinejoin="round">
                {[[1, 0.22], [0.86, 0.19], [0.62, 0.14]].map(([a, k]) => <path key={a} d={steppedSquare(a, k)} />)}
                <g transform="scale(0.5)">{lotus.rings.map((r, i) => <path key={i} d={ringPath(r)} strokeWidth={0.04} />)}</g>
            </g>
        </svg>
    );
};

const FAMILY = [
    { word: 'கோலம்', lang: 'ta', name: 'Kolam', region: 'Tamil Nadu' },
    { word: 'ముగ్గులు', lang: 'te', name: 'Muggulu', region: 'Andhra Pradesh, Telangana' },
    { word: 'ರಂಗವಲ್ಲಿ', lang: 'kn', name: 'Rangavalli', region: 'Karnataka' },
    { word: 'रांगोळी', lang: 'mr', name: 'Rangoli', region: 'Maharashtra, Gujarat and across India' },
    { word: 'আলপনা', lang: 'bn', name: 'Alpana', region: 'Bengal' },
    { word: 'मांडना', lang: 'hi', name: 'Mandana', region: 'Rajasthan, Madhya Pradesh' },
];

const About: React.FC = () => {
    const kinds = useMemo(() => [
        { name: 'Pulli kolam', text: 'Lines loop around a grid of dots (pulli) without touching them.', art: <KolamFrame design={diamondDesign(3)} /> },
        { name: 'Sikku kolam', text: 'A pulli kolam drawn as one continuous line that returns to where it began.', art: <KolamFrame design={makeSingleLine(squareDesign(4))} /> },
        { name: 'Kambi kolam', text: 'Lines woven like wire; the dots are often left out of the finished design.', art: <KolamFrame design={makeSingleLine(diamondDesign(5))} showDots={false} /> },
        { name: 'Padi kolam', text: 'Stepped, geometric bands, drawn on festive days and at temples.', art: <PadiArt /> },
    ], []);

    return (
        <section className="py-24 px-4 text-rice">
            <div className="container mx-auto max-w-6xl">
                <SectionHeading dark title="The Tradition" kicker="Every morning, at the door" className="mb-14" />

                <Reveal className="relative mx-auto max-w-4xl text-center">
                    <span className="absolute -top-10 left-0 font-heading text-8xl text-brass/40 leading-none select-none" aria-hidden>“</span>
                    <blockquote className="font-heading text-2xl md:text-4xl leading-snug text-rice">
                        Before sunrise the threshold is swept and washed, and a kolam is drawn in rice flour, to welcome the day,
                        and to feed the ants and the birds.
                    </blockquote>
                    <p className="mt-6 text-rice/80 max-w-2xl mx-auto">
                        In the month of Margazhi and at Pongal the designs grow larger and more colourful, and whole streets fill with them.
                    </p>
                    <Diya className="h-10 w-10 mx-auto mt-6" />
                </Reveal>

                <h3 className="mt-20 mb-8 font-heading text-3xl md:text-4xl text-brass-light text-center">Kinds of kolam</h3>
                <ul className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {kinds.map((k, i) => (
                        <Reveal as="li" key={k.name} delay={i * 120}>
                            <FloorTile frame="plaque" label={`An example of a ${k.name.toLowerCase()}`}>
                                <div className="absolute inset-[10%] glow">{k.art}</div>
                            </FloorTile>
                            <p className="mt-3 font-heading text-xl text-rice">{k.name}</p>
                            <p className="text-sm text-rice/80 mt-1">{k.text}</p>
                        </Reveal>
                    ))}
                </ul>

                <h3 className="mt-20 mb-8 font-heading text-3xl md:text-4xl text-brass-light text-center">One family, many names</h3>
                <Reveal>
                    <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border-y border-brass/40 divide-brass/30 lg:divide-x">
                        {FAMILY.map(f => (
                            <li key={f.name} className="px-3 py-6 text-center">
                                <p lang={f.lang} className="font-script text-3xl text-brass-light leading-relaxed">{f.word}</p>
                                <p className="mt-1 font-semibold text-rice">{f.name}</p>
                                <p className="text-sm text-rice/80">{f.region}</p>
                            </li>
                        ))}
                    </ul>
                </Reveal>

                <Reveal className="mt-20 rounded-2xl border border-brass/50 bg-floor/60 p-8 md:p-10 max-w-4xl mx-auto">
                    <p className="text-sm font-semibold tracking-wide text-brass-light mb-3">About this project</p>
                    <p className="text-rice/90 leading-relaxed text-lg">
                        <strong className="text-rice">{BRAND}</strong> finds the design principles behind a kolam and recreates it. It reads the dot grid, the way lines cross or turn
                        between dots, the symmetry and the colours of a design, and turns them into a guide anyone can follow. Dot kolams are
                        recreated exactly; free-hand designs such as alpana and rangoli are traced, and you can generate new designs with the
                        same symmetry and colours.
                    </p>
                </Reveal>
            </div>
        </section>
    );
};

export default About;
