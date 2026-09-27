import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-black/20 py-6">
            <div className="container mx-auto text-center text-gray-400">
                <p>&copy; {new Date().getFullYear()} SOLVIX – Kolam AI</p>
                <p className="mt-2 text-sm">Identify the design principles of kolams and recreate them · SIH25107</p>
                <p className="mt-2 font-bold text-white">Built as a cultural-computing prototype in India 🇮🇳</p>
            </div>
        </footer>
    );
};

export default Footer;
