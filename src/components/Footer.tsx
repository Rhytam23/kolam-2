import React from 'react';
import Diya from './landing/Diya';
import KolamDivider from './landing/KolamDivider';

const REPO = 'https://github.com/Rhytam23/kolam-2';

const Footer: React.FC = () => (
    <footer className="floor-bg text-rice pt-10 pb-8 px-4">
        <KolamDivider tone="rice" dots={15} className="mb-10" />
        <div className="container mx-auto grid gap-8 md:grid-cols-3 text-sm">
            <div>
                <p className="font-heading text-2xl brass-text">SOLVIX Kolam AI</p>
                <p className="mt-2 text-rice/80">
                    Reading and teaching the design principles of kolam, rangoli, muggulu, rangavalli, alpana and mandana.
                    Built for Smart India Hackathon 2025, problem SIH25107.
                </p>
            </div>
            <div>
                <p className="font-semibold text-brass-light mb-2">Your photos</p>
                <p className="text-rice/80">
                    Photos are analysed on our server and are not stored. Saved designs stay in your own browser unless you export them.
                </p>
            </div>
            <div>
                <p className="font-semibold text-brass-light mb-2">Open source</p>
                <ul className="space-y-1">
                    <li><a className="text-rice underline decoration-brass/60 underline-offset-4 hover:text-brass-light" href={REPO} target="_blank" rel="noopener noreferrer">Source code (MIT licence)</a></li>
                    <li><a className="text-rice underline decoration-brass/60 underline-offset-4 hover:text-brass-light" href={`${REPO}/issues`} target="_blank" rel="noopener noreferrer">Report a problem or share feedback</a></li>
                </ul>
            </div>
        </div>
        <div className="container mx-auto mt-10 pt-6 border-t border-brass/30 text-center text-rice/80 text-sm space-y-1">
            <Diya className="h-8 w-8 mx-auto mb-2" />
            <p className="text-rice">Made with respect for everyone who draws a kolam each morning.</p>
            <p>&copy; {new Date().getFullYear()} SOLVIX team · An independent student project, not an official Government of India website.</p>
        </div>
    </footer>
);

export default Footer;
