import AppRoutes from "./AppRoutes";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/react"

// App is rendered inside a router provider: BrowserRouter on the client
// (main.tsx) and StaticRouter during prerender (prerender.tsx). Using the same
// declarative <Routes> tree on both sides keeps the hydrated DOM identical to
// the prerendered HTML and avoids the layout shift caused by remounting.
export default function App() {
  return (
    <>
      <AppRoutes />
      <Analytics />
      <SpeedInsights />
    </>
  );
}
