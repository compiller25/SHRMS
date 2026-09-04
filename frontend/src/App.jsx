import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Tenant Pages
import TenantDashboard from './pages/Tenant/Dashboard';
import TenantMarketplace from './pages/Tenant/Marketplace';
import PropertyDetail from './pages/Tenant/PropertyDetail';
import TenantApplications from './pages/Tenant/Applications';
import TenantRentals from './pages/Tenant/Rentals';
import TenantPayments from './pages/Tenant/Payments';

// Landlord Pages
import LandlordDashboard from './pages/Landlord/Dashboard';
import LandlordProperties from './pages/Landlord/Properties';
import LandlordAgreements from './pages/Landlord/Agreements';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';

// Home Page
import Home from './pages/Home';

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Router>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/marketplace" element={<TenantMarketplace />} />
                <Route path="/marketplace/property/:id" element={<PropertyDetail />} />

                {/* Tenant Routes */}
                <Route path="/tenant/dashboard" element={<ProtectedRoute requiredRole="TENANT"><TenantDashboard /></ProtectedRoute>} />
                <Route path="/tenant/marketplace" element={<ProtectedRoute requiredRole="TENANT"><TenantMarketplace /></ProtectedRoute>} />
                <Route path="/tenant/marketplace/property/:id" element={<ProtectedRoute requiredRole="TENANT"><PropertyDetail /></ProtectedRoute>} />
                <Route path="/tenant/applications" element={<ProtectedRoute requiredRole="TENANT"><TenantApplications /></ProtectedRoute>} />
                <Route path="/tenant/rentals" element={<ProtectedRoute requiredRole="TENANT"><TenantRentals /></ProtectedRoute>} />
                <Route path="/tenant/payments" element={<ProtectedRoute requiredRole="TENANT"><TenantPayments /></ProtectedRoute>} />

                {/* Landlord Routes */}
                <Route path="/landlord/dashboard" element={<ProtectedRoute requiredRole="LANDLORD"><LandlordDashboard /></ProtectedRoute>} />
                <Route path="/landlord/properties" element={<ProtectedRoute requiredRole="LANDLORD"><LandlordProperties /></ProtectedRoute>} />
                <Route path="/landlord/agreements" element={<ProtectedRoute requiredRole="LANDLORD"><LandlordAgreements /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="ADMIN"><AdminDashboard /></ProtectedRoute>} />
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
