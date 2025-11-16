// Typewriter utility that supports "skip"
// patchMessage: (convoId, msgId, partialText) => void
export function typeOut({ convoId, msgId, fullText, perCharMs = 12, patchMessage, skipRef }) {
  return new Promise((resolve) => {
    let i = 0;
    const timer = setInterval(() => {
      if (skipRef?.current) {
        patchMessage(convoId, msgId, { text: fullText });
        clearInterval(timer);
        return resolve();
      }
      i++;
      patchMessage(convoId, msgId, { text: fullText.slice(0, i) });
      if (i >= fullText.length) {
        clearInterval(timer);
        resolve();
      }
    }, perCharMs);
  });
}
