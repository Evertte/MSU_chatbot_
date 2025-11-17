export function typeOut({ convoId, msgId, fullText, perCharMs = 12, patchMessage }) {
  return new Promise((resolve) => {
    let i = 0;

    const timer = setInterval(() => {
      i += 1;
      const nextText = fullText.slice(0, i);
      patchMessage(convoId, msgId, { text: nextText });

      if (i >= fullText.length) {
        clearInterval(timer);
        resolve();
      }
    }, perCharMs);
  });
}
