import { Routes, Route } from "react-router";
import Landing from "./pages/Landing";
import Docs from "./pages/Docs";
import Support from "./pages/Support";

// Declarative route table shared by the client (BrowserRouter in main.tsx) and
// the build-time prerender (StaticRouter in prerender.tsx). Both sides must
// render the exact same component tree so hydrateRoot() can reuse the
// prerendered DOM instead of repainting the whole page (which caused a large
// CLS from the <main> element moving on first load).
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/docs" element={<Docs />} />
      <Route path="/support" element={<Support />} />
    </Routes>
  );
}
