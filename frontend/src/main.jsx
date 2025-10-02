import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ---- theme bootstrap (runs before React)
(function initTheme() {
  const root = document.documentElement;
  const saved = localStorage.getItem("theme") || "system";

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const shouldDark = saved === "dark" || (saved === "system" && prefersDark);

  root.classList.toggle("dark", shouldDark);
})();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
