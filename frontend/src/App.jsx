import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { LanguageAndAccessibilityProvider } from './context/LanguageAndAccessibilityContext';

// Common Components
import GovernmentHeader from './components/common/GovernmentHeader';
import Navbar from './components/common/Navbar';
import GovernmentFooter from './components/common/GovernmentFooter';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './components/common/DashboardLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import FarmerLogin from './pages/auth/FarmerLogin';
import FarmerRegister from './pages/auth/FarmerRegister';
import AdminLogin from './pages/auth/AdminLogin';

// Farmer Pages
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import SlotBooking from './pages/farmer/SlotBooking';
import QueueTracking from './pages/farmer/QueueTracking';
import ProcurementStatus from './pages/farmer/ProcurementStatus';
import PaymentStatus from './pages/farmer/PaymentStatus';
import FarmerProfile from './pages/farmer/FarmerProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import QueueManagement from './pages/admin/QueueManagement';
import SlotManagement from './pages/admin/SlotManagement';
import ProcurementEntry from './pages/admin/ProcurementEntry';
import PaymentManagement from './pages/admin/PaymentManagement';
import FarmersDirectory from './pages/admin/FarmersDirectory';

export function App() {
  return (
    <LanguageAndAccessibilityProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900">
              {/* Official Government Top Bar & Utility Header */}
              <GovernmentHeader />
              {/* Blue Primary Navigation Bar */}
              <Navbar />

              {/* Main App Routes */}
              <div className="flex-1">
                <Routes>
                  {/* 1. Public Portals */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<FarmerLogin />} />
                  <Route path="/register" element={<FarmerRegister />} />
                  <Route path="/admin/login" element={<AdminLogin />} />

                  {/* 2. Protected Farmer Portal Routes */}
                  <Route
                    path="/farmer/dashboard"
                    element={
                      <ProtectedRoute requiredRole="farmer">
                        <DashboardLayout role="farmer">
                          <FarmerDashboard />
                        </DashboardLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/farmer/book-slot"
                    element={
                      <ProtectedRoute requiredRole="farmer">
                        <DashboardLayout role="farmer">
                          <SlotBooking />
                        </DashboardLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/farmer/queue"
                    element={
                      <ProtectedRoute requiredRole="farmer">
                        <DashboardLayout role="farmer">
                          <QueueTracking />
                        </DashboardLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/farmer/status"
                    element={
                      <ProtectedRoute requiredRole="farmer">
                        <DashboardLayout role="farmer">
                          <ProcurementStatus />
                        </DashboardLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/farmer/payments"
                    element={
                      <ProtectedRoute requiredRole="farmer">
                        <DashboardLayout role="farmer">
                          <PaymentStatus />
                        </DashboardLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/farmer/profile"
                    element={
                      <ProtectedRoute requiredRole="farmer">
                        <DashboardLayout role="farmer">
                          <FarmerProfile />
                        </DashboardLayout>
                      </ProtectedRoute>
                    }
                  />

                  {/* 3. Protected Admin Portal Routes */}
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <DashboardLayout role="admin">
                          <AdminDashboard />
                        </DashboardLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/queue"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <DashboardLayout role="admin">
                          <QueueManagement />
                        </DashboardLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/slots"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <DashboardLayout role="admin">
                          <SlotManagement />
                        </DashboardLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/procurement"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <DashboardLayout role="admin">
                          <ProcurementEntry />
                        </DashboardLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/payments"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <DashboardLayout role="admin">
                          <PaymentManagement />
                        </DashboardLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/farmers"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <DashboardLayout role="admin">
                          <FarmersDirectory />
                        </DashboardLayout>
                      </ProtectedRoute>
                    }
                  />

                  {/* 4. Catch-all Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>

              {/* Official Government Footer */}
              <GovernmentFooter />
            </div>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </LanguageAndAccessibilityProvider>
  );
}

export default App;
