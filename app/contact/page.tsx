'use client';

import { Section, SectionTitle, Card, Button } from '@/components/UI';
import { Mail, Github, Linkedin, MapPin } from 'lucide-react';
import { useState } from 'react';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { name, email, subject, message } = formData;
        const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
        const mailtoLink = `mailto:MohabTohamyAbdallah@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen py-16">
            <Section>
                <SectionTitle subtitle="Let's discuss opportunities in Austria">
                    Get In Touch
                </SectionTitle>

                <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {/* Contact Information */}
                    <div className="space-y-6">
                        <Card>
                            <h3 className="text-2xl font-bold text-foreground mb-6">
                                Contact Information
                            </h3>
                            <p className="text-foreground/70 mb-6">
                                I&apos;m a Frontend &amp; Software Engineer open to new opportunities in Austria.
                                Whether it&apos;s frontend development, automation tooling, or full-stack work —
                                feel free to reach out and let&apos;s talk.
                            </p>

                            <div className="space-y-4">
                                <a
                                    href="mailto:MohabTohamyAbdallah@gmail.com"
                                    className="flex items-center gap-4 p-4 rounded-lg hover:bg-card transition-colors group"
                                >
                                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                                        <Mail className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-foreground/70">Email</p>
                                        <p className="text-foreground font-medium">
                                            MohabTohamyAbdallah@gmail.com
                                        </p>
                                    </div>
                                </a>

                                <a
                                    href="https://github.com/MohabTohamy"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-4 rounded-lg hover:bg-card transition-colors group"
                                >
                                    <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                                        <Github className="w-6 h-6 text-accent" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-foreground/70">GitHub</p>
                                        <p className="text-foreground font-medium">
                                            github.com/MohabTohamy
                                        </p>
                                    </div>
                                </a>

                                <a
                                    href="https://www.linkedin.com/in/mohab-tohamy/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-4 rounded-lg hover:bg-card transition-colors group"
                                >
                                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                                        <Linkedin className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-foreground/70">LinkedIn</p>
                                        <p className="text-foreground font-medium">
                                            linkedin.com/in/mohab-tohamy
                                        </p>
                                    </div>
                                </a>

                                <div className="flex items-center gap-4 p-4 rounded-lg">
                                    <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                                        <MapPin className="w-6 h-6 text-accent" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-foreground/70">Current Location</p>
                                        <p className="text-foreground font-medium">
                                            Riyadh, Saudi Arabia
                                        </p>
                                        <p className="text-xs text-accent font-medium mt-1">
                                            🇦🇹 Targeting: Austria (St. Pölten, Vienna, Linz)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Availability Card */}
                        <Card className="bg-linear-to-br from-red-500/10 to-white/5 border-2 border-red-500/20">
                            <h4 className="text-lg font-semibold text-foreground mb-3">
                                🇦🇹 Seeking Full-Time Opportunities in Austria
                            </h4>
                            <p className="text-foreground/70 mb-4">
                                I&apos;m interested in positions involving:
                            </p>
                            <ul className="space-y-2 text-foreground/80">
                                <li className="flex items-start gap-2">
                                    <span className="text-primary mt-1">✓</span>
                                    Frontend Development (React, Next.js, TypeScript)
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-accent mt-1">✓</span>
                                    Full-Stack Web Applications
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary mt-1">✓</span>
                                    Python Automation & Data Tools
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-accent mt-1">✓</span>
                                    Software Engineering roles in any domain
                                </li>
                            </ul>
                            <div className="mt-4 pt-4 border-t border-foreground/10">
                                <p className="text-sm text-foreground/70">
                                    Open to relocation and visa sponsorship discussions
                                </p>
                            </div>
                        </Card>
                    </div>

                    {/* Contact Form */}
                    <Card>
                        <h3 className="text-2xl font-bold text-foreground mb-6">
                            Send a Message
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-foreground mb-2"
                                >
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 bg-background border border-primary/20 rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors"
                                    placeholder="Your name"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-foreground mb-2"
                                >
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 bg-background border border-primary/20 rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors"
                                    placeholder="your.email@example.com"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="subject"
                                    className="block text-sm font-medium text-foreground mb-2"
                                >
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 bg-background border border-primary/20 rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors"
                                    placeholder="What is this about?"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="message"
                                    className="block text-sm font-medium text-foreground mb-2"
                                >
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows={6}
                                    className="w-full px-4 py-2 bg-background border border-primary/20 rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                                    placeholder="Your message..."
                                />
                            </div>

                            <Button type="submit" variant="primary" fullWidth>
                                Send Message
                            </Button>
                        </form>
                    </Card>
                </div>

                {/* Quick Links */}
                <div className="mt-12 text-center">
                    <h3 className="text-xl font-semibold text-foreground mb-6">
                        Explore More
                    </h3>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Button href="/projects" variant="outline">
                            View Projects
                        </Button>
                        <Button href="/tools" variant="outline">
                            Try Tools
                        </Button>
                        <Button href="/map-demo" variant="outline">
                            Map Demo
                        </Button>
                        <Button href="/dashboard" variant="outline">
                            Dashboard
                        </Button>
                    </div>
                </div>
            </Section>
        </div>
    );
}
