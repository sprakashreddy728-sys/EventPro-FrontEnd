import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../../services/authService";
import { bookingService } from "../../services/bookingService";

export default function CustomerHome() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(
    location.state?.tab || "dashboard"
  );

  useEffect(() => {
    // Get user from localStorage
    const loggedInUser = authService.getUser();

    if (!loggedInUser) {
      // Redirect to login if not authenticated
      navigate("/login");
      return;
    }

    setUser(loggedInUser);
    fetchUserBookings(loggedInUser.id);
  }, [navigate]);

  // Refresh bookings when bookings tab is active
  useEffect(() => {
    if (activeTab === "bookings" && user) {
      fetchUserBookings(user.id);
    }
  }, [activeTab, user]);

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

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const handleBrowseEvents = () => {
    navigate("/events");
  };

  if (!user) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, <span className="text-red-500">{user.name}</span>!
              </h1>
              <p className="text-gray-600 mt-1">Manage your event bookings</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "dashboard"
                  ? "border-red-500 text-red-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("account")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "account"
                  ? "border-red-500 text-red-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              My Account
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-semibold">
                      Total Bookings
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {bookings.length}
                    </p>
                  </div>
                  <div className="bg-blue-100 rounded-full p-3">
                    <svg
                      className="h-6 w-6 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-semibold">
                      Upcoming Events
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {
                        bookings.filter(
                          (b) => new Date(b.event.date) > new Date()
                        ).length
                      }
                    </p>
                  </div>
                  <div className="bg-green-100 rounded-full p-3">
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-semibold">
                      Total Spent
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      ₹
                      {bookings
                        .reduce((sum, b) => sum + parseFloat(b.amount || 0), 0)
                        .toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-red-100 rounded-full p-3">
                    <svg
                      className="h-6 w-6 text-red-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow p-8 text-white">
              <h3 className="text-2xl font-bold mb-2">
                Looking for more events?
              </h3>
              <p className="mb-4">Browse and book tickets for amazing events</p>
              <button
                onClick={handleBrowseEvents}
                className="bg-white text-red-500 hover:bg-gray-100 font-bold py-2 px-6 rounded-lg transition"
              >
                Browse Events
              </button>
            </div>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === "account" && (
          <div className="bg-white rounded-lg shadow p-8 max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Account Information
            </h2>

            <div className="space-y-6">
              {/* Profile Section */}
              <div className="flex items-center space-x-6 pb-6 border-b">
                <div className="bg-red-500 rounded-full w-20 h-20 flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Name</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {user.name}
                  </p>
                </div>
              </div>

              {/* Account Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Email
                  </label>
                  <p className="text-gray-900 py-2 px-4 bg-gray-50 rounded-lg">
                    {user.email}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Account Type
                  </label>
                  <p className="text-gray-900 py-2 px-4 bg-gray-50 rounded-lg capitalize">
                    {user.role}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Member Since
                  </label>
                  <p className="text-gray-900 py-2 px-4 bg-gray-50 rounded-lg">
                    {new Date().toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Status
                  </label>
                  <p className="text-gray-900 py-2 px-4 bg-green-50 rounded-lg text-green-700 font-semibold">
                    Active
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition">
                  Edit Profile
                </button>
                <button className="bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold py-2 px-6 rounded-lg transition">
                  Change Password
                </button>
              </div>

              {/* My Bookings Section */}
              <div className="mt-12 pt-12 border-t border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    My Bookings
                  </h3>
                  <button
                    onClick={() => fetchUserBookings(user.id)}
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

                {loading ? (
                  <div className="text-center py-10">Loading bookings...</div>
                ) : bookings.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
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
                      Start booking events to see them here
                    </p>
                    <button
                      onClick={handleBrowseEvents}
                      className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition"
                    >
                      Browse Events
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="bg-white border border-gray-200 rounded-lg shadow overflow-hidden hover:shadow-lg transition"
                      >
                        <div className="bg-gradient-to-r from-red-500 to-red-600 h-20"></div>

                        <div className="p-6">
                          <h4 className="text-lg font-bold text-gray-900 mb-2">
                            {booking.eventName ||
                              booking.event?.name ||
                              "Event"}
                          </h4>

                          <div className="space-y-2 text-sm text-gray-600 mb-4">
                            <p>
                              <span className="font-semibold">Date:</span>{" "}
                              {booking.eventDate ||
                                new Date(
                                  booking.event?.date
                                ).toLocaleDateString() ||
                                "N/A"}
                            </p>
                            <p>
                              <span className="font-semibold">Location:</span>{" "}
                              {booking.eventLocation ||
                                booking.event?.venue ||
                                "N/A"}
                            </p>
                            <p>
                              <span className="font-semibold">Seats:</span>{" "}
                              {booking.numberOfSeats || booking.totalSeats || 0}
                            </p>
                            <p>
                              <span className="font-semibold">Amount:</span> $
                              {booking.totalAmount || booking.amount || "0"}
                            </p>
                            <p>
                              <span className="font-semibold">Status:</span>{" "}
                              <span className="text-green-600 font-semibold">
                                {booking.paymentStatus ||
                                  booking.status ||
                                  "Confirmed"}
                              </span>
                            </p>
                          </div>

                          {booking.qrCodeURL && (
                            <div className="mb-4 text-center">
                              <img
                                src={booking.qrCodeURL}
                                alt="QR Code"
                                className="w-24 h-24 mx-auto"
                              />
                            </div>
                          )}

                          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-lg transition">
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
              <button
                onClick={() => fetchUserBookings(user.id)}
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

            {loading ? (
              <div className="text-center py-10">Loading bookings...</div>
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
                  Start booking events to see them here
                </p>
                <button
                  onClick={handleBrowseEvents}
                  className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition"
                >
                  Browse Events
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition"
                  >
                    <div className="bg-gradient-to-r from-red-500 to-red-600 h-24"></div>

                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {booking.eventName || booking.event?.name || "Event"}
                      </h3>

                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <p>
                          <span className="font-semibold">Date:</span>{" "}
                          {booking.eventDate ||
                            (booking.event?.date
                              ? new Date(
                                  booking.event.date
                                ).toLocaleDateString()
                              : "N/A")}
                        </p>
                        <p>
                          <span className="font-semibold">Venue:</span>{" "}
                          {booking.eventLocation ||
                            booking.event?.venue ||
                            "N/A"}
                        </p>
                        <p>
                          <span className="font-semibold">Seats:</span>{" "}
                          {booking.numberOfSeats || booking.totalSeats || 0}
                        </p>
                        <p>
                          <span className="font-semibold">Amount:</span> $
                          {booking.totalAmount || booking.amount || "0"}
                        </p>
                        <p>
                          <span className="font-semibold">Status:</span>{" "}
                          <span className="text-green-600 font-semibold">
                            {booking.paymentStatus ||
                              booking.status ||
                              "Confirmed"}
                          </span>
                        </p>
                      </div>

                      {booking.qrCodeURL && (
                        <div className="mb-4 text-center">
                          <img
                            src={booking.qrCodeURL}
                            alt="QR Code"
                            className="w-32 h-32 mx-auto"
                          />
                        </div>
                      )}

                      <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-lg transition">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
