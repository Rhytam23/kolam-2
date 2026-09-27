import React, { useEffect, useState } from 'react';

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
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const go = (id: SectionId) => {
        onNavigate(id);
        setMenuOpen(false);
    };

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-paper/95 backdrop-blur-md shadow-sm border-b border-kaavi/10' : 'bg-transparent'}`}>
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                <button className="font-heading text-3xl font-bold gradient-text" onClick={() => go('home')}>SOLVIX</button>
                <div className="hidden md:flex items-center space-x-8">
                    {LINKS.map(link => (
                        <button key={link.id} onClick={() => go(link.id)} className="text-ink hover:text-kaavi transition-colors font-medium">
                            {link.label}
                        </button>
                    ))}
                </div>
                <button className="md:hidden text-ink" onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu" aria-expanded={menuOpen}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                </button>
            </nav>
            {menuOpen && (
                <div className="md:hidden border-t border-kaavi/10 bg-paper/95 backdrop-blur-md px-6 pb-6 pt-2 space-y-3">
                    {LINKS.map(link => (
                        <button key={link.id} onClick={() => go(link.id)} className="block w-full text-left text-ink hover:text-kaavi">
                            {link.label}
                        </button>
                    ))}
                </div>
            )}
        </header>
    );
};

export default Header;
