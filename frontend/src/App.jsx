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

const WELCOME_TEXT =
  "Hey Bulldog! How can I assist you today?\n" +
  "If you have any questions about Mississippi State University, feel free to ask!\n\n" +
  "Hail State! 🐶🏈";

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
    setConversationBackendId,
  } = useConversations();

  // Ensure at least one conversation exists
  useEffect(() => {
    if (!selectedId) newConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    const convo = conversations.find(c => c.id === selectedId);
    if (!convo) return;

    if (convo.messages.length === 0) {
      addMessage(selectedId, {
        id: crypto.randomUUID(),
        role: "bot",
        text: WELCOME_TEXT,
        ts: Date.now(),
      });
    }
  }, [selectConversation, conversations, selectedId, addMessage]);
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

  // Stages
  const [stage, setStage] = useState(null); // "analyze" | "search" | "think" | "write" | "finalize" | null
  
  // Track the in-flight turn so we can "Treat as new"
  const [turn, setTurn] = useState(null);
  // turn shape:
  // { convoId, botId, userText, apiHistory, mode:'followup'|'new', path:'stream'|'fallback', controller, timers:[...] }

async function handleSend(text) {
  const convoId = selectedId || newConversation();

  // Previous messages (before this user turn) for follow-up detection
  const prevConvo = conversations.find(c => c.id === convoId);
  const prevMsgs = prevConvo?.messages || [];
  const backendConversationId = prevConvo?.conversationId || null;
  const clippedPrev = clipHistory(prevMsgs, 16);

  // Decide follow-up vs new; craft legacy single-string payload for backend
  const { isFollowUp } = makeFollowUpPrompt(clippedPrev, text);

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
  let streamed = { streamed: false };
  let streamedBuffer = "";
  if (backendConversationId) {
    const streamController = new AbortController();
    streamed = await streamChat({
      history: apiHistory,
      conversationId: backendConversationId,
      onStage: (s) => setStage(mapStage(s)),
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
  }

  // Fallback: staged timers + abortable fetch for "Treat as new"
  const t1 = setTimeout(() => setStage("search"), 500);
  const t2 = setTimeout(() => setStage("think"), 1200);
  const t3 = setTimeout(() => setStage("write"), 2200);
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
    // 🔑 Get answer *and* sources from backend
    const { answer, sources, conversationId } = await sendChat({
      history: apiHistory,
      userMessage: text,
      conversationId: backendConversationId,
      signal: fallbackController.signal,
    });

    // Clean stage timers
    clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
    setStage("write");

    // Type the text into the existing bot bubble
    await typeOut({
      convoId,
      msgId: botId,
      fullText: answer || "…",
      perCharMs: 12,
      patchMessage,
    });

    // Attach links to that same message
    if (sources && sources.length > 0) {
      patchMessage(convoId, botId, { links: sources });
    }

    if (conversationId) setConversationBackendId(convoId, conversationId);

    setStage("finalize");
    const { title, summary } = await summarizeChat({
      history: [...apiHistory, { role: "bot", text: answer || "" }],
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
      const { answer, conversationId } = await sendChat({
        history: t.apiHistory,
        userMessage: t.userText, // send raw user text as a brand-new topic
        conversationId: null, // explicitly start a fresh backend thread
        signal: retryController.signal,
      });

      clearTimeout(r1); clearTimeout(r2); clearTimeout(r3);
      setStage("write");


      setStage("finalize");
      const { title, summary } = await summarizeChat({
        history: [...t.apiHistory, { role: "bot", text: answer || "" }],
      });
      setTitleSummary(t.convoId, { title, summary });

      if (conversationId) setConversationBackendId(t.convoId, conversationId);
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

  // Refresh a bot message by re-running the prior user turn with same conversation_id
  async function refreshBotMessage(botMsgId) {
    if (!selected) return;
    const convo = conversations.find(c => c.id === selectedId);
    if (!convo) return;
    const msgs = convo.messages;
    const botIdx = msgs.findIndex(m => m.id === botMsgId);
    if (botIdx <= 0) return;

    // Find the most recent user message before this bot message
    const userIdx = [...msgs.slice(0, botIdx)].reverse().findIndex(m => m.role === "user");
    if (userIdx === -1) return;
    const absoluteUserIdx = botIdx - 1 - userIdx;
    const userMsg = msgs[absoluteUserIdx];

    const clippedHistory = clipHistory(msgs.slice(0, absoluteUserIdx + 1), 16);
    const apiHistory = clippedHistory.map(m => ({ role: m.role, text: m.text }));
    const backendConversationId = convo.conversationId || null;

    const refreshController = new AbortController();
    setStage("analyze");
    patchMessage(convo.id, botMsgId, { text: "Refreshing…", links: [] });

    try {
      const { answer, sources, conversationId } = await sendChat({
        history: apiHistory,
        userMessage: userMsg.text,
        conversationId: backendConversationId,
        signal: refreshController.signal,
      });

      await typeOut({
        convoId: convo.id,
        msgId: botMsgId,
        fullText: answer || "…",
        perCharMs: 12,
        patchMessage,
      });

      if (sources && sources.length > 0) {
        patchMessage(convo.id, botMsgId, { links: sources });
      }
      if (conversationId) setConversationBackendId(convo.id, conversationId);
    } catch (err) {
      if (err?.name !== "AbortError") {
        console.error(err);
        patchMessage(convo.id, botMsgId, { text: "Sorry—couldn't refresh this answer." });
      }
    } finally {
      setStage(null);
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
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div
          className={[
            "fixed inset-0 z-30 bg-black/40 transition-opacity lg:hidden",
            sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
          ].join(" ")}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Chat pane */}
        <div className="flex-1 min-w-0 min-h-0 grid grid-rows-[auto,1fr,auto] bg-transparent">
          <Header onToggleSidebar={() => setSidebarOpen(open => !open)} />
          <MessageList>
            {selected.messages.map(m => (
              <Bubble
                key={m.id}
                role={m.role}
                ts={m.ts}
                links={m.links}
                onRefresh={m.role === "bot" ? () => refreshBotMessage(m.id) : undefined}
              >
                {m.text}
              </Bubble>
            ))}
            {/* Typing status + inline follow-up hint */}
            <TypingIndicator stage={stage} />
            <FollowUpHint visible={showFollowUpHint} onTreatAsNew={treatCurrentAsNew} />
          </MessageList>
          <ChatInput onSend={handleSend} />
        </div>

        {/* Floating expand (desktop) */}
        {sidebarCollapsed && !sidebarOpen && (
          <ExpandFab onClick={() => setSidebarCollapsed(false)} />
        )}
      </Shell>
    </div>
  );
}
