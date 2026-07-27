import { hydrateRoot, createRoot } from "react-dom/client";
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
// In production the build-time prerender (src/prerender.tsx) fills #root with
// static HTML, so we hydrateRoot() to reuse it. In `vite dev` the prerender
// plugin does NOT run, so #root is empty — hydrating an empty container makes
// React log a hydration mismatch and repaint the whole page. Detect that case
// and use createRoot() instead: no dev console errors, and a graceful fallback
// if a build ever ships without prerendered markup.
const rootEl = document.getElementById("root")!;
const tree = (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

if (rootEl.hasChildNodes()) {
  hydrateRoot(rootEl, tree);
} else {
  createRoot(rootEl).render(tree);
}
