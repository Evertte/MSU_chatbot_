// // src/components/Sidebar.jsx
// export default function Sidebar({
//   conversations,
//   selectedId,
//   onSelect,
//   onNew,
//   onDelete,
//   onRename,
//   onPin,
//   collapsed = false,
//   width = 320,
//   onResizeStart,
// }) {
//   const pinned = conversations.filter(c => c.pinned);
//   const others = conversations.filter(c => !c.pinned);

//   function Item({ c }) {
//     const isActive = c.id === selectedId;
//     return (
//       <button
//         onClick={() => onSelect(c.id)}
//         className={[
//           "group w-full text-left rounded-lg border transition-colors",
//           isActive
//             ? "border-zinc-300 bg-white"
//             : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100",
//           collapsed ? "px-2 py-3 text-[11px]" : "px-3 py-2",
//         ].join(" ")}
//         title={c.title}
//       >
//         <div className="flex items-center gap-2">
//           {!collapsed && (
//             <span className="inline-block h-2 w-2 rounded-full bg-[#5A2A2A]" />
//           )}
//           <div className="min-w-0 flex-1">
//             <div className={`truncate font-medium ${isActive ? "text-zinc-900" : "text-zinc-800"}`}>
//               {c.title || "New conversation"}
//             </div>
//             {!collapsed && (
//               <div className="mt-0.5 text-xs text-zinc-500 max-h-10 overflow-hidden">
//                 {c.summary || "No summary yet"}
//               </div>
//             )}
//           </div>

//           {/* actions */}
//           {!collapsed && (
//             <div className="ml-2 hidden gap-1 sm:flex">
//               <button onClick={(e)=>{e.stopPropagation(); onPin(c.id);}}
//                 className="rounded px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-200">
//                 {c.pinned ? "Unpin" : "Pin"}
//               </button>
//               <button onClick={(e)=>{e.stopPropagation(); onDelete(c.id);}}
//                 className="rounded px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-200">
//                 Delete
//               </button>
//             </div>
//           )}
//         </div>
//       </button>
//     );
//   }

//   return (
//     <aside
//       className={[
//         "hidden lg:flex h-full shrink-0 flex-col border-r border-zinc-200",
//         "bg-white text-zinc-800",
//         collapsed ? "w-16" : "",
//       ].join(" ")}
//       style={!collapsed ? { width: `${width}px` } : undefined}
//     >
//       {/* Top bar */}
//       <div className="px-3 py-3 border-b border-zinc-200 flex items-center justify-between">
//         <div className={["text-sm font-semibold transition-opacity", collapsed ? "opacity-0 pointer-events-none" : "opacity-100"].join(" ")}>
//           Conversations
//           <div className="text-xs text-zinc-400">Summaries auto-update</div>
//         </div>
//         <button
//           onClick={onNew}
//           className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 px-3 text-sm hover:bg-zinc-100"
//           title="New conversation"
//         >
//           + New
//         </button>
//       </div>

//       {/* Lists */}
//       <div className="flex-1 overflow-y-auto p-2 space-y-2">
//         {pinned.length > 0 && !collapsed && (
//           <div className="px-1 pb-1 text-[11px] uppercase tracking-wide text-zinc-400">Pinned</div>
//         )}
//         {pinned.map(c => <Item key={c.id} c={c} />)}

//         {others.length > 0 && !collapsed && (
//           <div className="px-1 pt-2 pb-1 text-[11px] uppercase tracking-wide text-zinc-400">Recent</div>
//         )}
//         {others.map(c => <Item key={c.id} c={c} />)}
//       </div>

//       {/* Resizer */}
//       {!collapsed && (
//         <div
//           onMouseDown={onResizeStart}
//           className="absolute right-0 top-0 h-full w-1 cursor-col-resize select-none bg-transparent hover:bg-zinc-700/30 active:bg-zinc-700/50"
//           aria-hidden="true"
//         />
//       )}
//     </aside>
//   );
// }

