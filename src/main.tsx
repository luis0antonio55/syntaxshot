import { hydrateRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

// The page markup is prerendered at build time (see src/prerender.tsx) and
// injected into #root. We hydrate that existing DOM instead of re-rendering
// from scratch with createRoot(): a full client render discards the
// prerendered nodes and repaints the whole page, which produces a large
// layout shift (CLS) and a visible flash on first load.
hydrateRoot(document.getElementById("root")!, <App />);
