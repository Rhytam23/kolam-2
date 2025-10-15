
import React from 'react';
import { Card } from './ui/Card';

const researchData = [
    {
        title: "KolamNet: A Deep Learning Approach for Kolam Pattern Recognition and Generation",
        authors: "Anuradha Sharma, et al.",
        year: "2023-2024",
        summary: "Introduced a novel convolutional neural network architecture for classifying and generating Kolam designs, achieving high accuracy in recognizing traditional patterns."
    },
    {
        title: "Symmetry in Computer Vision: A Survey",
        authors: "Liu, Y., et al.",
        year: "2021",
        summary: "A comprehensive review of symmetry detection algorithms in computer vision, providing a foundational understanding for analyzing the geometric properties of Kolams."
    },
    {
        title: "The Design System of Kolam: A Computational Perspective",
        authors: "T. Robinson, G. Siromoney",
        year: "2008",
        summary: "Explores the mathematical and algorithmic underpinnings of Kolam, treating them as picture languages and formal grammars, crucial for procedural generation."
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
