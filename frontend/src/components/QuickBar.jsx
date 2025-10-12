export default function QuickBar({ onPick }) {
  // simple preset suggestions — you can change these later
  const items = [
    "When is the next football game?",
    "Dining hall hours today",
    "Campus map link",
    "How do I contact Residence Life?",
  ];

  return (
    <div className="border-b p-3 flex gap-2 overflow-x-auto">
      {items.map((label) => (
        <button
          key={label}
          onClick={() => onPick?.(label)}
          className="whitespace-nowrap rounded-full border px-3 py-1 text-xs text-gray-700 hover:bg-gray-50"
        >
          {label}
        </button>
      ))}
    </div>
  );
}