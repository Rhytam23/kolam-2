import React from 'react';
import Diya from './landing/Diya';
import KolamDivider from './landing/KolamDivider';
import InstallApp from './InstallApp';
import { BRAND } from '../lib/brand';

const REPO = 'https://github.com/Rhytam23/kolam-2';

const Footer: React.FC = () => (
    <footer className="floor-bg text-rice pt-10 pb-8 px-4">
        <KolamDivider tone="rice" spacing={40} className="mb-10" />
        <div className="container mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-sm">
            <div>
                <p className="font-heading text-2xl brass-text">{BRAND}</p>
                <p className="mt-2 text-rice/80">
                    Reading and teaching the design principles of kolam, rangoli, muggulu, rangavalli, alpana and mandana.
                </p>
            </div>
            <div>
                <p className="font-semibold text-brass-light mb-2">Your photos</p>
                <p className="text-rice/80">
                    Photos are read on our server and deleted straight away; nothing is stored or shared. Saved designs stay on your own device. No accounts, cookies or tracking.
                    {' '}<a className="text-rice underline decoration-brass/60 underline-offset-4 hover:text-brass-light" href="/privacy.html">Read more</a>
                </p>
            </div>
            <div id="install">
                <p className="font-semibold text-brass-light mb-2">Use it as an app</p>
                <InstallApp />
            </div>
            <div>
                <p className="font-semibold text-brass-light mb-2">Open source</p>
                <ul className="space-y-1">
                    <li><a className="text-rice underline decoration-brass/60 underline-offset-4 hover:text-brass-light" href={REPO} target="_blank" rel="noopener noreferrer">Source code (MIT licence)</a></li>
                    <li><a className="text-rice underline decoration-brass/60 underline-offset-4 hover:text-brass-light" href={`${REPO}/issues`} target="_blank" rel="noopener noreferrer">Report a problem or share feedback</a></li>
                    <li><a className="text-rice underline decoration-brass/60 underline-offset-4 hover:text-brass-light" href="/privacy.html">Privacy and data safety</a></li>
                    <li><a className="text-rice underline decoration-brass/60 underline-offset-4 hover:text-brass-light" href="/terms.html">Terms of use</a></li>
                </ul>
            </div>
        </div>
        <div className="container mx-auto mt-10 pt-6 border-t border-brass/30 text-center text-rice/80 text-sm space-y-1">
            <Diya className="h-8 w-8 mx-auto mb-2" />
            <p className="text-rice">Made with respect for everyone who draws a kolam each morning.</p>
            <p>&copy; {new Date().getFullYear()} {BRAND} team · An independent student project, not an official Government of India website.</p>
        </div>
    </footer>
);

export default Footer;
