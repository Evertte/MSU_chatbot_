// import botAvatar from "../assets/bot.jpeg";
// import msuLogo from "../assets/msu.png";

// export default function Header() {
//   return (
//     <header className="sticky top-0 z-10 border-b border-zinc-200 bg-[#f5f5dc] backdrop-blur supports-[backdrop-filter]:bg-[#f5f5dc] dark:bg-[#f5f5dc]">
//       <div className="absolute top-0.5 left-1 right-1 shrink-0 bg-white p-1 ring-1 ring-[#660000]/25 shadow-md">
//         <img src={msuLogo} alt="MSU Logo" className="h-14 w-full object-contain select-none" />
//       </div>
//       <div className="relative flex items-center gap-3 px-4 py-3 mt-16">
//         <div className="shrink-0 rounded-xl bg-white p-1 ring-1 ring-[#660000]/25 shadow-sm">
//           <img src={botAvatar} alt="Assistant" className="h-14 w-auto object-contain select-none" />
//         </div>
//         <div className="min-w-0">
//           <div className="truncate font-semibold text-[#660000] sm:text-lg">
//             Campus Life Assistant
//           </div>
//           <div className="text-xs text-[#5b5b5b]">
//             Online · Ask about events, dining, housing, faculty, offices, and more
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }

import botAvatar from "../assets/bot.jpeg";
import msuLogo from "../assets/msu.png";

export default function Header({ onToggleSidebar }) {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-[#f5f5dc] backdrop-blur supports-[backdrop-filter]:bg-[#f5f5dc] dark:bg-[#f5f5dc]">
      <div className="absolute top-0.5 left-1 right-1 shrink-0 bg-white p-1 ring-1 ring-[#660000]/25 shadow-md">
        <img
          src={msuLogo}
          alt="MSU Logo"
          className="h-14 w-full object-contain select-none"
        />
      </div>

      <div className="relative flex items-center gap-3 px-4 py-3 mt-16">
        {/* Mobile hamburger */}
        <button
          type="button"
          className="mr-2 rounded-lg border border-[#660000]/30 px-2 py-1 text-[#660000] md:hidden"
          onClick={onToggleSidebar}
        >
          ☰
        </button>

        <div className="shrink-0 rounded-xl bg-white p-1 ring-1 ring-[#660000]/25 shadow-sm">
          <img
            src={botAvatar}
            alt="Assistant"
            className="h-14 w-auto object-contain select-none"
          />
        </div>

        <div className="min-w-0">
          <div className="truncate font-semibold text-[#660000] sm:text-lg">
            Campus Life Assistant
          </div>
          <div className="text-xs text-[#5b5b5b]">
            Online · Ask about events, dining, housing, faculty, offices, and more
          </div>
        </div>
      </div>
    </header>
  );
}
