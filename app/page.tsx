'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button, Eyebrow } from '@/components/UI';
import { projects } from '@/data/projects';
import { skills } from '@/data/experience';

export default function HomePage() {
  const featured = projects.filter((p) => p.featured).slice(0, 4);
  const topSkills = skills.slice(0, 9);

  return (
    <>
      {/* Hero */}
      <section className="px-6 pt-24 pb-28 md:pt-36 md:pb-36">
        <div className="max-w-6xl mx-auto">
          <Eyebrow className="mb-8">
            Frontend engineer · Riyadh → Austria, 2026
          </Eyebrow>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="font-display text-5xl md:text-7xl lg:text-[88px] text-[var(--fg)] leading-[0.98] mb-8 max-w-4xl"
          >
            I build the unglamorous software that makes engineering data
            actually usable.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="text-lg md:text-xl text-[var(--fg-muted)] max-w-2xl leading-relaxed mb-10"
          >
            React, Next.js, and a lot of Python. Pavement surveys, GIS pipelines,
            desktop tools that turn weeks of spreadsheet work into one click.
            Currently in Saudi Arabia. Moving to Austria in 2026 —
            {/*my closestfriends are in St. Pölten and*/} the engineering scene there is
            genuinely good.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="flex flex-wrap gap-3"
          >
            <Button href="/projects" variant="primary">
              See recent work
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button href="/contact" variant="ghost">
              Get in touch
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6">
        <div className="divider" />
      </div>

      {/* Recent work — numbered list */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-baseline justify-between mb-12">
            <Eyebrow>Recent</Eyebrow>
            <Link href="/projects" className="link-arrow text-sm">
              All work
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <ul className="border-t border-[var(--hairline)]">
            {featured.map((p, i) => {
              const href = p.demo || `/projects`;
              const isExternal = href.startsWith('http');
              const Wrapper = isExternal
                ? ({ children }: { children: React.ReactNode }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group grid grid-cols-12 gap-4 py-7 items-baseline hover:bg-[var(--bg-elevated)]/40 -mx-4 px-4 rounded-md transition-colors"
                  >
                    {children}
                  </a>
                )
                : ({ children }: { children: React.ReactNode }) => (
                  <Link
                    href={href}
                    className="group grid grid-cols-12 gap-4 py-7 items-baseline hover:bg-[var(--bg-elevated)]/40 -mx-4 px-4 rounded-md transition-colors"
                  >
                    {children}
                  </Link>
                );

              return (
                <motion.li
                  key={p.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-[var(--hairline)]"
                >
                  <Wrapper>
                    <span className="col-span-2 md:col-span-1 font-mono text-sm text-[var(--fg-dim)] tabular-nums self-center">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="col-span-10 md:col-span-7 font-display text-2xl md:text-3xl text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors leading-tight">
                      {p.title}
                    </span>
                    <span className="hidden md:block md:col-span-3 text-sm text-[var(--fg-muted)] self-center">
                      {p.category}
                    </span>
                    <span className="hidden md:flex md:col-span-1 justify-end self-center">
                      <ArrowUpRight className="w-5 h-5 text-[var(--fg-dim)] group-hover:text-[var(--accent)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                    </span>
                  </Wrapper>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6">
        <div className="divider" />
      </div>

      {/* What I do */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <Eyebrow>What I do</Eyebrow>
            <p className="text-[var(--fg-muted)] mt-3 max-w-xs">
              Four things I get paid to do well.
            </p>
          </div>
          <div className="md:col-span-8 space-y-10">
            {[
              {
                title: 'Frontend engineering',
                body: 'React + Next.js + TypeScript. Dashboards, GIS interfaces, internal tools. I care about the boring parts — loading states, empty states, the thing that breaks at 4pm on Friday.',
              },
              {
                title: 'Python automation',
                body: 'Standalone EXE tools that field engineers can use without touching code. Data validation pipelines for survey output. AI-driven desktop automation. The kind of code that turns a week of manual work into one click.',
              },
              {
                title: 'GIS & geospatial',
                body: 'MapLibre, Mapbox, GeoPandas. Coordinate fixes, format conversion, layer management. Most of my web work has a map in it somewhere.',
              },
              {
                title: 'Pavement & infrastructure data',
                body: 'LCMS, CFT, FWD, HWD, GPR. The domain knowledge to know what valid data looks like before you write the validator.',
              },
            ].map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ delay: i * 0.05 }}
                className="border-l border-[var(--hairline)] pl-6"
              >
                <h3 className="font-display text-2xl text-[var(--fg)] mb-2">
                  {s.title}
                </h3>
                <p className="text-[var(--fg-muted)] leading-relaxed">
                  {s.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6">
        <div className="divider" />
      </div>

      {/* Tools */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <Eyebrow>Tools I reach for</Eyebrow>
            <p className="text-[var(--fg-muted)] mt-3 max-w-xs">
              Day to day. The list is shorter than most portfolios — it's only
              what I'd actually defend in a code review.
            </p>
          </div>
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-1">
            {topSkills.map((s) => (
              <div
                key={s.name}
                className="flex items-baseline justify-between border-b border-[var(--hairline)] py-3"
              >
                <span className="text-[var(--fg)]">{s.name}</span>
                <span className="font-mono text-xs text-[var(--fg-dim)] tabular-nums">
                  {s.level}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6">
        <div className="divider" />
      </div>

      {/* Austria */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto">
          <Eyebrow className="mb-6">Why Austria</Eyebrow>
          {/* <p className="font-display text-3xl md:text-4xl text-[var(--fg)] leading-tight mb-8">
            My closest friends grew up in St. Pölten. We've been waiting years
            to live in the same place again.
          </p> */}
          <div className="space-y-4 text-[var(--fg-muted)] leading-relaxed mb-8">
            <p>
              {/*  That's the real reason. */}The professional reason — Austria has
              serious engineering software companies and a frontend scene that
              takes craft seriously, which is a good fit for what I do.
            </p>
            <p>
              Open to relocation and visa sponsorship. Targeting roles in
              Vienna, Linz, or St. Pölten.
            </p>
          </div>
          <Link href="/about" className="link-arrow">
            More about me
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Big email CTA */}
      <section className="px-6 py-32 border-t border-[var(--hairline)]">
        <div className="max-w-6xl mx-auto text-center">
          <Eyebrow className="mb-6">Get in touch</Eyebrow>
          <a
            href="mailto:MohabTohamyAbdallah@gmail.com"
            className="font-display text-3xl sm:text-5xl lg:text-7xl text-[var(--fg)] hover:text-[var(--accent)] transition-colors inline-flex items-baseline gap-3 break-all"
          >
            MohabTohamyAbdallah@gmail.com
            <ArrowUpRight className="w-6 h-6 sm:w-10 sm:h-10 lg:w-14 lg:h-14 shrink-0" />
          </a>
        </div>
      </section>
    </>
  );
}
