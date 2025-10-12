import { useEffect, useState } from "react";

const STAGE_TEXT = {
  analyze: "Analyzing your question",
  search: "Searching campus sources",
  think: "Thinking",
  write: "Longer think → better answers",
  finalize: "Finishing up",
};

export default function TypingIndicator({ stage, onSkip }) {
  const [showTip, setShowTip] = useState(false);
  const showSkip = stage === "analyze" || stage === "search" || stage === "think";

  useEffect(() => {
    if (stage === "think") {
      const t = setTimeout(() => setShowTip(true), 2500);
      return () => clearTimeout(t);
    }
    setShowTip(false);
  }, [stage]);

  // Keyboard shortcut: S or Esc to skip
  useEffect(() => {
    if (!showSkip || !onSkip) return;
    const onKey = (e) => {
      const k = e.key?.toLowerCase?.() || "";
      if (k === "s" || k === "escape") onSkip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showSkip, onSkip]);

  if (!stage) return null;
  const label = STAGE_TEXT[stage] || "Working";

  return (
    <div className="flex items-center justify-between px-4 py-2 text-xs text-zinc-600">
      <div className="flex items-center gap-2">
        <span className="inline-block size-2 rounded-full bg-zinc-400 animate-pulse" />
        <span className="font-medium">{label}</span>
        <span className="typing-dots inline-flex">
          <span className="mx-0.5 animate-bounce [animation-delay:0ms]">·</span>
          <span className="mx-0.5 animate-bounce [animation-delay:150ms]">·</span>
          <span className="mx-0.5 animate-bounce [animation-delay:300ms]">·</span>
        </span>
        {showTip && (
          <span className="ml-2 text-[11px] text-zinc-500">
            Longer think → better answers
          </span>
        )}
      </div>

      {showSkip && onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="rounded-full bg-zinc-900 px-3 py-1.5 text-[11px] font-medium text-white shadow hover:opacity-90 dark:bg-zinc-700"
          title="Skip wait (S or Esc)"
          aria-label="Skip wait"
        >
          Skip
        </button>
      )}
    </div>
  );
}