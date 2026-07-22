import { hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./app/App.tsx";
import "./styles/index.css";

// The page markup is prerendered at build time (see src/prerender.tsx) and
// injected into #root. We hydrate that existing DOM instead of re-rendering
// from scratch with createRoot(): a full client render discards the
// prerendered nodes and repaints the whole page, which produces a large
// layout shift (CLS) and a visible flash on first load.
//
// The client MUST wrap <App /> in the same router type used by the prerender
// (StaticRouter -> BrowserRouter, both declarative). Previously the client used
// createBrowserRouter + RouterProvider, a data router whose tree did not match
// the StaticRouter output, so hydration failed and React remounted the whole
// page -> ~0.85 CLS from the <main> element shifting.
hydrateRoot(
  document.getElementById("root")!,
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
