import React from "react";

const URL_RE = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/gi;
const TRAIL_PUNCT_RE = /[.,!?);:\]]+$/;

function stripTrailingPunct(raw) {
  let u = raw.replace(TRAIL_PUNCT_RE, "");
  const opens = (u.match(/\(/g) || []).length;
  const closes = (u.match(/\)/g) || []).length;
  if (closes < opens && raw.endsWith(")")) u += ")";
  return u;
}

export default function Linkify({ text }) {
  if (text == null) return null;
  const str = String(text);
  const nodes = [];
  let last = 0;

  for (const m of str.matchAll(URL_RE)) {
    const i = m.index;
    const raw = m[0];

    if (i > last) nodes.push(<React.Fragment key={`t:${last}`}>{str.slice(last, i)}</React.Fragment>);

    const cleaned = stripTrailingPunct(raw);
    const href = /^https?:\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`;

    nodes.push(
      <a
        key={`u:${i}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="underline underline-offset-2 text-blue-600 hover:opacity-90 dark:text-blue-400"
      >
        {cleaned}
      </a>
    );

    last = i + raw.length; // skip past original token
  }

  if (last < str.length) nodes.push(<React.Fragment key={`tail:${last}`}>{str.slice(last)}</React.Fragment>);
  return <>{nodes}</>;
}
