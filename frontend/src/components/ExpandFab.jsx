export default function ExpandFab({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="hidden lg:flex fixed left-3 top-1/2 -translate-y-1/2 z-50
                 h-10 w-10 items-center justify-center rounded-full border
                 bg-zinc-900/90 text-zinc-200 hover:bg-zinc-800
                 dark:border-zinc-700"
      aria-label="Expand sidebar"
      title="Expand sidebar"
    >
      ☰
    </button>
  );
}
