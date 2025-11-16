// Heuristics to detect follow-ups and craft a legacy-friendly single prompt

export const FOLLOWUP_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export function lastAssistantMessage(messages = []) {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "bot") return messages[i];
  }
  return null;
}

/**
 * New: follow-up detection without hardcoded words.
 * We consider it a follow-up if:
 * - The UI explicitly flagged it (user clicked the "Follow-up" chip/button), OR
 * - The message is a reply to the last assistant message (replyToId matches), OR
 * - (Optional) It's within the time window AND the user typed something short (disable if unwanted).
 */
export function looksLikeFollowUp({
  uiFollowUp = false,        // boolean set by your UI on click
  replyToId = null,          // message.id of the message being replied to
  lastAssistantId = null,    // id of last assistant message
  withinWindow = true,       // you compute this once per call
  useLengthHint = false,     // set to true if you still want short-text bias
  text = ""
} = {}) {
  if (uiFollowUp) return true;
  if (replyToId && lastAssistantId && replyToId === lastAssistantId) return true;
  if (!useLengthHint) return false;
  return withinWindow && text && text.trim().length <= 140;
}

export function makeFollowUpPrompt(prevMessages, userText, {
  uiFollowUp = false,
  replyToId = null,
  now = Date.now(),
  windowMs = FOLLOWUP_WINDOW_MS,
  useLengthHint = false
} = {}) {
  const lastBot = lastAssistantMessage(prevMessages);
  const lastAssistantId = lastBot?.id || null;
  const recent = lastBot && (now - (lastBot.ts || 0) < windowMs);

  const isFU = looksLikeFollowUp({
    uiFollowUp,
    replyToId,
    lastAssistantId,
    withinWindow: recent,
    useLengthHint,
    text: userText
  });

  if (!lastBot || !isFU) {
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
