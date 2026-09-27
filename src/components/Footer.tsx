import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-sand/70 border-t border-kaavi/15 py-8">
            <div className="container mx-auto px-4 text-center text-muted">
                <p>&copy; {new Date().getFullYear()} SOLVIX – Kolam AI</p>
                <p className="mt-2 text-sm">Identify the design principles of kolams and recreate them · SIH25107</p>
                <p className="mt-2 text-ink">Made with respect for everyone who draws a kolam each morning.</p>
            </div>
        </footer>
    );
};

export default Footer;