// src/components/Sidebar.jsx
export default function Sidebar({
  conversations,
  selectedId,
  onSelect,
  onNew,
  onDelete,
  onRename,
  onPin,
  collapsed = false,
  width = 320,
  onResizeStart,
  open = false,          // controls mobile visibility
  onClose,               // ✅ NEW: for mobile close button
}) {
  const pinned = conversations.filter(c => c.pinned);
  const others = conversations.filter(c => !c.pinned);

  function Item({ c }) {
    const isActive = c.id === selectedId;
    const pinnedTag = c.pinned ? (
      <span className="rounded-full bg-[#800000] text-white text-[10px] px-2 py-0.5">
        Pinned
      </span>
    ) : null;
    return (
      <button
        onClick={() => onSelect(c.id)}
        className={[
          "group w-full text-left rounded-lg border transition-colors",
          isActive
            ? "border-zinc-300 bg-white"
            : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100",
          collapsed ? "px-2 py-3 text-[11px]" : "px-3 py-2",
        ].join(" ")}
        title={c.title}
      >
        <div className="flex items-center gap-2">
          {!collapsed && (
            <span className="inline-block h-2 w-2 rounded-full bg-[#5A2A2A]" />
          )}
          <div className="min-w-0 flex-1">
            <div
              className={`truncate font-medium ${
                isActive ? "text-zinc-900" : "text-zinc-800"
              }`}
            >
              {c.title || "New conversation"}
            </div>
            {!collapsed && (
              <div className="mt-0.5 text-xs text-zinc-500 max-h-10 overflow-hidden space-y-1">
                {pinnedTag}
                <div>{c.summary || "No summary yet"}</div>
              </div>
            )}
          </div>

          {/* ✅ Always show actions now, even on small screens */}
          {!collapsed && (
            <div className="ml-2 flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPin(c.id);
                }}
                className="rounded px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-200"
              >
                {c.pinned ? "Unpin" : "Pin"}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(c.id);
                }}
                className="rounded px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-200"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </button>
    );
  }

  return (
    <aside
      className={[
        // ✅ Mobile: slide-in overlay; Desktop: static sidebar
        "fixed inset-y-0 left-0 z-40 flex h-full shrink-0 flex-col border-r border-zinc-200",
        "bg-white text-zinc-800",
        "transform transition-transform duration-200",
        open ? "translate-x-0" : "-translate-x-full",  // slide on small/med
        "lg:static lg:translate-x-0 lg:z-0",            // always visible on lg+
      ].join(" ")}
      style={!collapsed ? { width: `${width}px` } : undefined}
    >
      {/* Top bar */}
      <div className="px-3 py-3 border-b border-zinc-200 flex items-center justify-between">
        <div
          className={[
            "text-sm font-semibold transition-opacity",
            collapsed ? "opacity-0 pointer-events-none" : "opacity-100",
          ].join(" ")}
        >
          Conversations
          <div className="text-xs text-zinc-400">Summaries auto-update</div>
        </div>

        <div className="flex items-center gap-2">
          {/* New button: keep on all sizes, you can hide on xs if you want */}
          <button
            onClick={onNew}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 px-3 text-sm hover:bg-zinc-100"
            title="New conversation"
          >
            + New
          </button>

          {/* ✅ Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 hover:bg-zinc-100 lg:hidden"
            aria-label="Close sidebar"
            title="Close sidebar"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Lists */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {pinned.length > 0 && !collapsed && (
          <div className="px-1 pb-1 text-[11px] uppercase tracking-wide text-zinc-400">
            Pinned
          </div>
        )}
        {pinned.map((c) => (
          <Item key={c.id} c={c} />
        ))}

        {others.length > 0 && !collapsed && (
          <div className="px-1 pt-2 pb-1 text-[11px] uppercase tracking-wide text-zinc-400">
            Recent
          </div>
        )}
        {others.map((c) => (
          <Item key={c.id} c={c} />
        ))}
      </div>

      {/* Resizer — desktop only */}
      {!collapsed && (
        <div
          onMouseDown={onResizeStart}
          className="hidden lg:block absolute right-0 top-0 h-full w-1 cursor-col-resize select-none bg-transparent hover:bg-zinc-700/30 active:bg-zinc-700/50"
          aria-hidden="true"
        />
      )}
    </aside>
  );
}
