// src/components/shell.jsx
export default function Shell({ children }) {
  return (
    <div className="fixed inset-0">{/* no bg here */}
      <div className="flex h-full w-full">{children}</div>
    </div>
  );
}
