import React from 'react';
import { Card } from './ui/Card';

const About: React.FC = () => (
    <section className="py-20 px-4 container mx-auto">
        <h2 className="font-heading text-4xl md:text-5xl text-center mb-12 gradient-text">About The Project</h2>
        <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
                <p>
                    <strong>SOLVIX – Kolam AI</strong> answers the Smart India Hackathon problem <strong>SIH25107</strong>: write programs that
                    identify the design principles behind kolam designs and recreate the kolams.
                </p>
                <p>
                    A pulli kolam is a set of dots (pulli) with a line (neli) that loops around every dot without touching it.
                    Between two neighbouring dots the line either crosses itself or turns, as if bouncing off a mirror.
                    Those choices, together with the dot grid, fully describe the kolam.
                </p>
                <p>
                    SOLVIX reads those choices from a photo, reports the grid, symmetry and number of loops, and redraws the kolam as a clean vector
                    you can edit, share as a <code className="text-saffron">.kolam.json</code> file, or join into a single continuous line.
                </p>
            </div>
            <div className="space-y-8">
                <Card>
                    <h3 className="text-2xl font-bold text-orange-400 mb-3">Computer vision with human correction</h3>
                    <p className="text-gray-400">
                        OpenCV finds the dots and fits a lattice to them. If it misses a dot you add, move or remove dots by hand and recreate
                        the kolam from your corrections.
                    </p>
                </Card>
                <Card>
                    <h3 className="text-2xl font-bold text-blue-400 mb-3">Explainable, not a black box</h3>
                    <p className="text-gray-400">
                        Every result comes from simple geometry: lattice fit, ink between dots and mirror-curve tracing. That makes it easy to
                        teach and to check.
                    </p>
                </Card>
            </div>
        </div>
    </section>
);

export default About;
