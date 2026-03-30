import React from 'react';
import { Card } from './ui/Card';

const researchData = [
    {
        title: 'KolamNet: A Deep Learning Approach for Kolam Pattern Recognition and Generation',
        authors: 'Anuradha Sharma, et al.',
        year: '2023–2024',
        summary: 'A modern research direction for learning-based Kolam recognition and generation, useful as a reference point for how future versions of SOLVIX could evolve beyond heuristic computer vision.',
    },
    {
        title: 'Symmetry in Computer Vision: A Survey',
        authors: 'Liu, Y., et al.',
        year: '2021',
        summary: 'A strong conceptual reference for how symmetry detection can support Kolam interpretation, especially in noisy or partially damaged visual inputs.',
    },
    {
        title: 'The Design System of Kolam: A Computational Perspective',
        authors: 'T. Robinson, G. Siromoney',
        year: '2008',
        summary: 'A foundational computational view of Kolam as a formal visual system, directly relevant to procedural generation and grammar-based pattern understanding.',
    },
    {
        title: 'Indian Knowledge Systems and Visual Pattern Logic',
        authors: 'Curated project synthesis',
        year: '2025',
        summary: 'For this prototype, the project frames Kolam not only as image data but as embodied cultural logic—combining spatial rhythm, ritual repetition, and geometric decision-making.',
    },
];

const Research: React.FC = () => {
    return (
        <section className="py-20 px-4 container mx-auto">
            <h2 className="font-heading text-4xl md:text-5xl text-center mb-12 gradient-text">Research & References</h2>
            <div className="max-w-4xl mx-auto space-y-6">
                {researchData.map((item, index) => (
                    <Card key={index}>
                        <h3 className="text-xl font-bold text-orange-400">{item.title}</h3>
                        <p className="text-sm text-gray-400 italic my-2">{item.authors} ({item.year})</p>
                        <p className="text-gray-300">{item.summary}</p>
                    </Card>
                ))}
            </div>
        </section>
    );
};

export default Research;
