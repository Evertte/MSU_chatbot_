// components/Bubble.jsx
import React from "react";
import Linkify from "./Linkify";

export default function Bubble({ role = "bot", children, ts, links, onRefresh }) {
  const isUser = role === "user";
  const time = ts
    ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  const text = typeof children === "string" ? children : String(children ?? "");

  function handleCopy() {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(text).catch(() => {});
  }

  function cleanBotText(raw) {
    if (!raw) return "";
    let out = String(raw);
    // Strip markdown links: [label](url) -> label
    out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, "$1");
    // Remove bare URLs
    out = out.replace(/https?:\/\/[^\s]+/g, "");
    out = out.replace(/www\.[^\s]+/g, "");
    return out.trim();
  }

  // Hide empty bot placeholders until some text is present
  if (!isUser && (!text || !text.trim())) {
    return null;
  }

  if (isUser) {
    return (
      <div className="flex items-end gap-2 justify-end">
      <div className="flex flex-col items-end gap-1 max-w-[55%]">
          <div className="relative w-full">
            <div
              className={[
                "w-full rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm",
                "whitespace-pre-wrap break-words",
                "bg-[#660000] text-white",
              ].join(" ")}
            >
              <Linkify text={text} />
            </div>
            <span className="absolute -right-2 bottom-2 h-0 w-0 border-t-6 border-t-transparent border-b-6 border-b-transparent border-l-8 border-l-[#660000]" />
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-700">
            {!!time && <span>{time}</span>}
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 rounded-full border border-[#660000] bg-[#f5f5dc] px-2 py-0.5 text-[10px] text-[#660000] hover:bg-white"
            >
              ⧉ <span>Copy</span>
            </button>
          </div>
        </div>

        <div className="h-10 w-10 rounded-full bg-white text-[#660000] border-2 border-[#660000] shadow-md flex items-center justify-center text-[11px] font-black select-none">
          YOU
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <div className="bot-avatar h-10 w-10 flex items-center justify-center rounded-full bg-[#660000] text-white text-[10px] font-bold border border-[#4a0000] shadow-md select-none">
        MSU
      </div>
      <div className="flex flex-col gap-2 max-w-[55%]">
        <div className="relative">
          <div className="rounded-2xl border border-slate-200 bg-white text-slate-700 p-3 shadow-[0_10px_25px_rgba(0,0,0,0.12)]">
            <div className="text-[14px] leading-[1.5] whitespace-pre-wrap break-words">
              {cleanBotText(text)}
            </div>
            {Array.isArray(links) && links.length > 0 && (
              <div className="mt-2 text-[11px] text-slate-600 font-semibold">
                For more details, check the sources below.
              </div>
            )}

            {/* Collapsible sources */}
            {Array.isArray(links) && links.length > 0 && (
              <details className="mt-3 rounded-lg border border-slate-200 bg-slate-100 text-slate-900 p-2">
                <summary className="flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-slate-800 cursor-pointer marker:content-['']">
                  <span className="font-semibold text-slate-900">Sources ({links.length})</span>
                  <span className="text-xs">▾</span>
                </summary>
                <div className="mt-2 flex items-center gap-2 flex-wrap text-[12px] text-slate-800">
                  {links.map((l, i) => {
                    const url = typeof l === "string" ? l : l?.url;
                    const title = typeof l === "string" ? l : l?.title || l?.url || "Source";
                    if (!url) return null;
                    return (
                      <a
                        key={url + i}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        title={title}
                        className="source-circle inline-flex h-[26px] w-[26px] items-center justify-center rounded-full bg-slate-200 border border-slate-300 text-[11px] text-slate-900 hover:bg-slate-300"
                      >
                        {i + 1}
                      </a>
                    );
                  })}
                  <span className="text-[11px] text-slate-800">
                    Click a source number to open the link.
                  </span>
                </div>
              </details>
            )}
          </div>
          <span className="absolute -left-2 top-1/2 -translate-y-1/2 h-0 w-0 border-t-6 border-t-transparent border-b-6 border-b-transparent border-r-8 border-r-white" />
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between gap-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-[#f5f5dc] px-2 py-0.5">
            <button
              type="button"
              onClick={onRefresh}
              className="meta-btn flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2.5 py-0.5 text-[10px] text-slate-700"
            >
              ⟳ <span>Refresh</span>
            </button>
            {!!time && <span className="ml-1 text-[10px] text-slate-500">{time}</span>}
          </div>
          <div />
        </div>
      </div>
    </div>
  );
}
