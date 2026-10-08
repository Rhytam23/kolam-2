import React from 'react';
import CultureDivider from './culture/CultureDivider';
import FrameBar from './culture/FrameBar';
import { Ornament } from './culture/Ornaments';
import { useCulture } from './culture/CultureContext';
import { KIT_LIST } from '../lib/culture';
import InstallApp from './InstallApp';
import { Link } from '../lib/router';
import { READ_A_PHOTO, TRADITIONS } from '../data/traditions';
import { BRAND } from '../lib/brand';

const REPO = 'https://github.com/Rhytam23/kolam-2';

const Footer: React.FC = () => {
    const { ornament } = useCulture();
    return (
    <footer className="floor-bg text-rice pt-0 pb-8 px-4">
        <FrameBar className="-mx-4 mb-10" />
        <CultureDivider tone="rice" spacing={40} className="mb-10" index={8} />
        <nav aria-label="Art forms and pages" className="container mx-auto mb-10 text-sm">
            <p className="font-semibold text-brass-light mb-3">Art forms</p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
                {TRADITIONS.map(t => (
                    <li key={t.slug}><Link to={`/${t.slug}`} className="text-rice underline decoration-brass/60 underline-offset-4 hover:text-brass-light">{t.name}</Link></li>
                ))}
            </ul>
            <p className="font-semibold text-brass-light mt-5 mb-3">Tools</p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
                {[['/', 'Home'], [READ_A_PHOTO, 'Read a photo'], ['/studio', 'Design Studio'], ['/about', 'About and research']].map(([to, label]) => (
                    <li key={to}><Link to={to} className="text-rice underline decoration-brass/60 underline-offset-4 hover:text-brass-light">{label}</Link></li>
                ))}
            </ul>
        </nav>
        <div className="container mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-sm border-t border-brass/30 pt-8">
            <div>
                <p className="font-heading text-2xl brass-text">{BRAND}</p>
                <p className="mt-2 text-rice/80">
                    Reading, teaching and drawing the floor art of India, from kolam and rangoli to alpana, pookalam and mandana.
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
            <Ornament id={ornament} className="h-8 w-8 mx-auto mb-2" />
            <p className="flex flex-wrap justify-center gap-x-4 gap-y-1 font-script text-lg text-brass-light" aria-label="Greetings in the languages of the art forms">
                {Array.from(new Map(KIT_LIST.map(k => [k.greeting.word, k.greeting])).values()).map(g => <span key={g.word} lang={g.lang}>{g.word}</span>)}
            </p>
            <p className="text-rice">Made with respect for everyone who draws a kolam each morning.</p>
            <p>&copy; {new Date().getFullYear()} {BRAND} team · An independent student project, not an official Government of India website.</p>
        </div>
    </footer>
    );
};

export default Footer;
