// components/Bubble.jsx
import React from "react";
import botAvatar from "../assets/bot.jpeg";
import userAvatar from "../assets/user.jpeg";
import Linkify from "./Linkify";

export default function Bubble({ role = "bot", children, ts, links }) {
  const isUser = role === "user";
  const time = ts
    ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  const text = typeof children === "string" ? children : String(children ?? "");

  return (
    <div className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <img
          src={botAvatar}
          alt="Bot avatar"
          className="h-8 w-8 rounded-full object-cover"
        />
      )}

      <div
        className={[
          "max-w-[50%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm",
          "whitespace-pre-wrap break-words",
          isUser ? "bg-[#660000] text-white" : "bg-gray-100 text-gray-900",
        ].join(" ")}
      >
        {/* Main text */}
        <Linkify text={text} />

        {/* Links block – bot only */}
        {!isUser && Array.isArray(links) && links.length > 0 && (
          <div className="mt-2 rounded-lg bg-white border border-zinc-200 p-2 text-xs text-zinc-700">
            <div className="font-semibold mb-1">
              {links.length === 1 ? "Source" : `Sources (${links.length})`}
            </div>
            <ul className="space-y-1 list-disc pl-4">
              {links.map((l, i) => {
                const url = typeof l === "string" ? l : l.url;
                const title = typeof l === "string" ? l : (l.title || l.url);
                if (!url) return null;
                return (
                  <li key={url + i}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-2"
                    >
                      {title}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

        )}

        {/* Timestamp */}
        {!!time && (
          <div className={`mt-1 text-[10px] ${isUser ? "text-white/70" : "text-gray-500"}`}>
            {time}
          </div>
        )}
      </div>

      {isUser && (
        <img
          src={userAvatar}
          alt="User avatar"
          className="h-8 w-8 rounded-full object-cover"
        />
      )}
    </div>
  );
}
