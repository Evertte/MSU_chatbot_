// components/ChatInput.jsx
import { useState } from "react";

export default function ChatInput({ onSend }) {
  const [text, setText] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-zinc-200 dark:border-zinc-700 bg-[#f5f5dc] dark:bg-zinc-900 p-3 flex items-center gap-2"
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your message..."
        rows={2}
        className="flex-1 resize-none rounded-lg border border-zinc-300 dark:border-zinc-700
                   bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100
                   placeholder:text-zinc-400 focus:outline-none focus:ring-2
                   focus:ring-[#660000]"
      />
      <button
        type="submit"
        className="rounded-lg bg-[#660000] px-4 py-2 text-sm font-medium text-white
                   hover:bg-[#520000] active:scale-[.98] focus:outline-none focus:ring-2 focus:ring-[#660000]/40"
      >
        Send
      </button>
    </form>
  );
}
