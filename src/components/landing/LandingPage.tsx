'use client';

import React from 'react';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Check,
  Cpu,
  Eye,
  Layers,
  LineChart,
  Lock,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { WalletConnect } from '@/components/wallet/WalletConnect';
import Reveal from './Reveal';

/* ─── Data ─────────────────────────────────────────────────────────────────── */

const CAPABILITIES = [
  'Live balances',
  'Risk scoring',
  'Drift alerts',
  'One-click rebalance',
  'Staking yields',
  'AI insights',
  'Audit logs',
  'Non-custodial',
];

const FEATURES: {
  icon: React.ReactNode;
  title: string;
  body: string;
  span?: string;
  delay?: number;
}[] = [
  {
    icon: <LineChart className="h-6 w-6" />,
    title: 'Real-time Portfolio Tracking',
    body: 'Live prices, total value, and a full holdings overview across every Stellar asset you own — refreshed as the market moves.',
    span: 'md:col-span-2',
    delay: 0,
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: 'Non-custodial by Design',
    body: 'Your keys stay in your wallet. AstraPort reads public account data only — it can never move funds on its own.',
    delay: 75,
  },
  {
    icon: <Cpu className="h-6 w-6" />,
    title: 'AI-Powered Risk Analysis',
    body: 'Every portfolio gets a live risk score with plain-English explanations of what is driving it — concentration, volatility, drift.',
    span: 'md:col-span-2',
    delay: 0,
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: 'One-click Rebalancing',
    body: 'Dry-run a proposed allocation, preview fees and slippage, then execute when it looks right. Full wizard, zero surprises.',
    delay: 75,
  },
  {
    icon: <Activity className="h-6 w-6" />,
    title: 'Drift Monitoring',
    body: 'Get alerted the moment your allocation drifts from target, with severity levels and a history of how you got here.',
    delay: 0,
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: 'Intelligent Insights',
    body: 'Personalized observations and market context, delivered in-line with your portfolio rather than in another tab.',
    delay: 75,
  },
];

const STEPS = [
  {
    title: 'Connect your wallet',
    body: 'Freighter, xBull, Albedo, Rabet or LOBSTR — pick a network and approve the read-only connection.',
    icon: <Layers className="h-5 w-5" />,
  },
  {
    title: 'See the full picture',
    body: 'Balances, allocation, performance history and a live risk score land on one dashboard in seconds.',
    icon: <Eye className="h-5 w-5" />,
  },
  {
    title: 'Act with confidence',
    body: 'AI recommendations, drift alerts and a guided rebalance wizard turn analysis into safe, reviewable actions.',
    icon: <Zap className="h-5 w-5" />,
  },
];

const STATS = [
  { value: '5+', label: 'Supported wallets' },
  { value: '100%', label: 'Non-custodial' },
  { value: '24/7', label: 'Drift monitoring' },
  { value: '0 XLM', label: 'Platform fees' },
];

/* ─── Small building blocks ────────────────────────────────────────────────── */

function SectionHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-teal">
        {eyebrow}
      </p>
      <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
      <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-400">{body}</p>
    </div>
  );
}

