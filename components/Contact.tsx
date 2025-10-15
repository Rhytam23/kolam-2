
import React from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Label } from './ui/Label';
import { Input } from './ui/Input';

const Contact: React.FC = () => {
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Thank you for your feedback!');
    };

    return (
        <section className="py-20 px-4 container mx-auto">
            <h2 className="font-heading text-4xl md:text-5xl text-center mb-12 gradient-text">Get In Touch</h2>
            <div className="max-w-2xl mx-auto">
                <Card>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" type="text" placeholder="Your Name" required />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="your.email@example.com" required />
                        </div>
                        <div>
                            <Label htmlFor="message">Message</Label>
                            <textarea id="message" rows={4} placeholder="Your thoughts, questions, or feedback..." required className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-orange-500 focus:border-orange-500 transition-colors"></textarea>
                        </div>
                        <div className="text-center">
                            <Button type="submit">Send Message</Button>
                        </div>
                    </form>
                </Card>
            </div>
        </section>
    );
};

export default Contact;
