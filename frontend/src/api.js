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

export async function streamChat({ history, userMessage, conversationId, onStage, onToken, signal }) {
  if (!STREAM_ON) return { streamed: false };

  const url = `${API_BASE}/api/chat?stream=1`;
  const payload = {
    message: userMessage || history?.slice(-1)?.[0]?.text || flattenPrompt(history),
  };
  if (conversationId) payload.conversation_id = conversationId;

  const processBuffer = (chunk, state) => {
    const lines = chunk
      .split("\n")
      .filter((l) => l.startsWith("data:"))
      .map((l) => l.slice(5).trim());
    if (!lines.length) return null;
    const dataStr = lines.join("\n");
    if (!dataStr) return null;
    let parsed;
    try {
      parsed = JSON.parse(dataStr);
    } catch (err) {
      console.warn("[streamChat] bad json chunk:", err.message);
      return null;
    }
    const { answer_chunk, done, sources, conversation_id } = parsed;
    if (answer_chunk) {
      state.answer += answer_chunk;
      onToken?.(answer_chunk);
    }
    if (Array.isArray(sources) && sources.length > 0) {
      state.sources = sources;
    }
    if (conversation_id) state.conversationId = conversation_id;
    return done === true;
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal,
    });
    if (!res.ok || !res.body) throw new Error("No stream");

    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    const state = { answer: "", sources: [], conversationId: conversationId || null };
    onStage?.("analyze");

    const flush = () => {
      const chunks = buf.split("\n\n");
      buf = chunks.pop() || "";
      for (const ch of chunks) {
        const isDone = processBuffer(ch, state);
        if (isDone) return true;
      }
      return false;
    };

    for (;;) {
      const { done, value } = await reader.read();
      buf += dec.decode(value || new Uint8Array(), { stream: !done });
      if (flush()) break;
      if (done) {
        if (buf.trim()) flush();
        break;
      }
    }
    return { streamed: true, answer: state.answer, sources: state.sources, conversationId: state.conversationId };
  } catch (e) {
    console.warn("[streamChat] stream failed:", e?.message || e);
    return { streamed: false, error: e };
  }
}
