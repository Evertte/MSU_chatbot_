import { useEffect, useState } from "react";

const STAGE_TEXT = {
  analyze: "Analyzing your question",
  search: "Searching campus sources",
  think: "Thinking",
  write: "Longer think gives better answers",
  finalize: "Finishing up",
};


 
export default function TypingIndicator({ stage }) {
  const [showTip, setShowTip] = useState(false);
  useEffect(() => {
    if (stage === "think") {
      const t = setTimeout(() => setShowTip(true), 2500);
      return () => clearTimeout(t);
    }
    setShowTip(false);
  }, [stage]);

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
            Longer think gives better answers
          </span>
        )}
      </div>
    </div>
  );
}

