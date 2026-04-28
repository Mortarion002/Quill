"use client";

import { cn } from "@/lib/utils";

export type IconName =
  | "archive"
  | "book"
  | "bold"
  | "calendar"
  | "check"
  | "chevron"
  | "clock"
  | "code"
  | "copy"
  | "divider"
  | "drag"
  | "grid"
  | "help"
  | "home"
  | "italic"
  | "link"
  | "list"
  | "numberedList"
  | "map"
  | "more"
  | "note"
  | "plus"
  | "quote"
  | "search"
  | "settings"
  | "share"
  | "spark"
  | "star"
  | "strike"
  | "trash"
  | "type"
  | "wand"
  | "user";

const paths: Record<IconName, React.ReactNode> = {
  archive: <path d="M4 7h16M6 7v11h12V7M9 11h6" />,
  bold: <path d="M7 5h6a3 3 0 0 1 0 6H7V5Zm0 6h7a3.5 3.5 0 0 1 0 7H7v-7Z" />,
  book: <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v16H7.5A2.5 2.5 0 0 0 5 21V5.5ZM5 5.5V21" />,
  calendar: <path d="M7 3v3M17 3v3M4 8h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />,
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  clock: <path d="M12 6v6l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />,
  code: <path d="m9 18-6-6 6-6M15 6l6 6-6 6" />,
  copy: <path d="M8 8h10v10H8zM6 16H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />,
  divider: <path d="M5 12h14" />,
  drag: <path d="M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01" />,
  grid: <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />,
  help: <path d="M9.5 9a2.5 2.5 0 1 1 4.25 1.8c-.92.86-1.75 1.36-1.75 2.7M12 17h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />,
  home: <path d="m4 10 8-7 8 7v10H6V10" />,
  italic: <path d="M10 5h8M6 19h8M14 5l-4 14" />,
  link: <path d="M10 13a5 5 0 0 0 7.54.54l2-2a5 5 0 0 0-7.07-7.07l-1.1 1.1M14 11a5 5 0 0 0-7.54-.54l-2 2a5 5 0 0 0 7.07 7.07l1.1-1.1" />,
  list: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
  numberedList: <path d="M10 6h11M10 12h11M10 18h11M4 5h1v4M3.5 9h2M3 11.5h2.5L3 15h3M3 18h2a1 1 0 0 1 0 2H3" />,
  map: <path d="m9 18-5 2V6l5-2 6 2 5-2v14l-5 2-6-2Zm0 0V4m6 16V6" />,
  more: <path d="M5 12h.01M12 12h.01M19 12h.01" />,
  note: <path d="M7 3h7l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm7 0v5h5M9 13h6M9 17h6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  quote: <path d="M8 12H5a4 4 0 0 1 4-4v8H5v-4M19 12h-3a4 4 0 0 1 4-4v8h-4v-4" />,
  search: <path d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />,
  settings: <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm0-12v2m0 13v2m8.5-8.5h-2m-13 0h-2m14.01-6.01-1.42 1.42M7.91 16.09l-1.42 1.42m0-11.02 1.42 1.42m8.18 8.18 1.42 1.42" />,
  share: <path d="M16 8a3 3 0 1 0-2.83-4M8 12l8-4M8 12l8 4M6 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm10 5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />,
  spark: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Zm6 12 1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z" />,
  star: <path d="m12 3 2.7 5.47 6.04.88-4.37 4.26 1.03 6.02L12 16.79l-5.4 2.84 1.03-6.02-4.37-4.26 6.04-.88L12 3Z" />,
  strike: <path d="M6 16a4 4 0 0 0 4 2h4a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h3a4 4 0 0 1 4 2M4 12h16" />,
  trash: <path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3" />,
  type: <path d="M4 7V4h16v3M9 20h6M12 4v16" />,
  wand: <path d="m15 4 1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3ZM5 15l4 4M3 21 14 10" />,
  user: <path d="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />,
};

export function Icon({
  name,
  className,
  strokeWidth = 1.9,
}: {
  name: IconName;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      className={cn("h-4 w-4 shrink-0", className)}
    >
      {paths[name]}
    </svg>
  );
}
