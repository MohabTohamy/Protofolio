'use client';

import { motion } from 'framer-motion';
import { Section, SectionTitle, Card } from '@/components/UI';
import { experiences, skills } from '@/data/experience';
import { Code, Wrench, Map, Database } from 'lucide-react';
import FunnySurvey from '@/components/FunnySurvey';

export default function AboutPage() {
    return (
        <div className="min-h-screen py-16">
            <Section>
                <SectionTitle subtitle="Software Engineer">
                    About Me
                </SectionTitle>

                {/* Introduction */}
                <Card className="mb-12 bg-linear-to-br from-primary/5 to-accent/5">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-2xl font-bold text-foreground mb-4">
                            Software Engineer. Frontend Developer. Data Automation.
                        </h2>
                        <p className="text-foreground/80 mb-4 leading-relaxed">
                            I am Mohab Tohamy — a Software Engineer and Frontend Developer
                            specializing in data automation, web application development, and
                            server deployment. I build the tools, platforms, and pipelines that
                            turn messy raw data into clean, actionable output for engineering teams.
                        </p>
                        <p className="text-foreground/80 mb-4 leading-relaxed">
                            On the frontend, I build modern web applications and dashboards using
                            React and Next.js, and I handle the full deployment cycle — publishing
                            and deploying applications to production servers running IIS (Internet
                            Information Services). I own the process from code to live, making sure
                            everything runs correctly on the server.
                        </p>
                        <p className="text-foreground/80 leading-relaxed">
                            On the automation side, I write Python to solve whatever data problem
                            lands on the table — processing and validating raw output from survey
                            machines like LCMS, building standalone EXE tools that classify files
                            and generate Excel reports for teams, building AI-integrated desktop
                            automation programs, and handling data splitting, format conversion,
                            error detection, and cleanup at scale. If there is a data problem,
                            I build the software that fixes it.
                        </p>
                    </div>
                </Card>

                {/* Funny Survey Component */}
                <div className="mb-12">
                    <FunnySurvey />
                </div>

                {/* Why Austria Section */}
                <Card className="mb-12 bg-linear-to-br from-red-500/5 via-white/5 to-red-500/5 border-2 border-red-500/20">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-6">
                            <h3 className="text-3xl font-bold text-foreground mb-2">
                                Why Austria? 🇦🇹
                            </h3>
                            <div className="w-20 h-1 bg-linear-to-r from-red-500 to-white mx-auto rounded-full"></div>
                        </div>

                        <div className="text-center space-y-4 mb-6">
                            <p className="text-foreground/80 leading-relaxed text-lg">
                                Honestly? My best friends — the people I grew up with — are Austrian,
                                and they are living in St. Pölten right now.
                            </p>
                            <p className="text-foreground/80 leading-relaxed">
                                They have been showing me photos of the country for years and honestly
                                it looks absolutely beautiful. We have been waiting for the chance to
                                meet again, and Austria is where that happens. That is the real answer. 😄
                            </p>
                        </div>

                        <div className="bg-card/50 rounded-lg p-6 border border-primary/20">
                            <p className="text-foreground font-medium text-center">
                                <span className="text-primary">Work Authorization:</span> Currently preparing for opportunities in Austria.
                                Open to discussing visa sponsorship and relocation support.
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Core Competencies */}
                <div className="mb-12">
                    <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
                        Core Competencies
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                icon: <Code className="w-8 h-8 text-primary" />,
                                title: 'Frontend Development',
                                skills: [
                                    'React & Next.js',
                                    'TypeScript',
                                    'Tailwind CSS',
                                    'Interactive dashboards',
                                    '3D graphics with Three.js',
                                ],
                            },
                            {
                                icon: <Database className="w-8 h-8 text-accent" />,
                                title: 'Python & Automation',
                                skills: [
                                    'Data processing & validation',
                                    'EXE desktop tools (PyInstaller)',
                                    'Excel automation (OpenPyXL)',
                                    'AI-integrated automation',
                                    'Batch file processing',
                                ],
                            },
                            {
                                icon: <Wrench className="w-8 h-8 text-primary" />,
                                title: 'Deployment & Server',
                                skills: [
                                    'IIS server deployment',
                                    'Application publishing',
                                    'Production environment setup',
                                    'Build & release management',
                                    'AWS (familiar)',
                                ],
                            },
                            {
                                icon: <Map className="w-8 h-8 text-accent" />,
                                title: 'Data & GIS',
                                skills: [
                                    'Map visualization',
                                    'Pandas & NumPy',
                                    'GeoJSON & Shapefiles',
                                    'GeoPandas & QGIS & ArcGIS',
                                    'Format conversion & cleaning',
                                ],
                            },
                        ].map((competency, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card>
                                    <div className="mb-4">{competency.icon}</div>
                                    <h4 className="text-lg font-semibold text-foreground mb-3">
                                        {competency.title}
                                    </h4>
                                    <ul className="space-y-1">
                                        {competency.skills.map((skill, idx) => (
                                            <li
                                                key={idx}
                                                className="text-sm text-foreground/70 flex items-start gap-2"
                                            >
                                                <span className="text-primary mt-1">•</span>
                                                {skill}
                                            </li>
                                        ))}
                                    </ul>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Experience Timeline */}
                <div className="mb-12">
                    <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
                        Experience
                    </h3>
                    <div className="max-w-4xl mx-auto space-y-6">
                        {experiences.map((exp, index) => (
                            <motion.div
                                key={exp.id}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card>
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                                        <div>
                                            <h4 className="text-xl font-semibold text-foreground">
                                                {exp.title}
                                            </h4>
                                            <p className="text-foreground/70">{exp.company}</p>
                                        </div>
                                        <span className="text-sm text-accent font-medium mt-2 md:mt-0">
                                            {exp.period}
                                        </span>
                                    </div>
                                    <p className="text-foreground/80 mb-4">{exp.description}</p>
                                    <div className="mb-4">
                                        <h5 className="text-sm font-semibold text-foreground mb-2">
                                            Key Achievements:
                                        </h5>
                                        <ul className="space-y-1">
                                            {exp.achievements.map((achievement, idx) => (
                                                <li
                                                    key={idx}
                                                    className="text-sm text-foreground/70 flex items-start gap-2"
                                                >
                                                    <span className="text-primary mt-1">✓</span>
                                                    {achievement}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {exp.technologies.map((tech) => (
                                            <span
                                                key={tech}
                                                className="px-2 py-1 bg-background rounded text-xs text-foreground/80"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Skills */}
                <div>
                    <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
                        Technical Skills
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {Object.entries(
                            skills.reduce((acc, skill) => {
                                if (!acc[skill.category]) acc[skill.category] = [];
                                acc[skill.category].push(skill);
                                return acc;
                            }, {} as Record<string, typeof skills>)
                        ).map(([category, categorySkills], catIndex) => (
                            <Card key={category}>
                                <h4 className="text-lg font-semibold text-foreground mb-4">
                                    {category}
                                </h4>
                                <div className="space-y-3">
                                    {categorySkills.map((skill, index) => (
                                        <motion.div
                                            key={skill.name}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: (catIndex * 0.1) + (index * 0.05) }}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-foreground text-sm">
                                                    {skill.name}
                                                </span>
                                                <span className="text-foreground/70 text-sm">
                                                    {skill.level}%
                                                </span>
                                            </div>
                                            <div className="h-2 bg-background rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: `${skill.level}%` }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 1, delay: (catIndex * 0.1) + (index * 0.05) }}
                                                    className="h-full bg-linear-to-r from-primary to-accent rounded-full"
                                                />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </Section>
        </div>
    );
}
