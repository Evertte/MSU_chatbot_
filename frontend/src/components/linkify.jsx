// src/components/Linkify.jsx
import React from "react";

// simple URL matcher: http(s)://... or www....
const URL_RE = /((https?:\/\/|www\.)[^\s<]+)/gi;

export default function Linkify({ text }) {
  if (!text) return null;

  const parts = String(text).split(URL_RE);

  return parts.map((part, i) => {
    const isUrl = URL_RE.test(part);
    if (!isUrl) return <React.Fragment key={i}>{part}</React.Fragment>;

    // normalize href (add https for bare www.)
    const href = part.startsWith("http") ? part : `https://${part}`;

    return (
      <a
        key={i}
        href={href}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="underline underline-offset-2 text-blue-600 hover:opacity-90 dark:text-blue-400"
      >
        {part}
      </a>
    );
  });
}
