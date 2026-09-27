import React, { useEffect, useState } from 'react';
import { BRAND } from '../lib/brand';

const LINKS = [
    { label: 'How it’s drawn', id: 'process' },
    { label: 'Tradition', id: 'about' },
    { label: 'Read a design', id: 'analyzer' },
    { label: 'Studio', id: 'generator' },
    { label: 'Draw it', id: 'walkthrough' },
    { label: 'Research', id: 'research' },
    { label: 'Feedback', id: 'contact' },
] as const;

export type SectionId = 'home' | (typeof LINKS)[number]['id'];

const Header: React.FC<{ onNavigate: (id: SectionId) => void }> = ({ onNavigate }) => {
    // 'top': clear, over the toran; 'floor': over the dark landing; 'paper': over the tools.
    const [look, setLook] = useState<'top' | 'floor' | 'paper'>('top');
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => {
            const tools = document.getElementById('tools')?.getBoundingClientRect().top ?? Infinity;
            setLook(tools <= 72 ? 'paper' : window.scrollY > 20 ? 'floor' : 'top');
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const dark = look !== 'paper';
    const bar = {
        top: 'bg-transparent',
        floor: 'bg-floor/90 backdrop-blur-md shadow-md border-b border-brass/25',
        paper: 'bg-paper/95 backdrop-blur-md shadow-sm border-b border-kaavi/10',
    }[look];
    const linkClass = dark ? 'text-rice hover:text-brass-light' : 'text-ink hover:text-kaavi';

    const go = (id: SectionId) => {
        onNavigate(id);
        setMenuOpen(false);
    };

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${menuOpen && look === 'top' ? 'bg-floor/95' : bar}`}>
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                <button className={`font-heading text-3xl font-bold ${dark ? 'brass-text' : 'gradient-text'}`} onClick={() => go('home')}>{BRAND}</button>
                <div className="hidden lg:flex items-center space-x-8">
                    {LINKS.map(link => (
                        <button key={link.id} onClick={() => go(link.id)} className={`${linkClass} transition-colors font-medium`}>
                            {link.label}
                        </button>
                    ))}
                </div>
                <button className={`lg:hidden ${dark ? 'text-rice' : 'text-ink'}`} onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu" aria-expanded={menuOpen}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                </button>
            </nav>
            {menuOpen && (
                <div className={`lg:hidden px-6 pb-6 pt-2 space-y-3 border-t ${dark ? 'border-brass/25' : 'border-kaavi/10'}`}>
                    {LINKS.map(link => (
                        <button key={link.id} onClick={() => go(link.id)} className={`block w-full text-left ${linkClass}`}>
                            {link.label}
                        </button>
                    ))}
                </div>
            )}
        </header>
    );
};

export default Header;
