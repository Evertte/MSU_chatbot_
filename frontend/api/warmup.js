// api/warmup.js  (ESM)
export default async function handler(req, res) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);

    const r = await fetch("https://msu-chatbot.onrender.com/health", {
      cache: "no-store",
      signal: ctrl.signal,
    });

    clearTimeout(t);
    res.status(r.ok ? 200 : 502).send(r.ok ? "ok" : "bad");
  } catch {
    res.status(500).send("fail");
  }
}
