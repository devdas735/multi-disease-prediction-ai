import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import Layout from "./components/Layout";
import Analytics from "./pages/Analytics";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Predict from "./pages/Predict";
import Results from "./pages/Results";
import Upload from "./pages/Upload";

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
      <Toaster richColors position="top-right" />
    </Layout>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: Dashboard,
});
const predictRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/predict",
  component: Predict,
});
const uploadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/upload",
  component: Upload,
});
const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/analytics",
  component: Analytics,
});
const resultsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/results",
  component: Results,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  dashboardRoute,
  predictRoute,
  uploadRoute,
  analyticsRoute,
  resultsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
