import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { bookingService } from "../../services/bookingService";
import Logo from "../../Components/Logo";
import Footer from "../../Components/Footer";

export default function MyBookings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState("");

  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  // Check for logged-in user
  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsLoggedIn(true);
    }

    const handleStorageChange = (e) => {
      if (e.key === "loggedInUser") {
        if (e.newValue) {
          setUser(JSON.parse(e.newValue));
          setIsLoggedIn(true);
        } else {
          setUser(null);
          setIsLoggedIn(false);
        }
      }
    };

    const handleUserLogout = () => {
      setLogoutMessage("✓ Logged out successfully");
      setTimeout(() => setLogoutMessage(""), 3000);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userLoggedOut", handleUserLogout);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userLoggedOut", handleUserLogout);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isUserMenuOpen && !e.target.closest(".user-menu-container")) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isUserMenuOpen]);

  // Listen for booking created events to update bookings in real-time
  useEffect(() => {
    const handleBookingCreated = (event) => {
      const bookingDetail = event.detail;
      console.log(
        "📌 Booking created event received in MyBookings:",
        bookingDetail
      );

      // Generate ticket ID if not provided
      const ticketId =
        bookingDetail.ticketId ||
        `TKT-${bookingDetail.id}-${Math.random()
          .toString(36)
          .substr(2, 5)
          .toUpperCase()}`;

      // Add the new booking to the list
      const newBooking = {
        id: bookingDetail.id,
        eventId: bookingDetail.eventId,
        numberOfSeats: bookingDetail.numberOfSeats,
        totalAmount: bookingDetail.totalAmount,
        eventName: bookingDetail.eventName,
        eventDate: bookingDetail.eventDate,
        eventLocation: bookingDetail.eventLocation,
        totalSeats: bookingDetail.numberOfSeats,
        amount: bookingDetail.totalAmount,
        ticketId: ticketId,
        paymentStatus: "Paid",
        createdAt: new Date().toISOString(),
      };

      setBookings((prevBookings) => [newBooking, ...prevBookings]);
    };

    window.addEventListener("bookingCreated", handleBookingCreated);
    return () =>
      window.removeEventListener("bookingCreated", handleBookingCreated);
  }, []);
  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setIsLoggedIn(false);
    setIsUserMenuOpen(false);
    setLogoutMessage("✓ Logged out successfully");

    window.dispatchEvent(new Event("userLoggedOut"));
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "loggedInUser",
        newValue: null,
        oldValue: localStorage.getItem("loggedInUser"),
        storageArea: localStorage,
      })
    );

    // Redirect to home page after a short delay to show logout message
    setTimeout(() => {
      navigate("/", { replace: true });
      setLogoutMessage("");
    }, 1500);
  };

  useEffect(() => {
    const loggedInUser = authService.getUser();

    if (!loggedInUser) {
      navigate("/login");
      return;
    }

    if (loggedInUser.role !== "customer") {
      navigate("/");
      return;
    }

    setUser(loggedInUser);
    fetchUserBookings(loggedInUser.id);
  }, [navigate]);

  const fetchUserBookings = async (userId) => {
    try {
      const data = await bookingService.getCustomerBookings(userId);
      setBookings(data);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      alert("Failed to load bookings. Please try again.");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (user) {
      setLoading(true);
      fetchUserBookings(user.id);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!confirm("Are you sure you want to delete this booking?")) {
      return;
    }

    try {
      setLoading(true);
      // Call backend to delete booking
      await bookingService.deleteBooking(bookingId);

      // Remove from local state
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));

      alert("Booking deleted successfully!");
      setLoading(false);
    } catch (error) {
      console.error("Failed to delete booking:", error);
      alert("Failed to delete booking. Please try again.");
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <>
      {/* Logout Success Message */}
      {logoutMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 font-semibold">
          {logoutMessage}
        </div>
      )}

      {/* Custom Navbar - Only Home and My Bookings */}
      <nav className="bg-white text-gray-900 shadow-lg fixed top-0 left-0 right-0 z-50">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Logo />
            </div>

            {/* Navigation Links - Only Home and My Bookings */}
            <div className="hidden md:flex space-x-8 items-center flex-1 justify-center">
              <Link
                to="/"
                className="font-bold text-gray-900 border-b-2 border-transparent hover:border-red-500 pb-1 transition"
              >
                Home
              </Link>
              <span className="text-gray-900 border-b-2 border-red-500 pb-1 font-bold">
                My Bookings
              </span>
            </div>

            {/* Profile Button */}
            <div className="hidden md:flex space-x-4 items-center relative user-menu-container">
              {isLoggedIn ? (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleUserMenu();
                    }}
                    className="flex items-center justify-center bg-red-500 text-white p-2 rounded-full font-semibold hover:bg-red-600 transition w-10 h-10"
                    title={user?.name}
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </button>

                  {/* User Menu Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute top-16 right-0 bg-white shadow-lg rounded-lg p-4 w-48 z-50 border border-gray-200">
                      <div className="pb-3 border-b border-gray-200">
                        <p className="font-semibold text-gray-900">
                          {user?.name}
                        </p>
                        <p className="text-sm text-gray-600">{user?.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded mt-2 font-semibold"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </>
              ) : null}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              {isLoggedIn && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleUserMenu();
                  }}
                  className="flex items-center justify-center bg-red-500 text-white p-2 rounded-full font-semibold hover:bg-red-600 transition w-10 h-10"
                  title={user?.name}
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </button>
              )}

              {/* Mobile User Menu */}
              {isUserMenuOpen && (
                <div className="absolute top-16 right-4 bg-white shadow-lg rounded-lg p-4 w-48 z-50 border border-gray-200">
                  <div className="pb-3 border-b border-gray-200">
                    <p className="font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded mt-2 font-semibold"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="min-h-screen bg-gray-50 pt-20">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  My Bookings
                </h1>
                <p className="text-gray-600 mt-1">
                  View all your event bookings
                </p>
              </div>
              <button
                onClick={handleRefresh}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition flex items-center gap-2"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-16">
              <p className="text-gray-600 text-lg font-medium">
                Loading your bookings...
              </p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-semibold text-gray-900">
                No bookings yet
              </h3>
              <p className="mt-1 text-gray-600">
                You haven't booked any events yet. Browse events and make your
                first booking!
              </p>
              <button
                onClick={() => navigate("/")}
                className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition"
              >
                Browse Events
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.map((booking) => {
                // Generate a unique ID if it doesn't exist
                const bookingId =
                  booking.id ||
                  `booking-${Math.random().toString(36).substr(2, 9)}`;

                return (
                  <div
                    key={bookingId}
                    className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-bold text-gray-900">
                          {booking.event?.name || booking.eventName || "Event"}
                        </h3>
                        <button
                          onClick={() => handleDeleteBooking(bookingId)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded transition"
                          title="Delete booking"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <p>
                          <span className="font-semibold">ID:</span>{" "}
                          <span className="font-mono text-xs">{bookingId}</span>
                        </p>
                        <p>
                          <span className="font-semibold">🎫 Ticket ID:</span>{" "}
                          <span className="font-mono text-xs font-bold text-gray-900">
                            {booking.ticketId ||
                              `TKT-${bookingId}-${Math.random()
                                .toString(36)
                                .substr(2, 5)
                                .toUpperCase()}`}
                          </span>
                        </p>
                        <p>
                          <span className="font-semibold">Date:</span>{" "}
                          {booking.event?.date
                            ? new Date(booking.event.date).toLocaleDateString()
                            : booking.eventDate || "N/A"}
                        </p>
                        <p>
                          <span className="font-semibold">Venue:</span>{" "}
                          {booking.event?.venue ||
                            booking.eventLocation ||
                            "N/A"}
                        </p>
                        <p>
                          <span className="font-semibold">Seats:</span>{" "}
                          {booking.totalSeats || booking.numberOfSeats || 0}
                        </p>
                        <p>
                          <span className="font-semibold">Amount:</span> $
                          {booking.amount !== undefined &&
                          booking.amount !== null
                            ? booking.amount
                            : booking.totalAmount !== undefined &&
                              booking.totalAmount !== null
                            ? booking.totalAmount
                            : "0.00"}
                        </p>
                        <p>
                          <span className="font-semibold">Status:</span>{" "}
                          <span className="text-green-600 font-semibold">
                            {booking.paymentStatus ||
                              booking.status ||
                              "completed"}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
}
