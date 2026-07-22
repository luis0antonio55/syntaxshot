// src/prerender.tsx
// This module is only executed at build time by vite-prerender-plugin.
// It renders each route to a static HTML string so crawlers see real content.

import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import Landing, { Footer, Navbar } from "./app/pages/Landing";
import Docs from "./app/pages/Docs";
import Support from "./app/pages/Support";
import "./styles/index.css";
import { JSX } from "react/jsx-runtime";

const SITE_URL = "https://syntaxshot.dev";

const ROUTES: {
  path: string;
  title: string;
  description: string;
  component: () => JSX.Element;
}[] = [
  {
    path: "/",
    title: "SyntaxShot — Code screenshots with one command.",
    description:
      "Generate beautiful syntax-highlighted code-to-image screenshots directly from your CLI. Free for single-file captures. Upgrade to Pro for full project scans.",
    component: Landing,
  },
  {
    path: "/docs",
    title: "Documentation — SyntaxShot CLI",
    description:
      "Complete guide to installing and using the SyntaxShot CLI, from your first command to advanced Pro folder-scanning features.",
    component: Docs,
  },
  {
    path: "/support",
    title: "Support — SyntaxShot",
    description:
      "Need help with SyntaxShot? Contact our support team for CLI issues, billing, or feature requests.",
    component: Support,
  },
];

export async function prerender(data: { url: string }) {
  const route = ROUTES.find((r) => r.path === data.url) ?? ROUTES[0];
  const Component = route.component;

  const html = renderToString(
    <StaticRouter location={route.path}>
      <Component />
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
