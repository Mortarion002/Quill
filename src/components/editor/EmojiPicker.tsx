"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const EMOJIS = [
  "📝","📄","📃","📋","📊","📈","💡","🎯",
  "🚀","⭐","🔥","✨","💼","🗂️","📌","🔍",
  "🧠","🤝","💪","🎉","❤️","🌟","🎨","🏆",
  "💎","🔮","🌈","🎭","📚","🖊️","⚡","🎪",
  "🌙","☀️","🌊","🍀","🦁","🦊","🐙","🦋",
  "🌸","🍎","🍕","☕","🎵","🎮","💻","📱",
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.97 }}
      transition={{ duration: 0.13, ease: "easeOut" }}
      className="absolute top-full left-0 mt-2 z-50 p-2.5 rounded-2xl border border-white/8 emoji-picker-panel"
    >
      <div className="grid grid-cols-8 gap-0.5">
        {EMOJIS.map((emoji) => (
          <button
            type="button"
            key={emoji}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onSelect(emoji)}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-xl hover:bg-white/8 transition-colors duration-75 select-none"
          >
            {emoji}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
