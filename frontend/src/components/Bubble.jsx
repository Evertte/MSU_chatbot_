// components/Bubble.jsx
import botAvatar from "../assets/bot.jpeg";
import userAvatar from "../assets/user.jpeg";
import React from "react";

// --- tiny inline linkifier (no extra file needed) ---
const URL_RE = /((https?:\/\/|www\.)[^\s<]+)/gi;
function Linkify({ text }) {
  if (text == null) return null;
  const parts = String(text).split(URL_RE);

  const isUrl = (s) => /^(https?:\/\/|www\.)/i.test(s);

  return parts.map((part, i) => {
    if (!isUrl(part)) return <React.Fragment key={i}>{part}</React.Fragment>;
    const href = part.startsWith("http") ? part : `https://${part}`;
    return (
      <a
        key={i}
        href={href}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="underline underline-offset-2 text-blue-600 hover:opacity-90"
      >
        {part}
      </a>
    );
  });
}
// ----------------------------------------------------

export default function Bubble({ role = "bot", children, ts }) {
  const isUser = role === "user";
  const time = ts
    ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <img src={botAvatar} alt="Bot avatar" className="h-8 w-8 rounded-full object-cover" />
      )}

      <div
        className={[
          // layout & readability
          "max-w-[50%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm",
          "whitespace-pre-wrap break-words", // keep newlines, wrap long URLs
          // colors (light-only, per your latest snippet)
          isUser ? "bg-[#660000] text-white" : "bg-gray-100 text-gray-900",
        ].join(" ")}
      >
        <Linkify text={children} />

        {!!time && (
          <div className={`mt-1 text-[10px] ${isUser ? "text-white/70" : "text-gray-500"}`}>
            {time}
          </div>
        )}
      </div>

      {isUser && (
        <img src={userAvatar} alt="User avatar" className="h-8 w-8 rounded-full object-cover" />
      )}
    </div>
  );
}
