// src/components/ThemeToggle.jsx
// import { useEffect, useLayoutEffect, useState } from "react";

// function applyTheme(mode) {
//   const root = document.documentElement;
//   root.classList.remove("dark");
//   if (mode === "dark") root.classList.add("dark");
//   localStorage.setItem("theme", mode);
// }

// export default function ThemeToggle() {
//   const [mode, setMode] = useState(() =>
//     localStorage.getItem("theme") === "dark" ? "dark" : "light"
//   );

//   //useLayoutEffect(() => { applyTheme(mode); }, []);
//   //useEffect(() => { applyTheme(mode); }, [mode]);

//   return (
//     <button
//       type="button"
//       //onClick={() => setMode(m => (m === "dark" ? "light" : "dark"))}
//       className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 active:scale-[.98] dark:border-zinc-700 dark:text-gray-200 dark:hover:bg-zinc-800"
//       aria-label="Toggle theme"
//       title={`Theme: ${mode}`}
//     >
//       {/* <span className="text-sm">{mode === "dark" ? "☀️ Light" : "🌙 Dark"}</span> */}
//       {/* <span className="hidden sm:inline">{mode === "dark" ? "Light" : "Dark"}</span> */}
//     </button>
//   );
// }