// Frontend config via .env.local
// VITE_API_BASE=http://localhost:8000
// VITE_API_STREAM=0
// VITE_API_STRUCTURED=0
// VITE_API_SUMMARY=0

const API_BASE = (import.meta.env.VITE_API_BASE || "http://localhost:8000").replace(/\/$/, "");
const STREAM_ON = (import.meta.env.VITE_API_STREAM || "0") === "1";
const TRY_STRUCTURED = (import.meta.env.VITE_API_STRUCTURED || "0") === "1";
let SUMMARY_ROUTE_OK = (import.meta.env.VITE_API_SUMMARY || "0") === "1";

async function jsonFetch(url, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
  });
  const text = await res.text();
  const ct = res.headers.get("content-type") || "";
  const data = ct.includes("application/json") ? (text ? JSON.parse(text) : {}) : { raw: text };
  if (!res.ok) {
    const err = new Error(data?.error || data?.message || text || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

function toStructured(history = []) {
  return history.map((m) => ({
    role: m.role === "bot" ? "assistant" : "user",
    content: m.text,
  }));
}
function flattenPrompt(history = []) {
  const turns = history.slice(-20).map((m) =>
    `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`
  );
  return `${turns.join("\n")}\nAssistant:`;
}

function normalizeResponse(data = {}) {
  const answer = data?.answer ?? data?.message ?? data?.reply ?? data?.text ?? "";
  const sources = Array.isArray(data?.sources)
    ? data.sources
    : Array.isArray(data?.links)
      ? data.links
      : [];
  const conversationId = data?.conversation_id ?? data?.conversationId ?? null;
  return { answer, sources, conversationId };
}

export async function sendChat({ history, userMessage, conversationId, signal }) {
  const chatUrl = `${API_BASE}/api/chat`;
  const basePayload = conversationId ? { conversation_id: conversationId } : {};

  if (TRY_STRUCTURED) {
    try {
      const data = await jsonFetch(chatUrl, {
        method: "POST",
        body: JSON.stringify({ ...basePayload, messages: toStructured(history) }),
        signal,
      });

      const { answer, sources, conversationId } = normalizeResponse(data);
      if (typeof answer !== "string") {
        throw new Error("Invalid structured response shape");
      }

      return { data, answer, sources, conversationId, mode: "structured" };
    } catch (err) {
      console.warn("[sendChat] structured failed → legacy:", err.message);
    }
  }

  const data = await jsonFetch(chatUrl, {
    method: "POST",
    body: JSON.stringify({
      ...basePayload,
      message: userMessage || flattenPrompt(history),
    }),
    signal,
  });

  const normalized = normalizeResponse(data);

  return { data, ...normalized, mode: "legacy" };
}


export async function summarizeChat({ history }) {
  if (!SUMMARY_ROUTE_OK) return clientSummary(history);
  const summarizeUrl = `${API_BASE}/api/summarize`;
  try {
    const data = await jsonFetch(summarizeUrl, {
      method: "POST",
      body: JSON.stringify({ messages: toStructured(history.slice(-12)) }),
    });
    if (typeof data?.title !== "string" || typeof data?.summary !== "string")
      throw new Error("Invalid summarize response shape");
    return data;
  } catch (err) {
    if (err.status === 404) SUMMARY_ROUTE_OK = false;
    console.warn("[summarizeChat] using client fallback:", err.message);
    return clientSummary(history);
  }
}

function clientSummary(history = []) {
  const firstUser = history.find((m) => m.role === "user")?.text || "New conversation";
  const lastBot = [...history].reverse().find((m) => m.role === "bot")?.text || "";
  return {
    title: firstUser.replace(/\s+/g, " ").slice(0, 60),
    summary: (firstUser + (lastBot ? " — " + lastBot : "")).replace(/\s+/g, " ").slice(0, 180),
  };
}

export async function streamChat({ history, conversationId, onStage, onToken, signal }) {
  if (!STREAM_ON) return { streamed: false };

  const url = `${API_BASE}/api/chat/stream`;
  const basePayload = conversationId ? { conversation_id: conversationId } : {};
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...basePayload, messages: toStructured(history) }),
      signal,
    });
    if (!res.ok || !res.body) throw new Error("No stream");

    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    onStage?.("analyze");

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const chunks = buf.split("\n\n");
      buf = chunks.pop() || "";

      for (const ch of chunks) {
        let ev = "message", data = "";
        for (const line of ch.split("\n")) {
          if (line.startsWith("event:")) ev = line.slice(6).trim();
          else if (line.startsWith("data:")) data += line.slice(5) + "\n";
        }
        data = data.trim();
        if (ev === "stage") onStage?.(data);
        else if (ev === "token") onToken?.(data);
        else if (ev === "done") return { streamed: true };
      }
    }
    return { streamed: true };
  } catch (e) {
    console.warn("[streamChat] stream failed:", e?.message || e);
    return { streamed: false, error: e };
  }
}
