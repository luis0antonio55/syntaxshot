import { createBrowserRouter } from "react-router";
import Landing from "./pages/Landing";
import Docs from "./pages/Docs";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/docs",
    Component: Docs,
  },
]);
