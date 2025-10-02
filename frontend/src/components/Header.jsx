// src/components/header.jsx
import ThemeToggle from "./ThemeToggle";
import botAvatar from "../assets/bot.jpeg";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-[#f5f5dc]/90 backdrop-blur supports-[backdrop-filter]:bg-[#f5f5dc]/70 dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="shrink-0 rounded-xl bg-white p-1 ring-1 ring-[#660000]/25 shadow-sm dark:bg-zinc-800 dark:ring-zinc-700">
          <img src={botAvatar} alt="Assistant" className="h-14 w-auto object-contain select-none" />
        </div>
        <div className="min-w-0">
          <div className="truncate font-semibold text-[#660000] sm:text-lg dark:text-white">
            Campus Life Assistant
          </div>
          <div className="text-xs text-[#5b5b5b] dark:text-gray-400">
            Online · Ask about events, dining, housing, faculty, offices, and more
          </div>
        </div>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
