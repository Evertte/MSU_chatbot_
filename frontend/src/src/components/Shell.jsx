// src/components/shell.jsx
export default function Shell({ children }) {
  return (
    <div className="fixed inset-0">{/* no bg here */}
      <div className="flex h-dvh w-full bg-cream">{children}</div>
    </div>
  );
}