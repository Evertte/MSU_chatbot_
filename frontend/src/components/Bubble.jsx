// components/Bubble.jsx
import React from "react";
import botAvatar from "../assets/bot.jpeg";
import userAvatar from "../assets/user.jpeg";
import Linkify from "./Linkify";

export default function Bubble({ role = "bot", children, ts }) {
  const isUser = role === "user";
  const time = ts
    ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  // Ensure we pass a string to Linkify
  const text = typeof children === "string" ? children : String(children ?? "");

  return (

    <div className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <img src={botAvatar} alt="Bot avatar" className="h-8 w-8 rounded-full object-cover" />
      )}

      <div
        className={[
          "max-w-[50%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm",
          "whitespace-pre-wrap break-words",
          isUser ? "bg-[#660000] text-white" : "bg-gray-100 text-gray-900",
        ].join(" ")}
      >
        <Linkify text={text} />

        {!!time && (
          <div className={`mt-1 text-[10px] ${isUser ? "text-white/70" : "text-gray-500"}`}>
            {time}
          </div>
        )}
      </div>

      {isUser && (
        <img src={userAvatar} alt="User avatar" className="h-8 w-8 rounded-full object-cover" />
      )}
    </div>
  );
}


// // components/Bubble.jsx
// import React from "react";
// import botAvatar from "../assets/bot.jpeg";
// import userAvatar from "../assets/user.jpeg";
// import Linkify from "./Linkify";

// export default function Bubble({ role = "bot", children, ts }) {
//   const isUser = role === "user";
//   const time = ts
//     ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
//     : "";

//   // Ensure we pass a string to Linkify
//   const text = typeof children === "string" ? children : String(children ?? "");

//   return (

//     <div className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
//       {!isUser && (
//         <img src={botAvatar} alt="Bot avatar" className="h-8 w-8 rounded-full object-cover" />
//       )}

//       <div
//         className={[
//           "max-w-[50%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm",
//           "whitespace-pre-wrap break-words",
//           isUser ? "bg-[#660000] text-white" : "bg-gray-100 text-gray-900",
//         ].join(" ")}
//       >
//         <Linkify text={text} />

//         {!!time && (
//           <div className={`mt-1 text-[10px] ${isUser ? "text-white/70" : "text-gray-500"}`}>
//             {time}
//           </div>
//         )}
//       </div>

//       {isUser && (
//         <img src={userAvatar} alt="User avatar" className="h-8 w-8 rounded-full object-cover" />
//       )}
//     </div>
//   );
// }


// components/Bubble.jsx
// import React from "react";
// import botAvatar from "../assets/bot.jpeg";
// import userAvatar from "../assets/user.jpeg";
// import Linkify from "./Linkify";

// export default function Bubble({
//   id,                   // <-- pass the message id from parent
//   role = "bot",
//   children,
//   ts,
//   onFollowUp,           // <-- parent handler (optional)
//   followupEnabled = true, // toggle UI affordance if needed
// }) {
//   const isUser = role === "user";
//   const time = ts
//     ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
//     : "";

//   // Ensure we pass a string to Linkify
//   const text = typeof children === "string" ? children : String(children ?? "");

//   // Short snippet for the composer pill
//   const snippet =
//     text.length > 60 ? text.slice(0, 60).trimEnd() + "…" : text;

//   return (
//     <div
//       className={`group relative flex items-end gap-2 ${
//         isUser ? "justify-end" : "justify-start"
//       }`}
//     >
//       {!isUser && (
//         <img
//           src={botAvatar}
//           alt="Bot avatar"
//           className="h-8 w-8 rounded-full object-cover"
//         />
//       )}

//       <div
//         className={[
//           "relative max-w-[50%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm",
//           "whitespace-pre-wrap break-words",
//           isUser ? "bg-[#660000] text-white" : "bg-gray-100 text-gray-900",
//         ].join(" ")}
//       >
//         <Linkify text={text} />

//         {!!time && (
//           <div
//             className={`mt-1 text-[10px] ${
//               isUser ? "text-white/70" : "text-gray-500"
//             }`}
//           >
//             {time}
//           </div>
//         )}

//         {/* Follow-up chip (bot only) */}
//         {!isUser && followupEnabled && (
//           <button
//             type="button"
//             onClick={() =>
//               onFollowUp?.({ id, snippet, fullText: text, ts })
//             }
//             className={[
//               "absolute -right-2 -top-3 rounded-full border bg-white px-2.5 py-1 text-[11px]",
//               "shadow-sm hover:bg-zinc-50",
//               // hide until hover on pointer devices; always show on touch
//               "opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100",
//               "transition"
//             ].join(" ")}
//             aria-label="Mark next message as a follow-up to this"
//           >
//             Follow-up
//           </button>
//         )}
//       </div>

//       {isUser && (
//         <img
//           src={userAvatar}
//           alt="User avatar"
//           className="h-8 w-8 rounded-full object-cover"
//         />
//       )}
//     </div>
//   );
// }
