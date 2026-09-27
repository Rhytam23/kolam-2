import React, { useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import { KolamProvider } from './components/KolamContext';
import { FloorArtDefs } from './components/landing/FloorArt';
import Landing from './pages/Landing';
import TraditionPage from './pages/TraditionPage';
import { AboutPage, NotFoundPage, ReadPage, StudioPage } from './pages/Pages';
import { ROUTES, traditionBySlug } from './data/traditions';
import { usePath } from './lib/router';

const page = (path: string) => {
    if (path === '/') return <Landing />;
    if (path === '/read') return <ReadPage />;
    if (path === '/studio') return <StudioPage />;
    if (path === '/about') return <AboutPage />;
    const tradition = traditionBySlug(path.slice(1));
    return tradition ? <TraditionPage key={tradition.slug} tradition={tradition} /> : <NotFoundPage />;
};

const App: React.FC = () => {
    const path = usePath();

    // Each page has its own title and description.
    useEffect(() => {
        const route = ROUTES.find(r => r.path === path);
        document.title = route?.title ?? 'Page not found · Chittara';
        document.querySelector('meta[name="description"]')?.setAttribute('content', route?.description ?? '');
    }, [path]);

    return (
        <KolamProvider>
            <div className="min-h-screen overflow-x-clip">
                <FloorArtDefs />
                <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:bg-paper focus:px-4 focus:py-2 focus:rounded-lg">Skip to the content</a>
                <Header path={path} />
                <main id="main">{page(path)}</main>
                <Footer />
            </div>
        </KolamProvider>
    );
};

export default App;
