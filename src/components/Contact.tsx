import React from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

const REPO_ISSUES_URL = 'https://github.com/Rhytam23/kolam-2/issues';

const Contact: React.FC = () => {
    return (
        <section className="py-20 px-4 container mx-auto">
            <h2 className="font-heading text-4xl md:text-5xl text-center mb-12 gradient-text">Share Feedback</h2>
            <div className="max-w-2xl mx-auto">
                <Card>
                    <div className="text-center space-y-4 p-6">
                        <p className="text-gray-300">
                            Tried it on your own kolam? Tell us what worked, what it missed, or share a .kolam.json
                            file. Bug reports and ideas are welcome as GitHub issues.
                        </p>
                        <Button
                            type="button"
                            onClick={() => window.open(REPO_ISSUES_URL, '_blank', 'noopener,noreferrer')}
                        >
                            Open a GitHub Issue
                        </Button>
                    </div>
                </Card>
            </div>
        </section>
    );
};

export default Contact;
