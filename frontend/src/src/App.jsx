// src/App.jsx
import { useEffect, useRef, useState } from "react";

import Shell from "./components/Shell";
import Header from "./components/Header";
import MessageList from "./components/MessageList";
import Bubble from "./components/Bubble";
import ChatInput from "./components/ChatInput";
import TypingIndicator from "./components/TypingIndicator";
import FollowUpHint from "./components/FollowUpHint";

import Sidebar from "./components/Sidebar";
import SidebarDrawer from "./components/SidebarDrawer";
import ExpandFab from "./components/ExpandFab";

import useConversations from "./hooks/useConversations";
import { sendChat, summarizeChat, streamChat } from "./api";

import { clipHistory, makeFollowUpPrompt } from "./utils/followup";
import { typeOut } from "./utils/typewriter";

// ————————————————————————————————————————————————————————————————
// Helpers for stage mapping and sidebar resizing
function mapStage(s) {
  const v = (s || "").toLowerCase();
  if (v.startsWith("analy")) return "analyze";
  if (v.startsWith("search") || v.startsWith("retriev")) return "search";
  if (v.startsWith("think") || v.startsWith("reason")) return "think";
  if (v.startsWith("write") || v.startsWith("generate")) return "write";
  if (v.startsWith("final")) return "finalize";
  return "analyze";
}
// ————————————————————————————————————————————————————————————————

