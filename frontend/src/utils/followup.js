// Heuristics to detect follow-ups and craft a legacy-friendly single prompt

export const FOLLOWUP_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export function lastAssistantMessage(messages = []) {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "bot") return messages[i];
  }
  return null;
}

export function looksLikeFollowUp(text) {
  if (!text) return false;
  if (text.length > 140) return false; // long questions are usually self-contained
  const t = text.trim().toLowerCase();
  return (
    /^(and|also|what about|how about|ok|okay)\b/.test(t) || // continuation openers
    /\b(it|that|they|those|this|there|them|he|she)\b/.test(t) || // anaphora
    /^(does|do|is|are|was|were|can|could|should|did|will|would)\b/.test(t) // short Y/N
  );
}

export function makeFollowUpPrompt(prevMessages, userText) {
  const lastBot = lastAssistantMessage(prevMessages);
  const recent = lastBot && (Date.now() - (lastBot.ts || 0) < FOLLOWUP_WINDOW_MS);

  if (!recent || !looksLikeFollowUp(userText)) {
    return { isFollowUp: false, message: userText };
  }

  const snippet = (lastBot.text || "").slice(0, 800);
  const message =
    `Follow-up to the previous assistant message:\n` +
    `"""${snippet}"""\n\n` +
    `User's follow-up: ${userText}\n` +
    `Answer directly; if ambiguous, ask a brief clarifying question first.`;

  return { isFollowUp: true, message };
}

export function clipHistory(messages, n = 16) {
  return messages.slice(-n);
}
