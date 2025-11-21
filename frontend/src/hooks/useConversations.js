// src/hooks/useConversations.js
import { useEffect, useMemo, useState } from "react";

function load() {
  try {
    return JSON.parse(localStorage.getItem("conversations") || "[]");
  } catch {
    return [];
  }
}
function save(convos) {
  localStorage.setItem("conversations", JSON.stringify(convos));
}
const now = () => Date.now();

export default function useConversations() {
  const [conversations, setConversations] = useState(load());
  const [selectedId, setSelectedId] = useState(conversations[0]?.id ?? null);

  // persist to localStorage
  useEffect(() => save(conversations), [conversations]);

  const selected = useMemo(
    () => conversations.find((c) => c.id === selectedId) || null,
    [conversations, selectedId]
  );

  function newConversation() {
    const id = crypto.randomUUID();
    const convo = {
      id,
      title: "New conversation",
      summary: "",
      conversationId: null,
      pinned: false,
      updatedAt: now(),
      messages: [],
    };
    setConversations((cs) => [convo, ...cs]);
    setSelectedId(id);
    return id;
  }

  function selectConversation(id) {
    setSelectedId(id);
  }

  function deleteConversation(id) {
    setConversations((cs) => cs.filter((c) => c.id !== id));
    if (selectedId === id) {
      // select next available convo (if any)
      const next = conversations.find((c) => c.id !== id)?.id ?? null;
      setSelectedId(next);
    }
  }

  function renameConversation(id, title) {
    setConversations((cs) => cs.map((c) => (c.id === id ? { ...c, title } : c)));
  }

  function togglePin(id) {
    setConversations((cs) =>
      cs.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c))
    );
  }

  function addMessage(id, msg) {
    setConversations((cs) =>
      cs.map((c) =>
        c.id !== id
          ? c
          : { ...c, messages: [...c.messages, msg], updatedAt: now() }
      )
    );
  }

  function patchMessage(id, msgId, patch) {
    setConversations((cs) =>
      cs.map((c) =>
        c.id !== id
          ? c
          : {
              ...c,
              messages: c.messages.map((m) =>
                m.id === msgId ? { ...m, ...patch } : m
              ),
              updatedAt: now(),
            }
      )
    );
  }

  function setConversationBackendId(id, conversationId) {
    setConversations((cs) =>
      cs.map((c) =>
        c.id === id
          ? { ...c, conversationId: conversationId ?? null, updatedAt: now() }
          : c
      )
    );
  }

  function setTitleSummary(id, { title, summary }) {
    setConversations((cs) =>
      cs.map((c) =>
        c.id === id
          ? {
              ...c,
              title: title || c.title,
              summary: summary ?? c.summary,
              updatedAt: now(),
            }
          : c
      )
    );
  }

  return {
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
    setSelectedId,
    setConversationBackendId,
  };
}
