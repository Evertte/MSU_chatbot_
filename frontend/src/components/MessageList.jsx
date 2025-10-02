import { useEffect, useRef } from "react";

export default function MessageList({ children }) {
  const bottomRef = useRef(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [children]);
  return (
    <main className="flex-1 overflow-y-auto p-4 space-y-3">
      {children}
      <div ref={bottomRef} />
    </main>
  );
}
