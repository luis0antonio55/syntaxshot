import { createBrowserRouter } from "react-router";
import Landing from "./pages/Landing";
import Docs from "./pages/Docs";
import Support from "./pages/Support";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/docs",
    Component: Docs,
  },
  {
    path: "/support",
    Component: Support,
  },
]);
