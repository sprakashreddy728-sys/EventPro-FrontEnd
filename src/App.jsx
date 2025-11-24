import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./Components/Navbar";
import BookingPage from "./Modules/Customer/BookingPage";
import CheckoutPage from "./Modules/Customer/CheckoutPage";
import { OrganizerDashboard } from "./Modules/Organizer";
import AdminDashboard from "./Modules/Admin/AdminDashboard";
import AdminEventsManagement from "./Modules/Admin/EventsManagement";
import StaffScanner from "./Modules/Staff/StaffScanner";
import LoginForm from "./Components/LoginForm";
import RegisterForm from "./Components/RegisterForm";
import CustomerDashboard from "./Modules/Customer/CustomerDashboard";
import MyBookings from "./Modules/Customer/Mybookings";
import { authService } from "./services/authService";

// AuthPages wrapper component for login/register routes - displays based on global user state
function AuthPages({ globalUser }) {
  const [isLoginView, setIsLoginView] = useState(true);
  const navigate = useNavigate();

  // If user is logged in globally, redirect to home
  if (globalUser) {
    return <Navigate to="/" replace />;
  }

  const handleLoginSuccess = () => {
    navigate("/", { replace: true });
  };

  const handleSwitchToRegister = () => {
    setIsLoginView(false);
  };

  const handleSwitchToLogin = () => {
    setIsLoginView(true);
  };

  return isLoginView ? (
    <LoginForm
      userType="customer"
      onSuccess={handleLoginSuccess}
      onSwitchToRegister={handleSwitchToRegister}
    />
  ) : (
    <RegisterForm
      onSuccess={handleLoginSuccess}
      onSwitchToLogin={handleSwitchToLogin}
    />
  );
}
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user from authService
    const loggedInUser = authService.getUser();
    if (loggedInUser) {
      console.log("User from localStorage on mount:", loggedInUser);
      setUser(loggedInUser);
    }

    // Mark loading as complete after getting user from localStorage
    setLoading(false);

    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === "loggedInUser") {
        const updatedUser = authService.getUser();
        console.log("Storage change detected:", updatedUser);
        if (updatedUser) {
          setUser(updatedUser);
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Also listen for updates from the same tab using a custom event
  useEffect(() => {
    const handleUserUpdate = (e) => {
      console.log("userLoggedIn event received");
      const updatedUser = authService.getUser();
      console.log("Updated user from event:", updatedUser);
      console.log("User role value:", updatedUser?.role);
      console.log("User role type:", typeof updatedUser?.role);
      if (updatedUser) {
        setUser(updatedUser);
      } else {
        setUser(null);
      }
    };

    const handleUserLogout = (e) => {
      console.log("userLoggedOut event received");
      setUser(null);
      setLoading(false); // Ensure loading is false so home page shows
    };

    window.addEventListener("userLoggedIn", handleUserUpdate);
    window.addEventListener("userLoggedOut", handleUserLogout);
    return () => {
      window.removeEventListener("userLoggedIn", handleUserUpdate);
      window.removeEventListener("userLoggedOut", handleUserLogout);
    };
  }, []);

  // Protected Route Component
  const ProtectedRoute = ({ children, requiredRole }) => {
    const userRole = user?.role ? String(user.role).trim().toLowerCase() : null;
    const normalizedRequiredRole = requiredRole
      ? String(requiredRole).trim().toLowerCase()
      : null;

    console.log(
      "ProtectedRoute check - user:",
      user,
      "userRole (normalized):",
      userRole,
      "requiredRole (normalized):",
      normalizedRequiredRole,
      "loading:",
      loading
    );

    // Show loading screen while checking user
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-600 font-semibold">Loading...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      console.log("No user, redirecting to login");
      return <Navigate to="/login" replace />;
    }

    if (normalizedRequiredRole && userRole !== normalizedRequiredRole) {
      console.log(
        `User role (${userRole}) doesn't match required role (${normalizedRequiredRole}), redirecting to home`
      );
      return <Navigate to="/" replace />;
    }

    console.log("ProtectedRoute - allowing access");
    return children;
  };

  return (
    <Router>
      {user?.role !== "organizer" &&
        user?.role !== "staff" &&
        user?.role !== "admin" && <Navbar />}
      <Routes>
        <Route
          path="/"
          element={
            loading ? (
              <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
                  <p className="text-gray-600 font-semibold">Loading...</p>
                </div>
              </div>
            ) : user &&
              (user.role === "organizer" ||
                user.role === "admin" ||
                user.role === "staff") &&
              localStorage.getItem("loggedInUser") ? (
              // Only redirect to role dashboards if user is actually logged in
              user.role === "organizer" ? (
                <Navigate to="/organizer-dashboard" replace />
              ) : user.role === "admin" ? (
                <Navigate to="/admin/dashboard" replace />
              ) : user.role === "staff" ? (
                <Navigate to="/staff/scanner" replace />
              ) : null
            ) : (
              <>
                <Navbar />
                <CustomerDashboard />
              </>
            )
          }
        />
        <Route path="/login" element={<AuthPages globalUser={user} />} />
        <Route path="/register" element={<AuthPages globalUser={user} />} />

        {/* Booking Routes */}
        <Route
          path="/booking"
          element={
            <ProtectedRoute requiredRole="customer">
              <BookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute requiredRole="customer">
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute requiredRole="customer">
              <MyBookings />
            </ProtectedRoute>
          }
        />

        {/* Organizer Routes */}
        <Route
          path="/organizer-dashboard"
          element={
            <ProtectedRoute requiredRole="organizer">
              <OrganizerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Staff Routes */}
        <Route
          path="/staff/scanner"
          element={
            <ProtectedRoute requiredRole="staff">
              <StaffScanner />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/events"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminEventsManagement />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
