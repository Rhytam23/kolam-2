import React from 'react';
import FrameBar from './culture/FrameBar';
import { Ornament } from './culture/Ornaments';
import { useCulture } from './culture/CultureContext';
import { KIT_LIST } from '../lib/culture';
import InstallApp from './InstallApp';
import { Link } from '../lib/router';
import { READ_A_PHOTO, TRADITIONS } from '../data/traditions';
import { BRAND } from '../lib/brand';

const REPO = 'https://github.com/Rhytam23/kolam-2';
// inline-block with padding and an equal negative margin: a 44px tap target, the same spacing on the page.
const link = 'inline-block min-w-10 py-3 -my-3 text-rice/90 transition-colors hover:text-brass-light focus:outline-none focus-visible:text-brass-light focus-visible:underline underline-offset-4';

const Heading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brass-light">{children}</p>
);

const Footer: React.FC = () => {
    const { ornament } = useCulture();
    const greetings = Array.from(new Map(KIT_LIST.map(k => [k.greeting.word, k.greeting])).values());
    const pages: Array<[string, string]> = [['/', 'Home'], [READ_A_PHOTO, 'Read a photo'], ['/studio', 'Design Studio'], ['/about', 'About and research']];
    return (
        <footer className="floor-bg text-rice px-4 pb-8">
            <FrameBar className="-mx-4" />

            {/* Padding, not margin: a margin would show the cream page behind the dark footer. */}
            <div className="container mx-auto max-w-6xl pt-14">
                <div className="grid gap-12 lg:grid-cols-[1.15fr_1.4fr_0.8fr_1fr] lg:gap-10">
                    {/* Who we are, and the app */}
                    <div>
                        <div className="flex items-center gap-3">
                            <Ornament id={ornament} className="h-9 w-9 shrink-0" />
                            <p className="font-heading text-3xl brass-text">{BRAND}</p>
                        </div>
                        <p className="mt-4 max-w-sm text-sm leading-relaxed text-rice/80">
                            Reading, teaching and drawing the floor art of India, from kolam and rangoli to alpana, pookalam and mandana, and the henna of the hand.
                        </p>
                        <div id="install" className="mt-6 max-w-sm rounded-2xl border border-brass/30 bg-black/10 p-4 text-sm">
                            <p className="mb-2 font-semibold text-brass-light">Use it as an app</p>
                            <InstallApp />
                        </div>
                    </div>

                    {/* Art forms */}
                    <nav aria-label="Art forms">
                        <Heading>Art forms</Heading>
                        <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                            {TRADITIONS.map(t => (
                                <li key={t.slug}><Link to={`/${t.slug}`} className={link}>{t.name}</Link></li>
                            ))}
                        </ul>
                    </nav>

                    {/* Pages */}
                    <nav aria-label="Tools and pages">
                        <Heading>Explore</Heading>
                        <ul className="space-y-2.5 text-sm">
                            {pages.map(([to, label]) => (
                                <li key={to}><Link to={to} className={link}>{label}</Link></li>
                            ))}
                        </ul>
                    </nav>

                    {/* Legal */}
                    <nav aria-label="Legal and help">
                        <Heading>Legal and help</Heading>
                        <ul className="space-y-2.5 text-sm">
                            <li><a className={link} href="/legal.html">Licence and legal notice</a></li>
                            <li><a className={link} href="/terms.html">Terms of use</a></li>
                            <li><a className={link} href="/privacy.html">Privacy and data safety</a></li>
                            <li><a className={link} href={REPO} target="_blank" rel="noopener noreferrer">Source code</a></li>
                            <li><a className={link} href={`${REPO}/issues`} target="_blank" rel="noopener noreferrer">Report a problem</a></li>
                        </ul>
                        <p className="mt-5 text-xs leading-relaxed text-rice/70">Photos are read on our server and deleted straight away. No accounts, cookies or tracking.</p>
                    </nav>
                </div>

                <p className="mt-12 flex flex-wrap justify-center gap-x-5 gap-y-1 border-t border-brass/25 pt-8 font-script text-lg text-brass-light/90" aria-label="Greetings in the languages of the art forms">
                    {greetings.map(g => <span key={g.word} lang={g.lang}>{g.word}</span>)}
                </p>

                <p className="mt-6 text-center text-xs text-rice/70">&copy; {new Date().getFullYear()} Rhytam Biswas.</p>
            </div>
        </footer>
    );
};

export default Footer;
