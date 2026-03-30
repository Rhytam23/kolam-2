import React, { useState, useEffect } from 'react';

interface HeaderProps {
    scrollToSection: (section: 'home' | 'about' | 'analyzer' | 'generator' | 'walkthrough' | 'research' | 'team' | 'contact') => void;
}

const Header: React.FC<HeaderProps> = ({ scrollToSection }) => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { label: 'About', key: 'about' },
        { label: 'Analyzer', key: 'analyzer' },
        { label: 'Generator', key: 'generator' },
        { label: 'Walkthrough', key: 'walkthrough' },
        { label: 'Research', key: 'research' },
        { label: 'Team', key: 'team' },
        { label: 'Contact', key: 'contact' },
    ] as const;

    const handleNavigate = (section: HeaderProps['scrollToSection'] extends (arg: infer T) => void ? T : never) => {
        scrollToSection(section);
        setMobileOpen(false);
    };

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0c0a18]/80 backdrop-blur-md shadow-lg shadow-indigo-900/10' : 'bg-transparent'}`}>
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                <div className="font-heading text-3xl font-bold cursor-pointer gradient-text" onClick={() => handleNavigate('home')}>
                    SOLVIX
                </div>
                <div className="hidden md:flex items-center space-x-8">
                    {navLinks.map((link) => (
                        <button
                            key={link.key}
                            onClick={() => handleNavigate(link.key)}
                            className="text-gray-300 hover:text-white transition-colors duration-200 relative group"
                        >
                            {link.label}
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center"></span>
                        </button>
                    ))}
                </div>
                <div className="md:hidden">
                    <button className="text-white focus:outline-none" onClick={() => setMobileOpen(prev => !prev)} aria-label="Toggle menu">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                    </button>
                </div>
            </nav>
            {mobileOpen && (
                <div className="md:hidden border-t border-white/10 bg-[#0c0a18]/95 backdrop-blur-md px-6 pb-6 pt-2 space-y-3">
                    {navLinks.map((link) => (
                        <button
                            key={link.key}
                            onClick={() => handleNavigate(link.key)}
                            className="block w-full text-left text-gray-200 hover:text-saffron transition-colors duration-200"
                        >
                            {link.label}
                        </button>
                    ))}
                </div>
            )}
        </header>
    );
};

export default Header;
