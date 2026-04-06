import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/shared/ProtectedRoute';

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
import FarmerHire from './pages/farmer/Hire';
import FarmerBuyers from './pages/farmer/Buyers';

// Market Pages
import MarketDashboard from './pages/market/Dashboard';
import MarketBrowse from './pages/market/Browse';
import BatchDetails from './pages/market/BatchDetails';
import Checkout from './pages/market/Checkout';
import MarketLogistics from './pages/market/Logistics';
import Transporters from './pages/market/Transporters';
import Warehouses from './pages/market/Warehouses';

import Transport from './pages/shared/Transport';
import Warehouse from './pages/shared/Warehouse';
import ApplyJob from './pages/shared/ApplyJob';
import Profile from './pages/shared/Profile';
import SetupProfile from './pages/shared/SetupProfile';
import Chats from './pages/shared/Chats';

// Voice
import { VoiceProvider } from './context/VoiceContext';
import VoiceAssistant from './components/shared/VoiceAssistant';

import './App.css';

export default function App() {
  return (
    <Router>
      <VoiceProvider>
        <VoiceAssistant />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth onBack={() => window.history.back()} />} />
          <Route path="/trace/:batchId" element={<Trace />} />

          {/* Farmer App Routes */}
          <Route path="/farmer" element={
            <ProtectedRoute allowedRoles={['FARMER']}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/farmer/dashboard" replace />} />
            <Route path="dashboard" element={<FarmerDashboard />} />
            <Route path="listings" element={<FarmerListings />} />
            <Route path="listings/new" element={<CreateListing />} />
            <Route path="orders" element={<FarmerOrders />} />
            <Route path="payments" element={<FarmerPayments />} />
            <Route path="hire" element={<FarmerHire />} />
            <Route path="buyers" element={<FarmerBuyers />} />
            <Route path="chats" element={<Chats />} />
            <Route path="profile/edit" element={<SetupProfile />} />
          </Route>

          {/* Supermarket/Market Routes */}
          <Route path="/market" element={
            <ProtectedRoute allowedRoles={['BUYER', 'WAREHOUSE']}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/market/browse" replace />} />
            <Route path="dashboard" element={<MarketDashboard />} />
            <Route path="browse" element={<MarketBrowse />} />
            <Route path="batch/:id" element={<BatchDetails />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="logistics" element={<MarketLogistics />} />
            <Route path="transporters" element={<Transporters />} />
            <Route path="warehouses" element={<Warehouses />} />
            <Route path="chats" element={<Chats />} />
            <Route path="profile/edit" element={<SetupProfile />} />
          </Route>

          {/* Link-Based Logistics (No Auth) */}
          <Route path="/delivery/:token" element={<Transport />} />
          <Route path="/warehouse/:token" element={<Warehouse />} />
          <Route path="/apply/:jobId" element={<ApplyJob />} />
          <Route path="/profile/:id" element={<Profile />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </VoiceProvider>
    </Router>
  );
}
