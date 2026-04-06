import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';

// Public Pages
import Landing from './pages/landing/Landing';
import Auth from './pages/auth/Auth';
import Trace from './pages/shared/Trace';

// Farmer Pages
import FarmerDashboard from './pages/farmer/Dashboard';
import FarmerListings from './pages/farmer/Listings';
import CreateListing from './pages/farmer/CreateListing';
import FarmerOrders from './pages/farmer/Orders';
import FarmerPayments from './pages/farmer/Payments';

// Market Pages
import MarketDashboard from './pages/market/Dashboard';
import MarketBrowse from './pages/market/Browse';
import BatchDetails from './pages/market/BatchDetails';
import Checkout from './pages/market/Checkout';
import MarketLogistics from './pages/market/Logistics';

// Other Shared
import Transport from './pages/shared/Transport';
import Warehouse from './pages/shared/Warehouse';

import './App.css';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth onBack={() => window.history.back()} />} />
        <Route path="/trace/:batchId" element={<Trace />} />

        {/* Farmer App Routes */}
        <Route path="/farmer" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/farmer/dashboard" replace />} />
          <Route path="dashboard" element={<FarmerDashboard />} />
          <Route path="listings" element={<FarmerListings />} />
          <Route path="listings/new" element={<CreateListing />} />
          <Route path="orders" element={<FarmerOrders />} />
          <Route path="payments" element={<FarmerPayments />} />
        </Route>

        {/* Supermarket/Market Routes */}
        <Route path="/market" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/market/browse" replace />} />
          <Route path="dashboard" element={<MarketDashboard />} />
          <Route path="browse" element={<MarketBrowse />} />
          <Route path="batch/:id" element={<BatchDetails />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="logistics" element={<MarketLogistics />} />
        </Route>

        {/* Link-Based Logistics (No Auth) */}
        <Route path="/delivery/:token" element={<Transport />} />
        <Route path="/warehouse/:token" element={<Warehouse />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
