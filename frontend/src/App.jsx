import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages - Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyOtp from './pages/auth/VerifyOtp';

// Pages - Main
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import ProductDetails from './pages/ProductDetails';

// Pages - Dashboard
import AddProduct from './pages/dashboard/AddProduct';
import Dashboard from './pages/dashboard/Dashboard';
import Messages from './pages/dashboard/Messages';
import MyListings from './pages/dashboard/MyListings';
import Notifications from './pages/dashboard/Notifications';
import Purchases from './pages/dashboard/Purchases';

// Pages - Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReports from './pages/admin/AdminReports';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;

  return children;
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />

        {/* Main Application */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/product/:id" element={<ProductDetails />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard/add-product" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
          <Route path="/dashboard/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/dashboard/listings" element={<ProtectedRoute><MyListings /></ProtectedRoute>} />
          <Route path="/dashboard/purchases" element={<ProtectedRoute><Purchases /></ProtectedRoute>} />
          <Route path="/dashboard/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        </Route>

        {/* Admin Application */}
        <Route element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/reports" element={<AdminReports />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
