import React from 'react';

const teamMembers = [
    { name: 'Rohan Verma', role: 'System Direction & Product Framing', img: 'https://picsum.photos/seed/rohan/400/400' },
    { name: 'Priya Singh', role: 'Frontend Experience Engineering', img: 'https://picsum.photos/seed/priya/400/400' },
    { name: 'Arjun Mehta', role: 'Backend & Detection Pipeline', img: 'https://picsum.photos/seed/arjun/400/400' },
    { name: 'Sneha Patel', role: 'Visual Identity & Interface Design', img: 'https://picsum.photos/seed/sneha/400/400' },
    { name: 'Vikram Rao', role: 'Image Processing & Geometry Logic', img: 'https://picsum.photos/seed/vikram/400/400' },
    { name: 'Anjali Desai', role: 'Research, Storytelling & Documentation', img: 'https://picsum.photos/seed/anjali/400/400' },
];

const Team: React.FC = () => {
    return (
        <section className="py-20 px-4 bg-[#0c0a18] bg-opacity-50">
            <div className="container mx-auto text-center">
                <h2 className="font-heading text-4xl md:text-5xl mb-4 gradient-text">Project Contributors</h2>
                <p className="text-xl text-gray-400 mb-2">Working title: <span className="font-bold text-white">SOLVIX</span></p>
                <p className="text-lg text-gray-500 mb-12 max-w-3xl mx-auto">A cross-functional prototype team combining product thinking, visual design, procedural logic, and computer-vision experimentation.</p>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {teamMembers.map((member, index) => (
                        <div key={index} className="text-center group">
                            <div className="relative">
                                <img src={member.img} alt={member.name} className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-transparent group-hover:border-orange-500 transition-all duration-300 transform group-hover:scale-105" />
                            </div>
                            <h3 className="mt-4 font-bold text-lg text-white">{member.name}</h3>
                            <p className="text-sm text-orange-400">{member.role}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Team;
