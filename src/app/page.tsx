"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AuthDialog } from "@/components/auth/SupabaseAuthControl";
import {
  FileText,
  Hash,
  Cloud,
  Settings2,
  Check,
  Plus,
  Minus,
  ChevronRight,
  ArrowRight,
  Wifi,
  AlignLeft,
} from "lucide-react";

type AuthMode = "sign-in" | "sign-up";

/* ── Helpers ──────────────────────────────────────────────────────────── */
function reveal(delay = 0) {
  return {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.55, ease: "easeOut", delay },
  } as const;
}

/* ── Hero editor mockup ───────────────────────────────────────────────── */
function EditorMockup() {
  return (
    <div className="relative">
      {/* Glow behind the card */}
      <div className="absolute inset-x-8 bottom-0 top-8 rounded-3xl bg-blue-500/10 blur-3xl" />

      {/* Main browser window */}
      <div className="relative bg-white rounded-2xl border border-slate-200 shadow-[0_20px_60px_rgba(0,0,0,0.10)] overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-100">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <div className="flex-1 mx-4">
            <div className="bg-white border border-slate-200 rounded-md px-3 py-1 text-[10px] text-slate-400 text-center">
              quill.app/editor
            </div>
          </div>
        </div>

        {/* App layout */}
        <div className="flex h-64">
          {/* Sidebar */}
          <div className="w-44 bg-slate-50 border-r border-slate-100 p-3 shrink-0">
            <div className="flex items-center gap-1.5 mb-4">
              <div className="w-5 h-5 rounded-md bg-slate-900 flex items-center justify-center">
                <AlignLeft className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="text-[11px] font-bold text-slate-800">Quill</span>
            </div>
            <div className="text-[9px] text-slate-400 font-semibold uppercase tracking-wide mb-2 px-1">
              Pages
            </div>
            {[
              { name: "Product Strategy", active: true },
              { name: "Meeting Notes", active: false },
              { name: "Research Links", active: false },
            ].map((doc) => (
              <div
                key={doc.name}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg mb-0.5 text-[10px] ${
                  doc.active
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-500"
                }`}
              >
                <FileText className="w-3 h-3 shrink-0" />
                <span className="truncate">{doc.name}</span>
              </div>
            ))}
          </div>

          {/* Editor canvas */}
          <div className="flex-1 p-5 overflow-hidden">
            <div className="text-sm font-bold text-slate-900 mb-3">
              Product Strategy Q4
            </div>
            <div className="space-y-2">
              <div className="h-2.5 bg-slate-200 rounded-full w-11/12" />
              <div className="h-2.5 bg-slate-200 rounded-full w-4/5" />
              <div className="h-2 bg-slate-100 rounded-full w-full" />
              <div className="h-2 bg-slate-100 rounded-full w-3/4" />
              <div className="h-2 bg-slate-100 rounded-full w-5/6" />
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
                Key Goals
              </div>
              {["Increase user retention", "Launch cloud sync"].map((item) => (
                <div key={item} className="flex items-center gap-2 mb-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  <div className="h-2 bg-slate-100 rounded-full flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating: Cloud Saved chip */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
        className="absolute -top-3 -right-5 bg-white border border-slate-200 rounded-xl px-3 py-2 flex items-center gap-2 shadow-lg z-10"
      >
        <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
          <Wifi className="w-3.5 h-3.5 text-emerald-500" />
        </div>
        <div>
          <div className="text-[10px] font-semibold text-slate-800">Cloud Saved</div>
          <div className="text-[8px] text-slate-400">Just now</div>
        </div>
      </motion.div>

      {/* Floating: Slash command card */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 4.2, ease: "easeInOut", delay: 0.6 }}
        className="absolute -bottom-5 -left-6 bg-white border border-slate-200 rounded-xl p-2.5 shadow-lg w-36 z-10"
      >
        <div className="text-[8px] text-slate-400 mb-1.5 font-medium px-1">
          / Commands
        </div>
        {["Heading", "Bullet List", "Code Block"].map((cmd, i) => (
          <div
            key={cmd}
            className={`flex items-center gap-1.5 px-1.5 py-1 rounded-md text-[9px] ${
              i === 0
                ? "bg-blue-50 text-blue-700 font-semibold"
                : "text-slate-500"
            }`}
          >
            <Hash className="w-2.5 h-2.5 shrink-0" />
            {cmd}
          </div>
        ))}
      </motion.div>

      {/* Floating: Word count chip */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1.2 }}
        className="absolute top-20 -left-8 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-lg hidden lg:block z-10"
      >
        <div className="text-[8px] text-slate-400 mb-0.5">Document stats</div>
        <div className="text-[13px] font-bold text-slate-900">1,248</div>
        <div className="text-[8px] text-slate-400">words · 5 min read</div>
      </motion.div>
    </div>
  );
}

/* ── Navbar ───────────────────────────────────────────────────────────── */
function Navbar({ onSignIn, onSignUp }: { onSignIn: () => void; onSignUp: () => void }) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center shrink-0">
            <svg
              viewBox="0 0 48 48"
              className="w-4 h-4"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 30c8-2 14-8 16-18-10 2-16 8-18 16l-4 8 6-6Z" />
              <path d="M18 30 30 18" strokeWidth="2" />
            </svg>
          </div>
          <span className="text-[17px] font-bold text-slate-900">Quill</span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {[
            ["Features", "#features"],
            ["Pricing", "#pricing"],
            ["FAQ", "#faq"],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSignIn}
            className="hidden sm:block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-lg"
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={onSignUp}
            className="bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Open App
          </button>
        </div>
      </div>
    </header>
  );
}

/* ── Hero ─────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="max-w-7xl mx-auto px-6 pt-20 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: copy */}
        <motion.div {...reveal()}>
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-4 py-1.5 mb-7">
            <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
              <span className="text-white text-[9px] font-black">Y</span>
            </div>
            <span className="text-sm font-semibold text-orange-700">
              Backed by Y Combinator
            </span>
          </div>

          <h1 className="text-[50px] font-extrabold leading-[1.05] tracking-[-0.03em] text-slate-900 mb-6">
            Write Better.
            <br />
            <span className="font-black">Think Clearer.</span>
          </h1>

          <p className="text-[17px] text-slate-500 mb-8 leading-relaxed max-w-[26rem]">
            Take control of your writing with a polished block editor, slash
            commands, and cloud sync. Organize and publish your thoughts
            effortlessly.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="/editor"
              className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-7 py-3.5 rounded-xl text-sm hover:bg-blue-700 transition-all shadow-[0_4px_14px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)]"
            >
              Start Writing Free
            </a>
            <a
              href="/editor"
              className="inline-flex items-center gap-3 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors shrink-0">
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4 text-slate-700 ml-0.5"
                  fill="currentColor"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              Watch Demo
            </a>
          </div>
        </motion.div>

        {/* Right: mockup */}
        <motion.div {...reveal(0.15)} className="relative lg:pl-8">
          <EditorMockup />
        </motion.div>
      </div>
    </section>
  );
}

/* ── Stats bar ────────────────────────────────────────────────────────── */
function StatsBar() {
  const stats = [
    { value: "38,182+", label: "Documents created" },
    { value: "12,400+", label: "Active writers" },
    { value: "99.9%", label: "Uptime guarantee" },
    { value: "4.9 ★", label: "Average rating" },
  ];

  return (
    <section className="border-y border-slate-100 bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-extrabold text-slate-900 mb-1">
                {s.value}
              </div>
              <div className="text-sm text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Features ─────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: <AlignLeft className="w-5 h-5" />,
    iconBg: "bg-orange-500",
    title: "Block Editor",
    description:
      "Paragraphs, headings, lists, blockquotes, and code blocks. A polished canvas built for structured, focused writing.",
  },
  {
    icon: <Hash className="w-5 h-5" />,
    iconBg: "bg-blue-500",
    title: "Slash Commands",
    description:
      "A full command palette at your cursor. Format, convert, or insert blocks without ever leaving the keyboard.",
  },
  {
    icon: <Cloud className="w-5 h-5" />,
    iconBg: "bg-emerald-500",
    title: "Cloud Sync",
    description:
      "Sign in once and your documents follow you across every device. Fully local-first — works without an account.",
  },
  {
    icon: <Settings2 className="w-5 h-5" />,
    iconBg: "bg-violet-500",
    title: "Inspector Panel",
    description:
      "Contextual typography and block controls. Appears when you need it, invisible when you're in the zone.",
  },
] as const;

function Features() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div {...reveal()} className="text-center mb-16">
          <h2 className="text-[42px] font-extrabold tracking-[-0.025em] text-slate-900 mb-4">
            What Sets Us Apart
          </h2>
          <p className="text-[17px] text-slate-500 max-w-[38rem] mx-auto">
            Explore the features that make Quill the go-to writing environment
            for focused thinkers and productive teams.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              {...reveal(i * 0.08)}
              className="border border-slate-200 rounded-2xl p-8 hover:border-blue-200 hover:shadow-[0_4px_24px_rgba(37,99,235,0.07)] transition-all duration-300"
            >
              <div
                className={`w-12 h-12 rounded-2xl ${f.iconBg} flex items-center justify-center text-white mb-5`}
              >
                {f.icon}
              </div>
              <h3 className="text-[18px] font-bold text-slate-900 mb-2">
                {f.title}
              </h3>
              <p className="text-slate-500 text-[15px] leading-relaxed">
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Workflow ──────────────────────────────────────────────────────────── */
const WORKFLOW_TABS = [
  {
    id: "write" as const,
    heading: "Write Anything, Beautifully",
    description:
      "A distraction-free canvas that gets out of your way. Powerful block formatting — headings, lists, code blocks — always a keystroke away.",
    link: "Learn more",
  },
  {
    id: "organize" as const,
    heading: "Keep Everything in Order",
    description:
      "Create pages, star favorites, and archive anything you don't need. Search across all documents instantly.",
    link: "Explore pages",
  },
  {
    id: "sync" as const,
    heading: "Always Up to Date",
    description:
      "Sign in and your documents sync across every device instantly. Changes are debounced and never block your typing.",
    link: "See how sync works",
  },
];

type TabId = "write" | "organize" | "sync";

function WorkflowContent({ tab }: { tab: TabId }) {
  if (tab === "write") {
    return (
      <div className="p-6">
        <div className="text-base font-bold text-slate-900 mb-3">
          Product Strategy
        </div>
        <div className="space-y-2 mb-5">
          <div className="h-3 bg-slate-200 rounded-full w-full" />
          <div className="h-3 bg-slate-200 rounded-full w-11/12" />
          <div className="h-3 bg-slate-100 rounded-full w-4/5" />
          <div className="h-3 bg-slate-100 rounded-full w-5/6" />
        </div>
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
          <div className="text-[10px] font-mono text-slate-400 mb-2">
            / Type a command
          </div>
          <div className="flex flex-wrap gap-2">
            {["H1", "H2", "List", "Quote", "Code"].map((cmd) => (
              <div
                key={cmd}
                className="bg-white border border-slate-200 rounded-md px-2 py-1 text-[10px] text-slate-600 font-medium"
              >
                {cmd}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (tab === "organize") {
    const docs = [
      { title: "Product Strategy", tag: "Active", tagClass: "bg-blue-100 text-blue-700" },
      { title: "Meeting Notes", tag: "Favorited", tagClass: "bg-yellow-100 text-yellow-700" },
      { title: "Research Links", tag: "Draft", tagClass: "bg-slate-100 text-slate-600" },
      { title: "Old Draft", tag: "Trash", tagClass: "bg-red-100 text-red-600" },
    ];
    return (
      <div className="p-5">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-3">
          All Pages
        </div>
        {docs.map((doc) => (
          <div
            key={doc.title}
            className="flex items-center justify-between px-3 py-2.5 rounded-xl mb-1.5 border border-slate-100 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-sm text-slate-700 font-medium">
                {doc.title}
              </span>
            </div>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${doc.tagClass}`}
            >
              {doc.tag}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col items-center justify-center h-full gap-5 min-h-[260px]">
      <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
        <Wifi className="w-7 h-7 text-emerald-500" />
      </div>
      <div className="text-center">
        <div className="font-bold text-slate-900 mb-1">All devices synced</div>
        <div className="text-sm text-slate-400">Last sync: just now</div>
      </div>
      <div className="flex gap-2">
        {["Desktop", "Mobile", "Tablet"].map((d) => (
          <div
            key={d}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-medium text-slate-600"
          >
            ✓ {d}
          </div>
        ))}
      </div>
    </div>
  );
}

function Workflow() {
  const [activeTab, setActiveTab] = useState<TabId>("write");

  return (
    <section className="py-24 px-6 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <motion.div {...reveal()} className="text-center mb-16">
          <h2 className="text-[42px] font-extrabold tracking-[-0.025em] text-slate-900 mb-4">
            Simplify Your Workflow
          </h2>
          <p className="text-[17px] text-slate-500 max-w-[36rem] mx-auto">
            Streamlined actions that break your writing process into clear,
            manageable, and satisfying steps.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: tab list */}
          <motion.div {...reveal(0.1)}>
            {WORKFLOW_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="w-full text-left py-5 border-b border-slate-200 last:border-0 transition-all"
              >
                <div
                  className={`font-bold text-[17px] mb-1 transition-colors ${
                    activeTab === tab.id
                      ? "text-slate-900"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {tab.heading}
                </div>
                <AnimatePresence initial={false}>
                  {activeTab === tab.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                    >
                      <p className="text-slate-500 text-[15px] leading-relaxed mb-3 pt-1">
                        {tab.description}
                      </p>
                      <span className="inline-flex items-center gap-1.5 text-blue-600 text-sm font-semibold">
                        {tab.link}{" "}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                      <div className="mt-4 h-0.5 bg-blue-600 w-14 rounded-full" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            ))}
          </motion.div>

          {/* Right: mockup */}
          <motion.div {...reveal(0.2)}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-[0_8px_30px_rgba(0,0,0,0.07)] overflow-hidden"
              >
                <WorkflowContent tab={activeTab} />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ── Pricing ───────────────────────────────────────────────────────────── */
const PLANS = [
  {
    name: "Starter",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description:
      "Everything you need to start writing and organizing — completely free, forever.",
    cta: "Sign Up Now",
    ctaClass: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    highlight: false,
    features: [
      "Block editor with all block types",
      "Unlimited local documents",
      "Slash command menu",
      "Favorites and trash",
      "Font and spacing settings",
    ],
  },
  {
    name: "Writer",
    monthlyPrice: 6,
    yearlyPrice: 4,
    description:
      "Unlock cloud sync and advanced features for writers who work across devices.",
    cta: "Get Started",
    ctaClass: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
    highlight: true,
    features: [
      "Everything in Starter",
      "Cloud sync across all devices",
      "Inspector panel controls",
      "Early access to new features",
      "Priority email support",
    ],
  },
  {
    name: "Team",
    monthlyPrice: null,
    yearlyPrice: null,
    description:
      "Custom solutions for teams that write, collaborate, and publish together.",
    cta: "Contact Us",
    ctaClass: "bg-blue-50 text-blue-600 hover:bg-blue-100",
    highlight: false,
    features: [
      "Everything in Writer",
      "Shared team workspaces",
      "Collaborative editing",
      "Admin and role controls",
      "Dedicated onboarding",
    ],
  },
] as const;

function Pricing() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  return (
    <section id="pricing" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div {...reveal()} className="text-center mb-14">
          <h2 className="text-[42px] font-extrabold tracking-[-0.025em] text-slate-900 mb-4">
            Flexible Plans for Every Need
          </h2>
          <p className="text-[17px] text-slate-500 max-w-[40rem] mx-auto mb-8">
            Choose the plan that fits your needs. Whether writing solo or
            scaling a team, Quill grows with you.
          </p>

          <div className="inline-flex items-center bg-slate-100 rounded-xl p-1">
            {(["monthly", "yearly"] as const).map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setBilling(period)}
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                  billing === period
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {period}
                {period === "yearly" && (
                  <span className="ml-1.5 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">
                    -33%
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              {...reveal(i * 0.08)}
              className={`relative rounded-2xl border p-8 ${
                plan.highlight
                  ? "border-blue-600 shadow-[0_4px_28px_rgba(37,99,235,0.14)]"
                  : "border-slate-200"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-bold px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-[18px] font-bold text-slate-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-5 mb-5">
                {plan.monthlyPrice === null ? (
                  <div className="text-[38px] font-black text-slate-900">
                    Custom
                  </div>
                ) : (
                  <div className="flex items-end gap-1">
                    <span className="text-[38px] font-black text-slate-900">
                      ${billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice}
                    </span>
                    <span className="text-slate-400 text-sm mb-2">/ month</span>
                  </div>
                )}
              </div>

              <a
                href="/editor"
                className={`block w-full text-center py-3 rounded-xl text-sm font-semibold transition-all mb-7 ${plan.ctaClass}`}
              >
                {plan.cta}
              </a>

              <div className="border-t border-slate-100 pt-6 space-y-3">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-orange-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 text-orange-600" />
                    </div>
                    <span className="text-sm text-slate-600">{f}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── FAQ ───────────────────────────────────────────────────────────────── */
const FAQS = [
  {
    q: "What kind of editor does Quill provide?",
    a: "Quill uses a block-based rich text editor powered by TipTap. You can create paragraphs, headings, lists, blockquotes, code blocks, and dividers — all without leaving your keyboard.",
  },
  {
    q: "Does Quill work without an account?",
    a: "Yes. Quill is fully local-first. Open the app and start writing immediately — no sign-up required. Documents are stored in your browser and persist across sessions.",
  },
  {
    q: "How does cloud sync work?",
    a: "Sign in with your email and password. Quill merges your local documents with your cloud account and syncs changes automatically in the background after each edit, never blocking your typing.",
  },
  {
    q: "Can I customize the editor?",
    a: "Absolutely. The Settings panel lets you switch between Sans, Serif, and Mono fonts, adjust line spacing, and toggle spell check. The Inspector gives you per-block typography controls.",
  },
  {
    q: "Is there a mobile app?",
    a: "Not yet — Quill is a web app today. The responsive layout works well on mobile browsers, and cloud sync ensures your documents are accessible from any device.",
  },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 px-6 bg-white">
      <div className="max-w-[52rem] mx-auto">
        <motion.div {...reveal()} className="text-center mb-14">
          <h2 className="text-[42px] font-extrabold tracking-[-0.025em] text-slate-900 mb-4">
            All Your Questions, Answered
          </h2>
          <p className="text-[17px] text-slate-500">
            Quick answers to common questions about Quill.
            <br />
            Need more help? Reach out any time.
          </p>
        </motion.div>

        <motion.div {...reveal(0.1)}>
          {FAQS.map((faq, i) => (
            <div
              key={faq.q}
              className={`border-b border-slate-200 ${i === 0 ? "border-t" : ""}`}
            >
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between py-5 text-left gap-6"
              >
                <span
                  className={`font-semibold text-[16px] ${
                    open === i ? "text-slate-900" : "text-slate-700"
                  }`}
                >
                  {faq.q}
                </span>
                <span
                  className={`shrink-0 transition-colors ${
                    open === i ? "text-blue-600" : "text-slate-400"
                  }`}
                >
                  {open === i ? (
                    <Minus className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                  >
                    <p className="pb-5 text-slate-500 text-[15px] leading-relaxed">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ── CTA Banner ────────────────────────────────────────────────────────── */
function CTAMockup() {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden shadow-2xl">
      <div className="flex items-center gap-1.5 px-3 py-2.5 bg-white/5 border-b border-white/10">
        <div className="w-2.5 h-2.5 rounded-full bg-white/25" />
        <div className="w-2.5 h-2.5 rounded-full bg-white/25" />
        <div className="w-2.5 h-2.5 rounded-full bg-white/25" />
        <div className="flex-1 mx-3 bg-white/10 rounded-md px-2 py-0.5 text-[8px] text-white/40">
          quill.app/editor
        </div>
      </div>
      <div className="flex h-48">
        <div className="w-28 bg-white/5 border-r border-white/10 p-3 shrink-0">
          <div className="text-[8px] text-white/40 mb-3 font-semibold uppercase tracking-wide">
            Pages
          </div>
          {["Strategy", "Notes", "Ideas"].map((d, i) => (
            <div
              key={d}
              className={`flex items-center gap-1 px-1.5 py-1 rounded text-[9px] mb-0.5 ${
                i === 0 ? "bg-white/15 text-white font-medium" : "text-white/35"
              }`}
            >
              <FileText className="w-2.5 h-2.5 shrink-0" />
              {d}
            </div>
          ))}
        </div>
        <div className="flex-1 p-4">
          <div className="text-sm font-bold text-white mb-3">
            Product Strategy
          </div>
          <div className="space-y-2">
            <div className="h-2 bg-white/20 rounded-full w-11/12" />
            <div className="h-2 bg-white/15 rounded-full w-4/5" />
            <div className="h-1.5 bg-white/10 rounded-full w-full" />
            <div className="h-1.5 bg-white/10 rounded-full w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
}

function CTABanner() {
  const stats = [
    { value: "75%", label: "Faster writing" },
    { value: "38k+", label: "Docs created" },
    { value: "99.9%", label: "Uptime" },
  ];

  return (
    <section className="py-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-violet-600 rounded-3xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
            <motion.div {...reveal()} className="p-12 lg:p-16">
              <h2 className="text-[38px] font-extrabold text-white leading-[1.1] tracking-[-0.025em] mb-4">
                Take Control of Your
                <br />
                Writing Today!
              </h2>
              <p className="text-violet-200 text-[15px] mb-8 leading-relaxed max-w-[22rem]">
                Streamline your writing, organize your ideas, and sync across
                every device with Quill&apos;s powerful workspace.
              </p>

              <div className="flex gap-10 mb-10">
                {stats.map((s) => (
                  <div key={s.label}>
                    <div className="text-2xl font-extrabold text-white">
                      {s.value}
                    </div>
                    <div className="text-violet-300 text-xs mt-0.5">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              <a
                href="/editor"
                className="inline-flex items-center gap-2 bg-white text-violet-700 font-bold px-7 py-3.5 rounded-xl text-sm hover:bg-violet-50 transition-all shadow-lg"
              >
                Start Writing Free
                <ChevronRight className="w-4 h-4" />
              </a>
            </motion.div>

            <motion.div {...reveal(0.15)} className="hidden lg:block p-10">
              <CTAMockup />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Footer ────────────────────────────────────────────────────────────── */
function Footer() {
  const COLS = [
    {
      title: "Product",
      links: ["Editor", "Features", "Pricing", "Templates", "Changelog"],
    },
    {
      title: "Resources",
      links: ["Documentation", "FAQ", "Blog", "Keyboard Shortcuts"],
    },
    {
      title: "Company",
      links: ["About", "Careers", "Press", "Contact Us"],
    },
    {
      title: "Community",
      links: ["Forum", "Twitter / X", "Discord", "GitHub"],
    },
  ];

  const SOCIALS = [
    {
      label: "Facebook",
      path: "M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z",
    },
    {
      label: "Instagram",
      path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
    },
    {
      label: "X",
      path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z",
    },
    {
      label: "LinkedIn",
      path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
    },
  ];

  return (
    <footer className="border-t border-slate-100 bg-white pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-14">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center shrink-0">
                <svg
                  viewBox="0 0 48 48"
                  className="w-4 h-4"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 30c8-2 14-8 16-18-10 2-16 8-18 16l-4 8 6-6Z" />
                  <path d="M18 30 30 18" strokeWidth="2" />
                </svg>
              </div>
              <span className="text-[17px] font-bold text-slate-900">Quill</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed mb-5 max-w-[15rem]">
              Empowering focused writing, one document at a time.
            </p>
            <div className="flex items-center gap-2">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {COLS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-slate-900 mb-4">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-400">
          <span>© 2025 Quill. All rights reserved.</span>
          <div className="flex gap-5">
            {["Privacy Policy", "Terms of Service", "Cookie Settings"].map(
              (l) => (
                <a
                  key={l}
                  href="#"
                  className="hover:text-slate-600 transition-colors"
                >
                  {l}
                </a>
              )
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────── */
export default function Home() {
  const router = useRouter();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("sign-in");

  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  return (
    <div className="min-h-screen bg-white font-jakarta text-slate-900">
      <Navbar onSignIn={() => openAuth("sign-in")} onSignUp={() => openAuth("sign-up")} />
      <Hero />
      <StatsBar />
      <Features />
      <Workflow />
      <Pricing />
      <FAQ />
      <CTABanner />
      <Footer />

      {authOpen && (
        <AuthDialog
          mode={authMode}
          onModeChange={setAuthMode}
          onClose={() => setAuthOpen(false)}
          onSuccess={() => {
            setAuthOpen(false);
            router.push("/editor");
          }}
        />
      )}
    </div>
  );
}
