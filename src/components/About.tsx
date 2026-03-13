
import React from 'react';
import { Card } from './ui/Card';

const About: React.FC = () => {
    return (
        <section className="py-20 px-4 container mx-auto">
            <h2 className="font-heading text-4xl md:text-5xl text-center mb-12 gradient-text">About The Project</h2>
            <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
                    <p>
                        <strong>SOLVIX – Kolam AI</strong> is a pioneering project for the Smart India Hackathon 2025. Our mission is to decode the intricate design principles embedded within traditional Kolam art, a cultural heritage of Tamil Nadu.
                    </p>
                    <p>
                        By leveraging the power of Artificial Intelligence, Computer Vision, and advanced computational techniques, we aim to analyze, understand, and algorithmically recreate these beautiful geometric patterns.
                    </p>
                    <p>
                        This endeavor is not just a technical challenge; it's a journey to preserve and digitize a vital part of India's cultural fabric, making it accessible and understandable for generations to come.
                    </p>
                </div>
                <div className="space-y-8">
                    <Card>
                        <h3 className="text-2xl font-bold text-orange-400 mb-3">AI & Computer Vision</h3>
                        <p className="text-gray-400">
                            Utilizing Python libraries like OpenCV, scikit-image, and NetworkX to detect dot grids, trace loops, and identify symmetries in Kolam designs from images.
                        </p>
                    </Card>
                    <Card>
                        <h3 className="text-2xl font-bold text-blue-400 mb-3">Indian Knowledge Systems (IKS)</h3>
                        <p className="text-gray-400">
                            Integrating mathematical and philosophical principles from IKS to understand the symbolic and structural significance of Kolam patterns, promoting cultural preservation through technology.
                        </p>
                    </Card>
                </div>
            </div>
        </section>
    );
};

export default About;
