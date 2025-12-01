import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import { ClientRoute } from "./components/ClientRoute";
import { Layout } from "./components/Layout";
import { ClientLayout } from "./components/ClientLayout";
import Dashboard from "./pages/Dashboard";
import CreateInvoice from "./pages/CreateInvoice";
import EditInvoice from "./pages/EditInvoice";
import InvoiceHistory from "./pages/InvoiceHistory";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import ClientDashboard from "./pages/client/ClientDashboard";
import ClientInvoices from "./pages/client/ClientInvoices";
import ClientPayments from "./pages/client/ClientPayments";
import ClientDocuments from "./pages/client/ClientDocuments";
import ClientProfile from "./pages/client/ClientProfile";
import PaymentApprovals from "./pages/admin/PaymentApprovals";
import DocumentManagement from "./pages/admin/DocumentManagement";
import ClientDetail from "./pages/admin/ClientDetail";
import Clients from "./pages/admin/Clients";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            
            {/* Admin Routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AdminRoute>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/create" element={<CreateInvoice />} />
                        <Route path="/edit/:invoiceId" element={<EditInvoice />} />
                        <Route path="/history" element={<InvoiceHistory />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/admin/payments" element={<PaymentApprovals />} />
                        <Route path="/admin/documents" element={<DocumentManagement />} />
                        <Route path="/admin/clients" element={<Clients />} />
                        <Route path="/admin/client/:clientId" element={<ClientDetail />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Layout>
                  </AdminRoute>
                </ProtectedRoute>
              }
            />
            
            {/* Client Routes */}
            <Route
              path="/client/*"
              element={
                <ProtectedRoute>
                  <ClientRoute>
                    <ClientLayout>
                      <Routes>
                        <Route path="/dashboard" element={<ClientDashboard />} />
                        <Route path="/invoices" element={<ClientInvoices />} />
                        <Route path="/payments" element={<ClientPayments />} />
                        <Route path="/documents" element={<ClientDocuments />} />
                        <Route path="/profile" element={<ClientProfile />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </ClientLayout>
                  </ClientRoute>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
