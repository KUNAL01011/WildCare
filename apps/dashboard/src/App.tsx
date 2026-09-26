import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "./stores/auth";
import { useEffect } from "react";

import { LoginPage } from "./pages/Login";
import { DashboardLayout } from "./components/DashboardLayout";
import { DashboardPage } from "./pages/Dashboard";
import { CitizensPage } from "./pages/Citizens";
import { CitizenDetailPage } from "./pages/CitizenDetail";
import { ReportsPage } from "./pages/Reports";
import { ReportDetailPage } from "./pages/ReportDetail";
import { BodiesPage } from "./pages/Bodies";
import { BodyDetailPage } from "./pages/BodyDetail";
import { FeedbackPage } from "./pages/Feedback";
import { LocationsPage } from "./pages/Locations";
import { AnalyticsPage } from "./pages/Analytics";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const App = () => {
  const restore = useAuthStore((s) => s.restore);
  useEffect(() => { restore(); }, [restore]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="citizens" element={<CitizensPage />} />
            <Route path="citizens/:id" element={<CitizenDetailPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="reports/:id" element={<ReportDetailPage />} />
            <Route path="bodies" element={<BodiesPage />} />
            <Route path="bodies/:id" element={<BodyDetailPage />} />
            <Route path="feedback" element={<FeedbackPage />} />
            <Route path="locations" element={<LocationsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
