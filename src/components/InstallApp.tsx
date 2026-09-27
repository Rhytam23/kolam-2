import React, { useEffect, useState } from 'react';

/** The browser's install prompt (Chrome, Edge and Android browsers). */
interface InstallPrompt extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const isStandalone = () =>
    typeof window !== 'undefined' && (window.matchMedia?.('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);

const isApple = () => typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent) && 'ontouchend' in document;

/** Offers to add the site to the home screen of a phone or tablet, where it opens like an app. */
const InstallApp: React.FC = () => {
    const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
    const [installed, setInstalled] = useState(isStandalone);

    useEffect(() => {
        const onPrompt = (e: Event) => {
            e.preventDefault();
            setPrompt(e as InstallPrompt);
        };
        const onInstalled = () => setInstalled(true);
        window.addEventListener('beforeinstallprompt', onPrompt);
        window.addEventListener('appinstalled', onInstalled);
        return () => {
            window.removeEventListener('beforeinstallprompt', onPrompt);
            window.removeEventListener('appinstalled', onInstalled);
        };
    }, []);

    if (installed) return <p className="text-rice/80">You are using the installed app. It works offline, except for reading photos.</p>;

    return (
        <div className="space-y-2">
            <p className="text-rice/80">
                Add SOLVIX to your phone or tablet's home screen. It opens full screen like an app, and the studio, guide and practice work offline.
            </p>
            {prompt ? (
                <button
                    type="button"
                    className="rounded-full bg-gradient-to-b from-brass-light to-brass px-4 py-2 font-semibold text-floor hover:from-[#F3D48C]"
                    onClick={async () => {
                        await prompt.prompt();
                        const { outcome } = await prompt.userChoice;
                        if (outcome === 'accepted') setInstalled(true);
                        setPrompt(null);
                    }}
                >
                    Install the app
                </button>
            ) : isApple() ? (
                <p className="text-rice">On iPhone or iPad: in Safari, tap <strong>Share</strong>, then <strong>Add to Home Screen</strong>.</p>
            ) : (
                <p className="text-rice">In your browser's menu, choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.</p>
            )}
        </div>
    );
};

export default InstallApp;
