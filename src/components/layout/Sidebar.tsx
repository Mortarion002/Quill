"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { useDocumentStore } from "@/store/useDocumentStore";
import { useUIStore, type WorkspaceView } from "@/store/useUIStore";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

const NAV_ITEMS: {
  icon: Parameters<typeof Icon>[0]["name"];
  label: string;
  view: WorkspaceView;
  count?: "pages" | "trash";
}[] = [
  { icon: "search", label: "Search", view: "search" },
  { icon: "note", label: "Pages", view: "pages", count: "pages" },
  { icon: "star", label: "Favorites", view: "favorites" },
  { icon: "grid", label: "Templates", view: "templates" },
  { icon: "settings", label: "Settings", view: "settings" },
];

const FOOTER_ITEMS: {
  icon: Parameters<typeof Icon>[0]["name"];
  label: string;
  view: WorkspaceView;
  count?: "trash";
}[] = [
  { icon: "help", label: "Help", view: "help" },
  { icon: "trash", label: "Trash", view: "trash", count: "trash" },
];

function NavButton({
  icon,
  label,
  view,
  count,
}: {
  icon: Parameters<typeof Icon>[0]["name"];
  label: string;
  view: WorkspaceView;
  count?: number;
}) {
  const { workspaceView, setWorkspaceView } = useUIStore();
  const isActive = workspaceView === view;

  return (
    <button
      type="button"
      onClick={() => setWorkspaceView(view)}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150",
        isActive
          ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200/80"
          : "text-slate-500 hover:bg-white/65 hover:text-slate-900"
      )}
    >
      <Icon name={icon} className={cn("h-4.5 w-4.5", isActive ? "text-slate-800" : "text-slate-400")} />
      <span className="flex-1 text-left font-medium">{label}</span>
      {!!count && (
        <span className="rounded-md bg-violet-100 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-violet-600">
          {count}
        </span>
      )}
    </button>
  );
}

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

export function Sidebar() {
  const { pages, createPage } = useDocumentStore();
  const { setWorkspaceView } = useUIStore();
  const liveCount = pages.filter((page) => !page.deletedAt).length;
  const trashCount = pages.filter((page) => page.deletedAt).length;

  const resolveCount = (count?: "pages" | "trash") => {
    if (count === "pages") return liveCount;
    if (count === "trash") return trashCount;
    return undefined;
  };

  const handleNewPage = () => {
    createPage("Untitled");
    setWorkspaceView("editor");
  };

  return (
    <aside className="sidebar-shell fixed inset-y-0 left-0 z-50 flex w-68 flex-col border-r border-white/70 bg-[#f5f6fb]/88 shadow-[0_24px_70px_rgba(79,70,120,0.16)] backdrop-blur-2xl">
      <div className="px-5 pt-5 pb-3">
        <button
          type="button"
          onClick={() => setWorkspaceView("editor")}
          className="group flex w-full items-center gap-3 rounded-2xl p-2 text-left transition-colors hover:bg-white/70"
        >
          <QuillMark />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[21px] font-extrabold leading-tight tracking-normal text-slate-950">
              Quill
            </span>
            <span className="truncate text-[13px] font-medium leading-snug text-slate-500">
              Quiet writing space
            </span>
          </div>
        </button>
      </div>

      <div className="px-5 pb-4">
        <button
          type="button"
          onClick={handleNewPage}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(124,58,237,0.22)] transition-all duration-200 hover:bg-violet-500 active:scale-[0.98]"
        >
          <Icon name="plus" className="h-4.5 w-4.5" />
          New Page
        </button>
      </div>

      <nav className="flex flex-col gap-1 px-5 pb-3">
        {NAV_ITEMS.map((item) => (
          <NavButton key={item.view} {...item} count={resolveCount(item.count)} />
        ))}
      </nav>

      <div className="mx-5 border-t border-slate-200/75" />
      <div className="flex-1 min-h-0" />

      <div className="mx-5 mb-4 rounded-2xl border border-slate-200/80 bg-white/78 p-3 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
        <nav className="flex flex-col gap-1">
          {FOOTER_ITEMS.map((item) => (
            <NavButton key={item.view} {...item} count={resolveCount(item.count)} />
          ))}
        </nav>
        <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
          <Show when="signed-out">
            <div className="grid w-full grid-cols-2 gap-2">
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-slate-700 shadow-sm transition-colors hover:text-slate-950"
                >
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button
                  type="button"
                  className="rounded-xl bg-violet-600 px-3 py-2 text-[12px] font-semibold text-white shadow-sm transition-colors hover:bg-violet-500"
                >
                  Sign up
                </button>
              </SignUpButton>
            </div>
          </Show>
          <Show when="signed-in">
            <UserButton />
            <div className="min-w-0">
              <p className="truncate text-[12px] font-semibold text-slate-900">Workspace User</p>
              <p className="truncate text-[11px] text-slate-400">Signed in</p>
            </div>
          </Show>
        </div>
      </div>
    </aside>
  );
}