export default function App() {
  // Conversations store (titles, summaries, messages)
  const {
    conversations,
    selectedId,
    selected,
    newConversation,
    selectConversation,
    deleteConversation,
    renameConversation,
    togglePin,
    addMessage,
    patchMessage,
    setTitleSummary,
  } = useConversations();

  // Ensure at least one conversation exists
  useEffect(() => {
    if (!selectedId) newConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // Sidebar UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const resizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(320);
  const MIN_W = 200, MAX_W = 520;

  function beginResize(e) {
    if (sidebarCollapsed) return;
    resizingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = sidebarWidth;
    window.addEventListener("mousemove", onResize);
    window.addEventListener("mouseup", endResize);
  }
  function onResize(e) {
    if (!resizingRef.current) return;
    const dx = e.clientX - startXRef.current;
    const next = Math.min(MAX_W, Math.max(MIN_W, startWidthRef.current + dx));
    setSidebarWidth(next);
  }
  function endResize() {
    resizingRef.current = false;
    window.removeEventListener("mousemove", onResize);
    window.removeEventListener("mouseup", endResize);
  }
  useEffect(() => () => endResize(), []);

  // Stages + Skip
  const [stage, setStage] = useState(null); // "analyze" | "search" | "think" | "write" | "finalize" | null
  const skipRef = useRef(false);
  function skipCurrent() {
    skipRef.current = true;
    if (stage === "analyze" || stage === "search" || stage === "think") {
      setStage("thinking");
    }
  }

  // Track the in-flight turn so we can "Treat as new"
  const [turn, setTurn] = useState(null);
  // turn shape:
  // { convoId, botId, userText, apiHistory, mode:'followup'|'new', path:'stream'|'fallback', controller, timers:[...] }

  async function handleSend(text) {
    const convoId = selectedId || newConversation();
    skipRef.current = false;

    // Previous messages (before this user turn) for follow-up detection
    const prevMsgs = conversations.find(c => c.id === convoId)?.messages || [];
    const clippedPrev = clipHistory(prevMsgs, 16);

    // Decide follow-up vs new; craft legacy single-string payload for backend
    const { isFollowUp, message: legacyMessageForBackend } = makeFollowUpPrompt(clippedPrev, text);

    // Display user's message
    const userMsg = { id: crypto.randomUUID(), role: "user", text, ts: Date.now() };
    addMessage(convoId, userMsg);

    // Client-side history we keep (for summaries, and for future streaming support)
    const apiHistory = clippedPrev.concat({ role: "user", text });

    // Placeholder bot bubble
    const botId = crypto.randomUUID();
    addMessage(convoId, { id: botId, role: "bot", text: "", ts: Date.now() });

    setStage("analyze");

    // Try streaming first (if enabled in api.js)
    let streamedBuffer = "";
    const streamController = new AbortController();
    const streamed = await streamChat({
      history: apiHistory,
      onStage: (s) => setStage(skipRef.current ? "write" : mapStage(s)),
      onToken: (chunk) => {
        streamedBuffer += chunk;
        patchMessage(convoId, botId, { text: streamedBuffer });
      },
      signal: streamController.signal,
    });

    if (streamed?.streamed) {
      setTurn(null);
      setStage("finalize");
      try {
        const { title, summary } = await summarizeChat({
          history: [...apiHistory, { role: "bot", text: streamedBuffer }],
        });
        setTitleSummary(convoId, { title, summary });
      } finally {
        setTimeout(() => setStage(null), 300);
      }
      return;
    }

    // Fallback: staged timers + abortable fetch for "Treat as new"
    const t1 = setTimeout(() => !skipRef.current && setStage("search"), 500);
    const t2 = setTimeout(() => !skipRef.current && setStage("think"), 1200);
    const t3 = setTimeout(() => setStage("write"), skipRef.current ? 0 : 2200);
    const fallbackController = new AbortController();

    setTurn({
      convoId,
      botId,
      userText: text,
      apiHistory,
      mode: isFollowUp ? "followup" : "new",
      path: "fallback",
      controller: fallbackController,
      timers: [t1, t2, t3],
    });

    try {
      // Send with the legacy single-string payload your backend expects
      const { reply } = await sendChat({
        history: apiHistory,
        legacyMessage: legacyMessageForBackend,
        signal: fallbackController.signal,
      });

      // Clean stage timers
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      setStage("write");

      if (skipRef.current) {
        patchMessage(convoId, botId, { text: reply || "…" });
      } else {
        await typeOut({
          convoId,
          msgId: botId,
          fullText: reply || "…",
          perCharMs: 12,
          patchMessage,
          skipRef,
        });
      }

      setStage("finalize");
      const { title, summary } = await summarizeChat({
        history: [...apiHistory, { role: "bot", text: reply || "" }],
      });
      setTitleSummary(convoId, { title, summary });
    } catch (err) {
      if (err?.name === "AbortError") {
        // aborted on purpose (Treat as new). UI flow will proceed in the retry.
      } else {
        console.error(err);
        clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
        setStage(null);
        patchMessage(convoId, botId, { text: "Sorry—something went wrong talking to the server." });
      }
    } finally {
      // Clear stage a moment after finishing unless a retry is in flight
      setTimeout(() => setStage(null), 400);
    }
  }

  // Click handler for the inline hint: cancel current turn & resend as NEW
  async function treatCurrentAsNew() {
    const t = turn;
    if (!t) return;

    // Abort pending request & timers
    try { t.controller?.abort(); } catch {}
    (t.timers || []).forEach((x) => clearTimeout(x));

    // Clear the bot bubble and restart stages
    patchMessage(t.convoId, t.botId, { text: "" });
    setStage("analyze");

    // New abort controller for the retry
    const retryController = new AbortController();

    // Update the turn (mode becomes 'new')
    setTurn({ ...t, mode: "new", controller: retryController });

    // Quick staged feel
    const r1 = setTimeout(() => setStage("search"), 300);
    const r2 = setTimeout(() => setStage("think"), 900);
    const r3 = setTimeout(() => setStage("write"), 1600);

    try {
      const { reply } = await sendChat({
        history: t.apiHistory,
        legacyMessage: t.userText, // send raw user text as a brand-new topic
        signal: retryController.signal,
      });

      clearTimeout(r1); clearTimeout(r2); clearTimeout(r3);
      setStage("write");

      if (skipRef.current) {
        patchMessage(t.convoId, t.botId, { text: reply || "…" });
      } else {
        await typeOut({
          convoId: t.convoId,
          msgId: t.botId,
          fullText: reply || "…",
          perCharMs: 12,
          patchMessage,
          skipRef,
        });
      }

      setStage("finalize");
      const { title, summary } = await summarizeChat({
        history: [...t.apiHistory, { role: "bot", text: reply || "" }],
      });
      setTitleSummary(t.convoId, { title, summary });
    } catch (err) {
      if (err?.name !== "AbortError") {
        console.error(err);
        setStage(null);
        patchMessage(t.convoId, t.botId, { text: "Sorry—something went wrong talking to the server." });
      }
    } finally {
      setTurn(null);
      setTimeout(() => setStage(null), 400);
    }
  }

  if (!selected) return null; // wait a tick for first convo to be created

  const showFollowUpHint =
    !!turn &&
    turn.path === "fallback" &&
    turn.mode === "followup" &&
    stage &&
    stage !== "finalize";

  return (
    <div className="min-h-screen bg-[#f5f5dc] text-zinc-900">
      <Shell>
        {/* Desktop sidebar */}
        <Sidebar
          conversations={conversations}
          selectedId={selectedId}
          onSelect={selectConversation}
          onNew={newConversation}
          onDelete={deleteConversation}
          onRename={renameConversation}
          onPin={togglePin}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(v => !v)}
          width={sidebarWidth}
          onResizeStart={beginResize}
        />

        {/* Chat pane */}
        <div className="flex-1 min-w-0 min-h-0 grid grid-rows-[auto,1fr,auto] bg-transparent">
          <Header />
          <MessageList>
            {selected.messages.map(m => (
              <Bubble key={m.id} role={m.role} ts={m.ts}>
                {m.text}
              </Bubble>
            ))}
            {/* Typing status + inline follow-up hint */}
            <TypingIndicator stage={stage} onSkip={skipCurrent} />
            <FollowUpHint visible={showFollowUpHint} onTreatAsNew={treatCurrentAsNew} />
          </MessageList>
          <ChatInput onSend={handleSend} />
        </div>

        {/* Mobile drawer */}
        <SidebarDrawer
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          conversations={conversations}
          selectedId={selectedId}
          onSelect={(id) => { selectConversation(id); setSidebarOpen(false); }}
          onNew={() => { newConversation(); setSidebarOpen(false); }}
          onDelete={deleteConversation}
          onPin={togglePin}
          onPick={(q) => handleSend(q)} // if your drawer ignores this, it's harmless
        />

        {/* Floating expand (desktop) */}
        {sidebarCollapsed && !sidebarOpen && (
          <ExpandFab onClick={() => setSidebarCollapsed(false)} />
        )}
      </Shell>
    </div>
  );
}