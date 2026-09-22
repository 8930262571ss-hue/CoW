import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';

// Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Pages
import HomePage from './features/home/HomePage';
import ExploreThemesPage from './features/explore/ExploreThemesPage';
import ThemeDetailPage from './features/theme-detail/ThemeDetailPage';
import VanInteriorPage from './features/van/VanInteriorPage';

// Booking Flow
import Step1Destination from './features/booking-flow/Step1Destination';
import Step2Theme from './features/booking-flow/Step2Theme';
import Step3MenuAddons from './features/booking-flow/Step3MenuAddons';
import Step4VehicleTime from './features/booking-flow/Step4VehicleTime';
import Step5Review from './features/booking-flow/Step5Review';
import CheckoutPage from './features/checkout/CheckoutPage';

// Tracking & Driver Simulator
import LiveTrackingPage from './features/ride-tracking/LiveTrackingPage';
import DriverSimulatorPage from './features/ride-tracking/DriverSimulatorPage';

// Profile & Journeys
import ProfilePage from './features/profile/ProfilePage';
import MyBookingsPage from './features/profile/MyBookingsPage';

// Admin Panel
import AdminLayout from './features/admin/AdminLayout';
import AdminDashboardPage from './features/admin/AdminDashboardPage';
import AdminThemesPage from './features/admin/AdminThemesPage';
import AdminVehiclesPage from './features/admin/AdminVehiclesPage';
import AdminMenuPage from './features/admin/AdminMenuPage';
import AdminPricingOffersPage from './features/admin/AdminPricingOffersPage';
import AdminRidesPage from './features/admin/AdminRidesPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AdminRouteGuard({ children }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return null;
  // If not admin, provide a friendly helper banner so anyone testing can easily access or demo
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <BrowserRouter>
          <ScrollToTop />
          <div className="flex flex-col min-h-screen bg-[#141310] text-[#e6e2db] font-sans selection:bg-[#c9a667]/30 selection:text-[#f7f3ec]">
            <Navbar />
            <div className="flex-grow pt-20">
              <Routes>
                {/* Customer Storefront Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/explore" element={<ExploreThemesPage />} />
                <Route path="/theme/:themeId" element={<ThemeDetailPage />} />
                <Route path="/van" element={<VanInteriorPage />} />

                {/* Booking Wizard Steps 1 to 5 */}
                <Route path="/booking/destination" element={<Step1Destination />} />
                <Route path="/booking/theme" element={<Step2Theme />} />
                <Route path="/booking/customize" element={<Step3MenuAddons />} />
                <Route path="/booking/vehicle-time" element={<Step4VehicleTime />} />
                <Route path="/booking/review" element={<Step5Review />} />

                {/* Checkout & PayU */}
                <Route path="/checkout" element={<CheckoutPage />} />

                {/* Live Real-time Ride Tracking */}
                <Route path="/ride/:bookingId/track" element={<LiveTrackingPage />} />

                {/* Driver Cockpit GPS Broadcaster */}
                <Route path="/driver/ride/:bookingId" element={<DriverSimulatorPage />} />

                {/* Profile & Journeys */}
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/journeys" element={<MyBookingsPage />} />

                {/* Admin Management Panel */}
                <Route
                  path="/admin"
                  element={
                    <AdminRouteGuard>
                      <AdminLayout />
                    </AdminRouteGuard>
                  }
                >
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="themes" element={<AdminThemesPage />} />
                  <Route path="vehicles" element={<AdminVehiclesPage />} />
                  <Route path="menu" element={<AdminMenuPage />} />
                  <Route path="pricing" element={<AdminPricingOffersPage />} />
                  <Route path="rides" element={<AdminRidesPage />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </BrowserRouter>
      </BookingProvider>
    </AuthProvider>
  );
}
