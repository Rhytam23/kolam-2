import React from 'react';
import { Card } from './ui/Card';

const KINDS = [
    ['Pulli kolam', 'Lines loop around a grid of dots (pulli) without touching them.'],
    ['Sikku kolam', 'A pulli kolam drawn as one continuous line that returns to where it began.'],
    ['Kambi kolam', 'Lines woven like wire, often without dots.'],
    ['Padi kolam', 'Stepped, geometric bands, drawn on festive days and at temples.'],
];

const FAMILY = [
    ['Kolam', 'Tamil Nadu'],
    ['Muggulu', 'Andhra Pradesh, Telangana'],
    ['Rangavalli', 'Karnataka'],
    ['Rangoli', 'Maharashtra, Gujarat and across India'],
    ['Alpana', 'Bengal'],
    ['Mandana', 'Rajasthan, Madhya Pradesh'],
];

const About: React.FC = () => (
    <section className="py-20 px-4 container mx-auto">
        <h2 className="font-heading text-4xl md:text-5xl text-center mb-4 gradient-text">The Tradition</h2>
        <p className="text-center text-muted mb-12 max-w-2xl mx-auto">
            Every morning, in homes across South India, the threshold is swept, sprinkled with water, and decorated with a kolam.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
            <Card>
                <h3 className="font-heading text-2xl text-kaavi mb-3">When and why</h3>
                <p className="text-ink leading-relaxed">
                    A kolam is drawn at dawn at the doorstep, traditionally with rice flour, which also feeds ants and birds. It welcomes the day
                    and visitors. Designs grow larger and more colourful in the month of Margazhi and at Pongal.
                </p>
            </Card>
            <Card>
                <h3 className="font-heading text-2xl text-kaavi mb-3">Kinds of kolam</h3>
                <dl className="space-y-2">
                    {KINDS.map(([name, text]) => (
                        <div key={name}><dt className="font-semibold text-ink">{name}</dt><dd className="text-sm text-muted">{text}</dd></div>
                    ))}
                </dl>
            </Card>
            <Card>
                <h3 className="font-heading text-2xl text-kaavi mb-3">One family, many names</h3>
                <ul className="space-y-1.5">
                    {FAMILY.map(([name, region]) => (
                        <li key={name} className="flex justify-between gap-3"><span className="font-semibold text-ink">{name}</span><span className="text-sm text-muted text-right">{region}</span></li>
                    ))}
                </ul>
            </Card>
        </div>
        <Card className="mt-6">
            <p className="text-ink leading-relaxed">
                <strong>SOLVIX</strong> was built for Smart India Hackathon problem <strong>SIH25107</strong>: identify the design principles behind
                kolam designs and recreate them. It reads the dot grid, the way lines cross or turn between dots, the symmetry and the colours of
                a design, and turns them into a guide anyone can follow. Dot kolams are recreated exactly; free-hand designs such as alpana and
                rangoli are traced, and you can generate new designs with the same symmetry and colours.
            </p>
        </Card>
    </section>
);

export default About;
