import React from 'react';

const REPO = 'https://github.com/Rhytam23/kolam-2';

const Footer: React.FC = () => (
    <footer className="bg-sand/70 border-t border-kaavi/15 pt-12 pb-8 px-4">
        <div className="container mx-auto grid gap-8 md:grid-cols-3 text-sm">
            <div>
                <p className="font-heading text-2xl gradient-text">SOLVIX Kolam AI</p>
                <p className="mt-2 text-muted">
                    Reading and teaching the design principles of kolam, rangoli, muggulu, rangavalli, alpana and mandana.
                    Built for Smart India Hackathon 2025, problem SIH25107.
                </p>
            </div>
            <div>
                <p className="font-semibold text-ink mb-2">Your photos</p>
                <p className="text-muted">
                    Photos are analysed on our server and are not stored. Saved designs stay in your own browser unless you export them.
                </p>
            </div>
            <div>
                <p className="font-semibold text-ink mb-2">Open source</p>
                <ul className="space-y-1">
                    <li><a className="text-kaavi hover:underline" href={REPO} target="_blank" rel="noopener noreferrer">Source code (MIT licence)</a></li>
                    <li><a className="text-kaavi hover:underline" href={`${REPO}/issues`} target="_blank" rel="noopener noreferrer">Report a problem or share feedback</a></li>
                </ul>
            </div>
        </div>
        <div className="container mx-auto mt-10 pt-6 border-t border-kaavi/15 text-center text-muted text-sm space-y-1">
            <p className="text-ink">Made with respect for everyone who draws a kolam each morning.</p>
            <p>&copy; {new Date().getFullYear()} SOLVIX team · An independent student project, not an official Government of India website.</p>
        </div>
    </footer>
);

export default Footer;
