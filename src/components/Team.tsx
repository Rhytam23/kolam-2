
import React from 'react';
import { Card } from './ui/Card';

const teamMembers = [
    { name: 'Rohan Verma', role: 'Team Lead & AI Specialist', img: 'https://picsum.photos/seed/rohan/400/400' },
    { name: 'Priya Singh', role: 'Frontend Developer (React)', img: 'https://picsum.photos/seed/priya/400/400' },
    { name: 'Arjun Mehta', role: 'Backend Developer (Python)', img: 'https://picsum.photos/seed/arjun/400/400' },
    { name: 'Sneha Patel', role: 'UI/UX Designer', img: 'https://picsum.photos/seed/sneha/400/400' },
    { name: 'Vikram Rao', role: 'Computer Vision Engineer', img: 'https://picsum.photos/seed/vikram/400/400' },
    { name: 'Anjali Desai', role: 'Research & Documentation', img: 'https://picsum.photos/seed/anjali/400/400' },
];

const SocialIcon: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">{children}</a>
);

const Team: React.FC = () => {
    return (
        <section className="py-20 px-4 bg-[#0c0a18] bg-opacity-50">
            <div className="container mx-auto text-center">
                <h2 className="font-heading text-4xl md:text-5xl mb-4 gradient-text">Meet the Team</h2>
                <p className="text-xl text-gray-400 mb-2">Team Name: <span className="font-bold text-white">SOLVIX</span></p>
                <p className="text-lg text-gray-500 mb-12">Team ID: <span className="font-bold text-gray-300">57239</span></p>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {teamMembers.map((member, index) => (
                        <div key={index} className="text-center group">
                            <div className="relative">
                                <img src={member.img} alt={member.name} className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-transparent group-hover:border-orange-500 transition-all duration-300 transform group-hover:scale-105" />
                            </div>
                            <h3 className="mt-4 font-bold text-lg text-white">{member.name}</h3>
                            <p className="text-sm text-orange-400">{member.role}</p>
                            <div className="flex justify-center space-x-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <SocialIcon><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.23 0H1.77C.79 0 0 .79 0 1.77v20.46C0 23.21.79 24 1.77 24h20.46c.98 0 1.77-.79 1.77-1.77V1.77C24 .79 23.21 0 22.23 0zM7.06 20.45h-3.5V8.97h3.5v11.48zM5.31 7.42c-1.15 0-2.08-.93-2.08-2.08s.93-2.08 2.08-2.08 2.08.93 2.08 2.08-.93 2.08-2.08 2.08zm15.14 13.03h-3.5v-5.5c0-1.31-.02-3-1.82-3-1.83 0-2.11 1.43-2.11 2.9v5.6h-3.5V8.97h3.36v1.54h.05c.47-.88 1.61-1.82 3.31-1.82 3.55 0 4.2 2.34 4.2 5.38v6.23z" /></svg></SocialIcon>
                                <SocialIcon><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg></SocialIcon>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Team;
