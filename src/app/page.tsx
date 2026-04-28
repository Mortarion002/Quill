import Link from "next/link";

/* ─── Quill feather mark (matches Sidebar.tsx) ─── */
function QuillMark() {
  return (
    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-violet-100 shadow-[0_14px_30px_rgba(15,23,42,0.18)]">
      <svg
        aria-hidden="true"
        viewBox="0 0 48 48"
        className="h-8 w-8"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 30c8-2 14-8 16-18-10 2-16 8-18 16l-4 8 6-6Z" strokeWidth="3" />
        <path d="M18 30 30 18" strokeWidth="2.5" />
        <path d="M31 31l1.2 3.3L35.5 36l-3.3 1.2L31 40.5l-1.2-3.3L26.5 36l3.3-1.7L31 31Z" strokeWidth="2" />
      </svg>
    </div>
  );
}

/* ─── Chevron right icon ─── */
function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

/* ─── Feature cards ─── */
const FEATURES = [
  {
    icon: <path d="M7 3h7l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm7 0v5h5M9 13h6M9 17h6" />,
    title: "Block editor",
    description: "Paragraphs, headings, lists, blockquotes, and code blocks. Type '/' to insert any element without leaving the keyboard.",
  },
  {
    icon: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Zm6 12 1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z" />,
    title: "Slash commands",
    description: "A full command palette at your cursor. Format, convert, or insert blocks without touching the mouse.",
  },
  {
    icon: <path d="M16 8a3 3 0 1 0-2.83-4M8 12l8-4M8 12l8 4M6 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm10 5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />,
    title: "Cloud sync",
    description: "Sign in once and your documents follow you across every device. Works fully offline without an account.",
  },
  {
    icon: <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm0-12v2m0 13v2m8.5-8.5h-2m-13 0h-2m14.01-6.01-1.42 1.42M7.91 16.09l-1.42 1.42m0-11.02 1.42 1.42m8.18 8.18 1.42 1.42" />,
    title: "Inspector panel",
    description: "Contextual design and typography controls for every block. Open it when you need it, hidden when you don't.",
  },
  {
    icon: <path d="m12 3 2.7 5.47 6.04.88-4.37 4.26 1.03 6.02L12 16.79l-5.4 2.84 1.03-6.02-4.37-4.26 6.04-.88L12 3Z" />,
    title: "Favorites",
    description: "Star your most important documents to surface them in the Favorites view — always one click away.",
  },
  {
    icon: <path d="M4 7V4h16v3M9 20h6M12 4v16" />,
    title: "Editor settings",
    description: "Switch between Sans, Serif, and Mono fonts. Adjust line spacing and spell check — settings that respect your workflow.",
  },
] as const;

/* ─── Template cards ─── */
const TEMPLATES = [
  {
    emoji: "👥",
    title: "Meeting Notes",
    description: "Capture action items, decisions, and attendees.",
    color: "from-violet-50 to-indigo-50 border-violet-100/80",
  },
  {
    emoji: "💡",
    title: "Brainstorm",
    description: "Freeform canvas for ideas and connections.",
    color: "from-amber-50 to-orange-50 border-amber-100/80",
  },
  {
    emoji: "🗺️",
    title: "Product Roadmap",
    description: "Track milestones and quarterly phases.",
    color: "from-emerald-50 to-teal-50 border-emerald-100/80",
  },
] as const;

