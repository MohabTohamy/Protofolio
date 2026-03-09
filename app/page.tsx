'use client';

import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Code, Layers, Database } from 'lucide-react';
import { Button, Section, SectionTitle, Card } from '@/components/UI';
import Link from 'next/link';
import { projects } from '@/data/projects';
import { skills } from '@/data/experience';
import FunnySurvey from '@/components/FunnySurvey';

export default function HomePage() {
  const featuredProjects = projects.filter((p) => p.featured).slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Section className="min-h-[calc(100vh-4rem)] flex items-center justify-center relative overflow-hidden">
        {/* Austrian Alps Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?q=80&w=2070')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-linear-to-b from-background/95 via-background/90 to-background" />
        </div>

        <div className="relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                Mohab Tohamy
              </span>
            </h1>
            <h2 className="text-2xl md:text-4xl font-semibold text-foreground mb-4">
              Frontend Engineer
            </h2>
            <p className="text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto mb-8">
              Seeking Opportunities in Austria 🇦🇹
            </p>
            <p className="text-foreground/70 max-w-2xl mx-auto mb-12">
              Frontend engineer building systems with many functionalities, specializing in infrastructure engineering platforms,
              GIS solutions, and data automation. Passionate about Austria&apos;s innovation
              culture and commitment to sustainable engineering.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Button href="/projects" variant="primary">
                View Projects <ArrowRight className="inline ml-2 w-4 h-4" />
              </Button>
              <Button href="/map-demo" variant="secondary">
                Explore Map Demo
              </Button>
              <Button href="/tools" variant="outline">
                Engineering Tools
              </Button>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* Funny Survey Component */}
      <Section>
        <FunnySurvey />
      </Section>

      {/* What I Do Section */}
      <Section className="bg-card/30">
        <SectionTitle subtitle="Engineering + Programming">
          What I Do
        </SectionTitle>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <Code className="w-8 h-8 text-primary" />,
              title: 'Frontend Development',
              description:
                'Modern web applications with React, Next.js, TypeScript, and interactive visualizations',
            },
            {
              icon: <Database className="w-8 h-8 text-accent" />,
              title: 'Data Automation',
              description:
                'Python scripts for data processing, report generation, and workflow automation',
            },
            {
              icon: <MapPin className="w-8 h-8 text-primary" />,
              title: 'GIS & Geospatial',
              description:
                'Coordinate processing, spatial analysis, and interactive map visualization',
            },
            {
              icon: <Layers className="w-8 h-8 text-accent" />,
              title: 'Pavement & Assets Engineering',
              description:
                'Pavement data analysis using LCMS, CFT, FWD, HWD, and GPR technologies',
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <div className="mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-foreground/70">{item.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Featured Projects */}
      <Section>
        <SectionTitle subtitle="Building engineering intelligence platforms">
          Featured Projects
        </SectionTitle>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {featuredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <div className="h-48 bg-linear-to-br from-primary/20 to-accent/20 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-6xl">🛠️</span>
                </div>
                <div className="inline-block px-3 py-1 bg-primary/20 text-primary rounded-full text-sm mb-2">
                  {project.category}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {project.title}
                </h3>
                <p className="text-foreground/70 mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 bg-card rounded text-xs text-foreground/80"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/projects">
            <Button variant="primary">
              View All Projects <ArrowRight className="inline ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </Section>

      {/* Skills Preview */}
      <Section className="bg-card/30">
        <SectionTitle subtitle="Technical expertise">
          Core Skills
        </SectionTitle>

        <div className="max-w-4xl mx-auto space-y-4">
          {skills.slice(0, 8).map((skill, index) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-foreground font-medium">{skill.name}</span>
                <span className="text-foreground/70">{skill.level}%</span>
              </div>
              <div className="h-2 bg-card rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${skill.level}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: index * 0.05 }}
                  className="h-full bg-linear-to-r from-primary to-accent rounded-full"
                />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/about">
            <Button variant="outline">Learn More About Me</Button>
          </Link>
        </div>
      </Section>

      {/* Austria Focus Section */}
      <Section className="bg-card/30">
        <Card className="bg-linear-to-br from-red-500/10 via-transparent to-red-500/10 border-2 border-red-500/20">
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-foreground mb-3">
                Seeking Opportunities in Austria 🇦🇹
              </h2>
              <div className="w-24 h-1 bg-linear-to-r from-red-500 to-white mx-auto rounded-full mb-6"></div>
              <p className="text-xl text-foreground/80 max-w-3xl mx-auto mb-6">
                Ready to contribute to Austrian engineering excellence and innovation
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              {
                icon: '🏢',
                title: 'Target Companies',
                items: [
                  'Engineering Software Development',
                  'Infrastructure & Civil Engineering Firms',
                  'GIS & Mapping Technology Companies',
                  'Smart City & IoT Solutions Providers',
                ]
              },
              {
                icon: '💼',
                title: 'What I Bring',
                items: [
                  'Frontend development expertise',
                  'Infrastructure engineering knowledge',
                  'Data automation & processing skills',
                  'GIS & geospatial analysis experience',
                ]
              },
              {
                icon: '🎯',
                title: 'Ideal Roles',
                items: [
                  'Software Engineer (Frontend)',
                  'GIS Application Developer',
                  'Engineering Platform Developer',
                ]
              },
            ].map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <div className="glass rounded-xl p-6 h-full">
                  <div className="text-4xl mb-4 text-center">{section.icon}</div>
                  <h3 className="text-xl font-bold text-foreground mb-4 text-center">
                    {section.title}
                  </h3>
                  <ul className="space-y-2">
                    {section.items.map((item, idx) => (
                      <li key={idx} className="text-foreground/80 text-sm flex items-start gap-2">
                        <span className="text-primary mt-1">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center bg-card/50 rounded-lg p-6 border border-primary/20">
            <p className="text-foreground/90 text-lg mb-4">
              <span className="font-bold text-primary">Why Austria?</span> I know you gonna ask this question...
            </p>
            <Button href="/about" variant="primary">
              Press Here to Know <ArrowRight className="inline ml-2 w-4 h-4" />
            </Button>
          </div>
        </Card>
      </Section>

      {/* CTA Section */}
      <Section>
        <Card className="text-center bg-linear-to-br from-primary/10 to-accent/10">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Explore?
          </h2>
          <p className="text-foreground/70 mb-8 max-w-2xl mx-auto">
            Check out my interactive engineering tools, explore the GIS map demo,
            or view the analytics dashboard.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button href="/tools" variant="primary">
              Engineering Tools
            </Button>
            <Button href="/map-demo" variant="secondary">
              Map Demo
            </Button>
            <Button href="/dashboard" variant="outline">
              Dashboard
            </Button>
          </div>
        </Card>
      </Section>
    </div>
  );
}
