// src/prerender.tsx
// This module is only executed at build time by vite-prerender-plugin.
// It renders each route to a static HTML string so crawlers see real content.

import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import App from "./app/App";
import "./styles/index.css";

const SITE_URL = "https://syntaxshot.dev";

const ROUTES: {
  path: string;
  title: string;
  description: string;
}[] = [
  {
    path: "/",
    title: "SyntaxShot — Code screenshots with one command.",
    description:
      "Generate beautiful syntax-highlighted code-to-image screenshots directly from your CLI. Free for single-file captures. Upgrade to Pro for full project scans.",
  },
  {
    path: "/docs",
    title: "Documentation — SyntaxShot CLI",
    description:
      "Complete guide to installing and using the SyntaxShot CLI, from your first command to advanced Pro folder-scanning features.",
  },
  {
    path: "/support",
    title: "Support — SyntaxShot",
    description:
      "Need help with SyntaxShot? Contact our support team for CLI issues, billing, or feature requests.",
  },
];

export async function prerender(data: { url: string }) {
  const route = ROUTES.find((r) => r.path === data.url) ?? ROUTES[0];

  // Render the exact same tree the client hydrates (App -> <Routes>), only
  // swapping BrowserRouter for StaticRouter. This guarantees the prerendered
  // HTML matches the client's first render so hydration reuses the DOM.
  const html = renderToString(
    <StaticRouter location={route.path}>
      <App />
    </StaticRouter>
  );

  return {
    html,
    links: new Set(ROUTES.map((r) => r.path)),
    head: {
      lang: "en",
      title: route.title,
      elements: new Set([
        {
          type: "meta",
          props: { name: "description", content: route.description },
        },
        {
          type: "link",
          props: { rel: "canonical", href: `${SITE_URL}${route.path}` },
        },
        {
          type: "meta",
          props: { property: "og:title", content: route.title },
        },
        {
          type: "meta",
          props: { property: "og:description", content: route.description },
        },
        {
          type: "meta",
          props: {
            property: "og:url",
            content: `${SITE_URL}${route.path}`,
          },
        },
        {
          type: "meta",
          props: { name: "twitter:title", content: route.title },
        },
        {
          type: "meta",
          props: {
            name: "twitter:description",
            content: route.description,
          },
        },
      ]),
    },
  };
}
