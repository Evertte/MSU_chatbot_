export default function FollowUpHint({ visible, onTreatAsNew }) {
  if (!visible) return null;
  return (
    <div className="flex items-center justify-between px-4 pb-2 text-[11px] text-zinc-600 dark:text-zinc-400">
      <div className="flex items-center gap-2">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#5A2A2A]" />
        <span>Replying to previous answer</span>
      </div>
      <button
        type="button"
        onClick={onTreatAsNew}
        className="rounded-full bg-zinc-900 px-3 py-1.5 text-[11px] font-medium text-white shadow hover:opacity-90 dark:bg-zinc-700"
        title="Resend this question as a new topic"
      >
        Treat as new
      </button>
    </div>
  );
}