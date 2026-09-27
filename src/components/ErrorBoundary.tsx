import React from 'react';

interface State { failed: boolean }

/** If one part of the page breaks, show a short note there instead of a blank page. */
export class ErrorBoundary extends React.Component<{ children: React.ReactNode; name: string }, State> {
    state: State = { failed: false };

    static getDerivedStateFromError(): State {
        return { failed: true };
    }

    render() {
        if (!this.state.failed) return this.props.children;
        return (
            <div role="alert" className="container mx-auto px-4 py-16 text-center">
                <p className="font-heading text-2xl text-kaavi">Sorry, the {this.props.name} could not be shown.</p>
                <p className="mt-2 text-muted">The rest of the page still works. Reloading usually fixes it.</p>
                <button type="button" className="mt-4 rounded-full bg-kaavi px-6 py-2 font-semibold text-paper" onClick={() => window.location.reload()}>
                    Reload the page
                </button>
            </div>
        );
    }
}