/** Static, decorative product mock shown in the hero — pure presentation. */
function HeroPreview() {
  const rows = [
    { code: 'XLM', name: 'Stellar Lumens', pct: 42 },
    { code: 'USDC', name: 'USD Coin', pct: 31 },
    { code: 'AQUA', name: 'Aquarius', pct: 16 },
    { code: 'YXLM', name: 'Yo-currency', pct: 11 },
  ];

  return (
    <div className="relative rounded-2xl border border-gray-200/80 bg-white/80 shadow-2xl shadow-brand-navy/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-black/40">
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3 dark:border-white/10">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
        <span className="ml-3 text-xs font-medium text-gray-400 dark:text-gray-500">
          astraport · dashboard
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 p-5 sm:p-6">
        {/* Stat tiles */}
        <div className="rounded-xl bg-gray-50 p-4 dark:bg-white/5">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total value</p>
          <p className="mt-1 text-xl font-bold sm:text-2xl">$12,847.32</p>
          <p className="mt-1 text-xs font-medium text-emerald-500">▲ 3.2% today</p>
        </div>
        <div className="rounded-xl bg-gray-50 p-4 dark:bg-white/5">
          <p className="text-xs text-gray-500 dark:text-gray-400">Risk score</p>
          <p className="mt-1 text-xl font-bold sm:text-2xl">68<span className="text-sm text-gray-400">/100</span></p>
          <p className="mt-1 text-xs font-medium text-amber-500">Moderate</p>
        </div>
        <div className="rounded-xl bg-gray-50 p-4 dark:bg-white/5">
          <p className="text-xs text-gray-500 dark:text-gray-400">AI actions</p>
          <p className="mt-1 text-xl font-bold sm:text-2xl">3</p>
          <p className="mt-1 text-xs font-medium text-brand-teal">Ready to review</p>
        </div>

        {/* Sparkline area chart (pure SVG, decorative) */}
        <div className="col-span-3 rounded-xl bg-gradient-to-r from-brand-teal/10 to-transparent p-4 dark:from-brand-teal/15">
          <svg viewBox="0 0 300 60" className="h-16 w-full" aria-hidden="true">
            <defs>
              <linearGradient id="previewFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#12C6B2" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#12C6B2" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,48 C25,44 40,30 65,32 C90,34 105,18 130,22 C155,26 170,12 195,16 C220,20 240,8 265,10 C280,11 292,6 300,5 L300,60 L0,60 Z"
              fill="url(#previewFill)"
            />
            <path
              d="M0,48 C25,44 40,30 65,32 C90,34 105,18 130,22 C155,26 170,12 195,16 C220,20 240,8 265,10 C280,11 292,6 300,5"
              fill="none"
              stroke="#12C6B2"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Allocation rows */}
        <div className="col-span-3 space-y-2.5">
          {rows.map((row) => (
            <div key={row.code} className="flex items-center gap-3">
              <span className="w-12 text-xs font-semibold text-gray-700 dark:text-gray-300">
                {row.code}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-navy to-brand-teal"
                  style={{ width: `${row.pct}%` }}
                />
              </div>
              <span className="w-9 text-right text-xs text-gray-500 dark:text-gray-400">
                {row.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Floating AI alert card */}
      <div className="absolute -right-3 -top-4 hidden items-center gap-2 rounded-xl border border-gray-100 bg-white px-3.5 py-2.5 shadow-lg sm:flex dark:border-white/10 dark:bg-gray-900">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-teal/15 text-brand-teal">
          <Sparkles className="h-4 w-4" />
        </span>
        <div>
          <p className="text-xs font-semibold">Rebalance suggested</p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">USDC overweight · dry-run ready</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-gray-950 dark:text-gray-100">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-gray-200/60 bg-white/70 backdrop-blur-xl transition-colors duration-300 dark:border-white/10 dark:bg-gray-950/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center" aria-label="AstraPort home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/AstraPort_logo.svg"
              alt="AstraPort Logo"
              className="h-14 w-56 object-contain"
            />
          </a>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Page sections">
            {[
              ['Features', '#features'],
              ['How it works', '#how-it-works'],
              ['Why AstraPort', '#why'],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <a
              href="/waitlist"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 sm:block dark:text-gray-400 dark:hover:text-white"
            >
              Waitlist
            </a>
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="aurora animate-aurora pointer-events-none absolute inset-0" aria-hidden="true" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
          aria-hidden="true"
          style={{
            backgroundImage:
              'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent)',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 md:pb-28 md:pt-24 lg:px-8">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            {/* Copy */}
            <div className="text-center lg:text-left">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-teal/30 bg-brand-teal/5 px-4 py-1.5 text-sm font-medium text-brand-teal dark:bg-brand-teal/10 dark:text-stellar-300">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-teal opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-teal" />
                </span>
                Non-custodial · Powered by Stellar
              </div>
              <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Your Stellar portfolio,
                <span className="mt-2 block animate-gradient bg-gradient-to-r from-brand-navy via-brand-teal to-brand-navy bg-clip-text text-[1.06em] leading-tight text-transparent [background-size:200%_auto] dark:from-brand-teal dark:via-teal-300 dark:to-brand-teal">
                  finally readable.
                </span>
              </h1>
              <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-gray-600 sm:text-xl lg:mx-0 dark:text-gray-400">
                Connect your wallet and get live balances, AI risk analysis, drift alerts and
                guided rebalancing — in one dashboard, without giving up custody of a single
                lumens.
              </p>
              <div className="flex flex-col items-center gap-4 sm:flex-row lg:items-start">
                <div className="w-64 shrink-0">
                  <WalletConnect />
                </div>
                <a
                  href="#features"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white/60 px-6 py-3 font-medium text-gray-700 backdrop-blur transition-all hover:border-brand-teal/40 hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10"
                >
                  Explore features
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>

              {/* Trust row */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-500 lg:justify-start dark:text-gray-500">
                {['Read-only access', 'No seed phrases', 'Free to use'].map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-brand-teal" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Product preview */}
            <Reveal delay={150} className="relative">
              <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-brand-teal/15 via-transparent to-brand-navy/10 blur-2xl dark:from-brand-teal/10 dark:to-brand-navy/20" />
              <HeroPreview />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Capability marquee ─────────────────────────────────────────────── */}
      <section className="border-y border-gray-200/70 bg-white/60 py-4 dark:border-white/10 dark:bg-white/[0.03]" aria-label="Platform capabilities">
        <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <div className="animate-marquee flex w-max gap-3 pr-3">
            {[...CAPABILITIES, ...CAPABILITIES].map((cap, i) => (
              <span
                key={`${cap}-${i}`}
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-brand-teal" />
                {cap}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        <Reveal id="features">
          <SectionHeading
            eyebrow="Features"
            title="Everything your portfolio needs"
            body="Track, analyze and act — the whole workflow lives in one place instead of five tabs and a spreadsheet."
          />
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <Reveal key={feature.title} delay={feature.delay}>
              <div
                className={`group h-full rounded-2xl border border-gray-100 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-brand-teal/30 hover:shadow-xl hover:shadow-brand-teal/10 dark:border-white/10 dark:bg-white/5 ${feature.span ?? ''}`}
              >
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-stellar-50 to-teal-100 text-brand-teal transition-transform duration-300 group-hover:scale-110 dark:from-brand-teal/20 dark:to-brand-navy/30">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="leading-relaxed text-gray-600 dark:text-gray-400">{feature.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <section className="border-y border-gray-200/70 bg-white dark:border-white/10 dark:bg-gray-900/40">
        <div className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 md:py-28 lg:px-8">
          <Reveal id="how-it-works">
            <SectionHeading
              eyebrow="How it works"
              title="From wallet to insight in three steps"
              body="No accounts, no deposits, no KYC. Your wallet is your login and your data never leaves your device except to read the chain."
            />
          </Reveal>

          <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 100}>
                <div className="relative">
                  {/* Connector line (desktop) */}
                  {i < STEPS.length - 1 && (
                    <div
                      className="absolute left-[calc(50%+3rem)] top-6 hidden h-px w-[calc(100%-6rem)] bg-gradient-to-r from-brand-teal/50 to-transparent md:block"
                      aria-hidden="true"
                    />
                  )}
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-brand-teal/30 bg-brand-teal/10 text-brand-teal dark:bg-brand-teal/15">
                      {step.icon}
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-teal text-[11px] font-bold text-brand-navy">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                    <p className="max-w-xs text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      {step.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-12 text-center">
            <p className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Lock className="h-4 w-4 text-brand-teal" />
              Read-only connection — AstraPort can view, never spend.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Why / stats band ───────────────────────────────────────────────── */}
      <section id="why" className="relative scroll-mt-24 overflow-hidden bg-brand-navy py-16 md:py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy to-brand-teal/30" aria-hidden="true" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          aria-hidden="true"
          style={{
            backgroundImage:
              'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              Built for the Stellar community
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-teal-100/80">
              Open, auditable and free — the way portfolio tooling on a public network should be.
            </p>
          </Reveal>
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            {STATS.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 100}>
                <p className="text-4xl font-bold text-white">{stat.value}</p>
                <p className="mt-2 text-sm text-teal-100/80">{stat.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-gradient-to-br from-stellar-50 to-white px-6 py-16 text-center dark:border-white/10 dark:from-white/5 dark:to-transparent">
            <div className="absolute -top-16 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-teal/10 blur-3xl" aria-hidden="true" />
            <div className="relative">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                Ready to see your portfolio clearly?
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
                Connect a wallet and your dashboard is live in seconds. Or join the waitlist for
                early access to staking and premium analytics.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <div className="w-64">
                  <WalletConnect />
                </div>
                <a
                  href="/waitlist"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white/60 px-6 py-3 font-medium text-gray-700 backdrop-blur transition-all hover:border-brand-teal/40 hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10"
                >
                  Join the waitlist
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-200/70 bg-white py-12 dark:border-white/10 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="md:col-span-2">
              <a href="/" className="inline-block" aria-label="AstraPort home">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/AstraPort_logo.svg"
                  alt="AstraPort Logo"
                  className="h-12 w-44 object-contain"
                />
              </a>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                Portfolio intelligence for the Stellar network. Non-custodial, AI-assisted, and
                built in the open.
              </p>
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">Product</p>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li><a href="#features" className="transition-colors hover:text-brand-teal">Features</a></li>
                <li><a href="/rebalance" className="transition-colors hover:text-brand-teal">Rebalancing</a></li>
                <li><a href="/drift-monitoring" className="transition-colors hover:text-brand-teal">Drift monitoring</a></li>
                <li><a href="/staking" className="transition-colors hover:text-brand-teal">Staking</a></li>
              </ul>
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">Community</p>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li><a href="/waitlist" className="transition-colors hover:text-brand-teal">Waitlist</a></li>
                <li><a href="#" className="transition-colors hover:text-brand-teal">GitHub</a></li>
                <li><a href="#" className="transition-colors hover:text-brand-teal">Discord</a></li>
                <li><a href="#" className="transition-colors hover:text-brand-teal">Twitter</a></li>
              </ul>
              <div className="mt-5 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                <BarChart3 className="h-3.5 w-3.5" />
                Built for the Stellar community
              </div>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-200/70 pt-6 dark:border-white/10 sm:flex-row">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              &copy; {new Date().getFullYear()} AstraPort. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-400 dark:text-gray-500">
              <a href="#" className="transition-colors hover:text-brand-teal">Privacy</a>
              <a href="#" className="transition-colors hover:text-brand-teal">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
