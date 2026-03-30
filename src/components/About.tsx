import React from 'react';
import { Card } from './ui/Card';

const About: React.FC = () => {
    return (
        <section className="py-20 px-4 container mx-auto">
            <h2 className="font-heading text-4xl md:text-5xl text-center mb-12 gradient-text">About The Project</h2>
            <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
                    <p>
                        <strong>SOLVIX – Kolam AI</strong> is a cultural-computing project focused on helping people analyze, preserve, and reinterpret traditional Kolam patterns through interactive software.
                    </p>
                    <p>
                        The project combines computer vision, procedural geometry, and correction tooling so a user can upload a Kolam image, detect its dot structure, refine that structure manually, and compare it against a generated procedural reference.
                    </p>
                    <p>
                        Instead of treating Kolam as decoration alone, SOLVIX approaches it as a living design system: a form of geometry, rhythm, and memory that can be documented, explained, and explored digitally without losing its cultural identity.
                    </p>
                </div>
                <div className="space-y-8">
                    <Card>
                        <h3 className="text-2xl font-bold text-orange-400 mb-3">Computer Vision + Human Correction</h3>
                        <p className="text-gray-400">
                            The analyzer uses denoising, threshold blending, blob detection fallback, and geometric cleanup to produce a first-pass dot map, then gives the user correction tools like drag-editing, undo/redo, workspace save/load, and export.
                        </p>
                    </Card>
                    <Card>
                        <h3 className="text-2xl font-bold text-blue-400 mb-3">Tradition as Structured Knowledge</h3>
                        <p className="text-gray-400">
                            SOLVIX treats Kolam as a structured visual language. The generator and walkthrough sections translate that language into interactive geometry so learners and judges can understand both the cultural importance and the computational logic behind the pattern.
                        </p>
                    </Card>
                </div>
            </div>
        </section>
    );
};

export default About;
