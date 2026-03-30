import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";

// Pages
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Conversations from "@/pages/Conversations";
import Orders from "@/pages/Orders";
import Inventory from "@/pages/Inventory";
import Integrations from "@/pages/Integrations";
import AIConfig from "@/pages/AIConfig";
import KnowledgeBase from "@/pages/KnowledgeBase";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import AuditLog from "@/pages/AuditLog";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Wrapper for protected pages with dashboard layout
const DashboardPage = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <DashboardLayout>{children}</DashboardLayout>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" richColors />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected dashboard routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage><Dashboard /></DashboardPage>} />
            <Route path="/conversations" element={<DashboardPage><Conversations /></DashboardPage>} />
            <Route path="/orders" element={<DashboardPage><Orders /></DashboardPage>} />
            <Route path="/inventory" element={<DashboardPage><Inventory /></DashboardPage>} />
            <Route path="/integrations" element={<DashboardPage><Integrations /></DashboardPage>} />
            <Route path="/ai-config" element={<DashboardPage><AIConfig /></DashboardPage>} />
            <Route path="/knowledge-base" element={<DashboardPage><KnowledgeBase /></DashboardPage>} />
            <Route path="/reports" element={<DashboardPage><Reports /></DashboardPage>} />
            <Route path="/settings" element={<DashboardPage><Settings /></DashboardPage>} />
            <Route path="/audit-log" element={<DashboardPage><AuditLog /></DashboardPage>} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
