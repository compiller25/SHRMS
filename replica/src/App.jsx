import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './store/StoreContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import PropertyDetail from './pages/PropertyDetail';
import LandlordDashboard from './pages/LandlordDashboard';
import LandlordProperties from './pages/LandlordProperties';
import Agreements from './pages/Agreements';
import TenantDashboard from './pages/TenantDashboard';
import Applications from './pages/Applications';
import Rentals from './pages/Rentals';
import Payments from './pages/Payments';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <StoreProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/marketplace/property/:id" element={<PropertyDetail />} />

              {/* Tenant */}
              <Route path="/tenant" element={<TenantDashboard />} />
              <Route path="/tenant/applications" element={<Applications />} />
              <Route path="/tenant/rentals" element={<Rentals />} />
              <Route path="/tenant/payments" element={<Payments />} />

              {/* Landlord */}
              <Route path="/landlord" element={<LandlordDashboard />} />
              <Route path="/landlord/properties" element={<LandlordProperties />} />
              <Route path="/landlord/agreements" element={<Agreements />} />

              {/* Admin */}
              <Route path="/admin" element={<AdminDashboard />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </StoreProvider>
  );
}

export default App;
