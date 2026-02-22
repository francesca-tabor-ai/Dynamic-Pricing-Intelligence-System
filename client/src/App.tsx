import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Spinner } from "@/components/ui/spinner";
import { Redirect, Route, Switch } from "wouter";
import { lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import { PageTransition } from "./components/PageTransition";
import { ScrollToTop } from "./components/ScrollToTop";

const Home = lazy(() => import("./pages/Home"));
const Pricing = lazy(() => import("./pages/Pricing"));
const CaseStudies = lazy(() => import("./pages/CaseStudies"));
const Products = lazy(() => import("./pages/Products"));
const Recommendations = lazy(() => import("./pages/Recommendations"));
const Pipeline = lazy(() => import("./pages/Pipeline"));
const Simulator = lazy(() => import("./pages/Simulator"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Health = lazy(() => import("./pages/Health"));
const NotFound = lazy(() => import("./pages/NotFound"));

function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-[280px]">
      <Spinner className="size-8 text-muted-foreground" />
    </div>
  );
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path={"/"}>
          <Suspense fallback={<PageFallback />}>
            <PageTransition>
              <Home />
            </PageTransition>
          </Suspense>
        </Route>
        <Route path={"/pricing"}>
          <Suspense fallback={<PageFallback />}>
            <PageTransition>
              <Pricing />
            </PageTransition>
          </Suspense>
        </Route>
        <Route path={"/case-studies"}>
          <Suspense fallback={<PageFallback />}>
            <PageTransition>
              <CaseStudies />
            </PageTransition>
          </Suspense>
        </Route>
        <Route path={"/dashboard/*"} nest>
          {() => (
            <DashboardLayout>
              <Switch>
                <Route path={"/"}>
                  <Redirect to="/dashboard/health" replace />
                </Route>
                <Route path={"/health"}>
                  <Suspense fallback={<PageFallback />}>
                    <PageTransition>
                      <Health />
                    </PageTransition>
                  </Suspense>
                </Route>
                <Route path={"/products"}>
                  <Suspense fallback={<PageFallback />}>
                    <PageTransition>
                      <Products />
                    </PageTransition>
                  </Suspense>
                </Route>
                <Route path={"/recommendations"}>
                  <Suspense fallback={<PageFallback />}>
                    <PageTransition>
                      <Recommendations />
                    </PageTransition>
                  </Suspense>
                </Route>
                <Route path={"/pipeline"}>
                  <Suspense fallback={<PageFallback />}>
                    <PageTransition>
                      <Pipeline />
                    </PageTransition>
                  </Suspense>
                </Route>
                <Route path={"/simulator"}>
                  <Suspense fallback={<PageFallback />}>
                    <PageTransition>
                      <Simulator />
                    </PageTransition>
                  </Suspense>
                </Route>
                <Route path={"/analytics"}>
                  <Suspense fallback={<PageFallback />}>
                    <PageTransition>
                      <Analytics />
                    </PageTransition>
                  </Suspense>
                </Route>
                <Route path={"/404"}>
                  <Suspense fallback={<PageFallback />}>
                    <NotFound />
                  </Suspense>
                </Route>
                <Route>
                  <Suspense fallback={<PageFallback />}>
                    <NotFound />
                  </Suspense>
                </Route>
              </Switch>
            </DashboardLayout>
          )}
        </Route>
        <Route path={"/404"}>
          <Suspense fallback={<PageFallback />}>
            <NotFound />
          </Suspense>
        </Route>
        <Route>
          <Suspense fallback={<PageFallback />}>
            <NotFound />
          </Suspense>
        </Route>
      </Switch>
    </>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