/* ─── Page ─── */
export default function Home() {
  return (
    <div className="min-h-screen bg-white font-[Inter,ui-sans-serif,system-ui,sans-serif]">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/88 px-8 backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <QuillMark />
          <div>
            <p className="text-[18px] font-extrabold leading-tight tracking-tight text-slate-950">Quill</p>
            <p className="text-[12px] font-medium text-slate-400">Quiet writing space</p>
          </div>
        </div>
        <Link
          href="/editor"
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-slate-800"
        >
          Open workspace
          <ChevronRight />
        </Link>
      </nav>

      {/* ── Hero ── */}
      <section className="mx-auto max-w-3xl px-8 py-28 text-center">
        <p className="mb-5 inline-block rounded-full border border-violet-200 bg-violet-50 px-3.5 py-1 text-[12px] font-semibold text-violet-700">
          Local-first · Cloud sync · No distractions
        </p>
        <h1 className="mb-5 text-[54px] font-extrabold leading-[1.06] tracking-[-0.03em] text-slate-950">
          A quiet workspace<br className="hidden sm:block" /> for focused writing.
        </h1>
        <p className="mx-auto mb-10 max-w-lg text-[18px] leading-relaxed text-slate-500">
          Quill is a block-style writing environment with slash commands, cloud sync, and a polished inspector. Write without noise.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/editor"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-7 py-3.5 text-[14px] font-semibold text-white shadow-[0_8px_24px_rgba(15,23,42,0.18)] transition-all hover:bg-slate-800 hover:shadow-[0_12px_32px_rgba(15,23,42,0.24)]"
          >
            Start writing
            <ChevronRight />
          </Link>
          <Link
            href="/editor"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-[14px] font-semibold text-slate-600 transition-all hover:border-slate-300 hover:text-slate-950"
          >
            Browse templates
          </Link>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="mx-auto max-w-5xl px-8 pb-28">
        <p className="mb-10 text-center text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          Everything you need, nothing you don&apos;t
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_4px_rgba(15,23,42,0.05)] transition-shadow hover:shadow-[0_6px_20px_rgba(15,23,42,0.08)]"
            >
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  {f.icon}
                </svg>
              </div>
              <h3 className="mb-1.5 text-[15px] font-semibold text-slate-950">{f.title}</h3>
              <p className="text-[13px] leading-relaxed text-slate-500">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Templates ── */}
      <section className="border-t border-slate-100 bg-slate-50 px-8 py-24">
        <div className="mx-auto max-w-5xl">
          <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-widest text-slate-400">Templates</p>
          <h2 className="mb-12 text-center text-[34px] font-extrabold tracking-[-0.02em] text-slate-950">
            Get started in seconds.
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {TEMPLATES.map((t) => (
              <Link
                key={t.title}
                href="/editor"
                className={`group flex flex-col gap-4 rounded-2xl border bg-gradient-to-br p-6 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(15,23,42,0.08)] ${t.color}`}
              >
                <span className="text-3xl">{t.emoji}</span>
                <div>
                  <p className="mb-1 text-[15px] font-semibold text-slate-950">{t.title}</p>
                  <p className="text-[13px] leading-snug text-slate-500">{t.description}</p>
                </div>
                <span className="mt-auto text-[12px] font-semibold text-slate-400 transition-colors group-hover:text-slate-700">
                  Use template →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="mx-auto max-w-2xl px-8 py-24 text-center">
        <div className="mb-6 flex justify-center">
          <QuillMark />
        </div>
        <h2 className="mb-4 text-[32px] font-extrabold tracking-[-0.02em] text-slate-950">
          Ready to write clearly?
        </h2>
        <p className="mb-8 text-[16px] leading-relaxed text-slate-500">
          Open your workspace and start immediately. No account required to get started.
        </p>
        <Link
          href="/editor"
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-8 py-4 text-[14px] font-semibold text-white shadow-[0_14px_28px_rgba(124,58,237,0.22)] transition-all hover:bg-violet-500 hover:shadow-[0_18px_36px_rgba(124,58,237,0.28)]"
        >
          Open Quill workspace
          <ChevronRight />
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-100 px-8 py-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <p className="text-[12px] text-slate-400">Quill — Quiet writing space</p>
          <Link
            href="/editor"
            className="text-[12px] text-slate-400 transition-colors hover:text-slate-700"
          >
            Open workspace →
          </Link>
        </div>
      </footer>

    </div>
  );
}
