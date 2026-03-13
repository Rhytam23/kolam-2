
import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-black/20 py-6">
            <div className="container mx-auto text-center text-gray-400">
                <p>&copy; {new Date().getFullYear()} SOLVIX. All Rights Reserved.</p>
                <p className="mt-2 text-sm">A Smart India Hackathon 2025 Project</p>
                <p className="mt-2 font-bold text-white">Proudly made in India 🇮🇳</p>
            </div>
        </footer>
    );
};

export default Footer;
