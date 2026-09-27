import React, { useEffect, useRef, useState } from 'react';
import { BRAND } from '../lib/brand';
import { Link } from '../lib/router';
import { TRADITIONS } from '../data/traditions';

const PAGES = [
    { label: 'Read a photo', to: '/read' },
    { label: 'Studio', to: '/studio' },
    { label: 'About', to: '/about' },
] as const;

const Header: React.FC<{ path: string }> = ({ path }) => {
    // 'top': clear, over the page's first section; 'floor': over a dark section; 'paper': over the tools.
    const [look, setLook] = useState<'top' | 'floor' | 'paper'>('top');
    const [menuOpen, setMenuOpen] = useState(false);
    const [formsOpen, setFormsOpen] = useState(false);
    const forms = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onScroll = () => {
            const paper = document.querySelector('[data-paper]')?.getBoundingClientRect().top ?? Infinity;
            setLook(paper <= 72 ? 'paper' : window.scrollY > 20 ? 'floor' : 'top');
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [path]);

    // Close the menus when the page changes, on Escape, or on a click elsewhere.
    useEffect(() => { setMenuOpen(false); setFormsOpen(false); }, [path]);
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setFormsOpen(false); setMenuOpen(false); } };
        const onClick = (e: MouseEvent) => { if (forms.current && !forms.current.contains(e.target as Node)) setFormsOpen(false); };
        window.addEventListener('keydown', onKey);
        window.addEventListener('mousedown', onClick);
        return () => {
            window.removeEventListener('keydown', onKey);
            window.removeEventListener('mousedown', onClick);
        };
    }, []);

    const dark = look !== 'paper';
    const bar = {
        top: 'bg-transparent',
        floor: 'bg-floor/90 backdrop-blur-md shadow-md border-b border-brass/25',
        paper: 'bg-paper/95 backdrop-blur-md shadow-sm border-b border-kaavi/10',
    }[look];
    const linkClass = dark ? 'text-rice hover:text-brass-light' : 'text-ink hover:text-kaavi';
    const current = (to: string) => (path === to ? { 'aria-current': 'page' as const } : {});

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${(menuOpen || formsOpen) && look === 'top' ? 'bg-floor/95' : bar}`}>
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center" aria-label="Main">
                <Link to="/" className={`font-heading text-3xl font-bold ${dark ? 'brass-text' : 'gradient-text'}`}>{BRAND}</Link>
                <div className="hidden lg:flex items-center space-x-8">
                    <div className="relative" ref={forms}>
                        <button
                            type="button"
                            className={`${linkClass} transition-colors font-medium`}
                            aria-expanded={formsOpen}
                            aria-haspopup="true"
                            onClick={() => setFormsOpen(o => !o)}
                        >
                            Art forms ▾
                        </button>
                        {formsOpen && (
                            <div className="absolute right-0 mt-3 w-[34rem] rounded-2xl bg-paper shadow-xl ring-1 ring-kaavi/15 p-3 grid grid-cols-2 gap-1">
                                {TRADITIONS.map(t => (
                                    <Link key={t.slug} to={`/${t.slug}`} {...current(`/${t.slug}`)} className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-kaavi/10">
                                        <span className="h-8 w-8 shrink-0 rounded-full ring-2 ring-white shadow" style={{ background: `linear-gradient(135deg, ${t.theme.floor} 55%, ${t.theme.brass} 55%)` }} aria-hidden />
                                        <span>
                                            <span className="block font-semibold text-ink">{t.name} <span lang={t.script.lang} className="font-script font-normal text-muted">{t.script.word}</span></span>
                                            <span className="block text-xs text-muted">{t.region}</span>
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                    {PAGES.map(p => (
                        <Link key={p.to} to={p.to} {...current(p.to)} className={`${linkClass} transition-colors font-medium`}>{p.label}</Link>
                    ))}
                </div>
                <button className={`lg:hidden ${dark ? 'text-rice' : 'text-ink'}`} onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu" aria-expanded={menuOpen}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                </button>
            </nav>
            {menuOpen && (
                <div className={`lg:hidden max-h-[80vh] overflow-y-auto px-6 pb-6 pt-2 border-t ${dark ? 'border-brass/25' : 'border-kaavi/10'}`}>
                    <p className={`text-xs uppercase tracking-widest mb-2 ${dark ? 'text-brass-light' : 'text-muted'}`}>Art forms</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
                        {TRADITIONS.map(t => (
                            <Link key={t.slug} to={`/${t.slug}`} {...current(`/${t.slug}`)} className={`block ${linkClass}`}>{t.name}</Link>
                        ))}
                    </div>
                    <div className={`space-y-3 border-t pt-3 ${dark ? 'border-brass/25' : 'border-kaavi/10'}`}>
                        <Link to="/" className={`block ${linkClass}`}>Home</Link>
                        {PAGES.map(p => <Link key={p.to} to={p.to} {...current(p.to)} className={`block ${linkClass}`}>{p.label}</Link>)}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
