// // src/components/SidebarDrawer.jsx
// export default function SidebarDrawer({ open, onClose, onPick }) {
//   const items = [
//     "When is the next football game?",
//     "Dining hall hours today",
//     "Campus map link",
//     "How do I contact Residence Life?",
//   ];

//   return (
//     <>
//       {/* Backdrop (md only) */}
//       <div
//         className={[
//           "fixed inset-0 z-40 bg-black/40 transition-opacity",
//           open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
//         ].join(" ")}
//         onClick={onClose}
//         aria-hidden="true"
//       />

//       {/* Drawer (md only) */}
//       <aside
//         className={[
//           "fixed inset-y-0 left-0 z-50",
//           // Light & dark surfaces
//           "w-72 shrink-0 flex-col bg-white text-zinc-800 border-r border-zinc-200",
//           "transform transition-transform duration-200",
//           open ? "translate-x-0" : "-translate-x-full",
//         ].join(" ")}
//       >
//         {/* Drawer header */}
//         <div className="px-4 py-3 border-b border-zinc-200 flex items-center justify-between">
//           <div>
//             <div className="text-sm font-semibold">Shortcuts</div>
//             <div className="text-xs text-zinc-400">Quick questions</div>
//           </div>
//           <button
//             onClick={onClose}
//             className="h-9 w-9 inline-flex items-center justify-center rounded-lg border text-zinc-800 hover:bg-zinc-100 border-zinc-200"
//             aria-label="Close sidebar"
//             title="Close sidebar"
//           >
//             ✕
//           </button>
//         </div>

//         {/* List */}
//         <div className="flex-1 overflow-y-auto p-3 space-y-2">
//           {items.map((label) => (
//             <button
//               key={label}
//               onClick={() => { onPick?.(label); onClose?.(); }}
//               className="w-full rounded-lg border text-left text-sm active:scale-[.98]
//                          border-zinc-200 bg-zinc-50 hover:bg-zinc-100
//                          px-3 py-2"
//             >
//               {label}
//             </button>
//           ))}
//         </div>
//       </aside>
//     </>
//   );
// }