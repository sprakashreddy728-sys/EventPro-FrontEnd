import { useState, useEffect } from "react";
import { authService } from "../../services/authService";
import { bookingService } from "../../services/bookingService";

export default function Account() {
  const [user] = useState(authService.getUser());
  const [editMode, setEditMode] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  // Load bookings from backend
  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        const data = await bookingService.getCustomerBookings(user?.id);
        setBookings(data);
      } catch (error) {
        console.error("Failed to load bookings:", error);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadBookings();
    }
  }, [user?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // TODO: Call backend API to update user profile
    console.log("Saving profile:", formData);
    setEditMode(false);
  };

  if (!user) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center space-x-6">
            <div className="bg-red-500 rounded-full w-24 h-24 flex items-center justify-center">
              <span className="text-white text-5xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">Customer</p>
            </div>
          </div>
          <button
            onClick={() => setEditMode(!editMode)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            {editMode ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {/* Information */}
        <div className="border-t pt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6">
            Account Information
          </h3>

          {editMode ? (
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleSave}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Full Name</p>
                <p className="text-lg font-semibold text-gray-900">
                  {user.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Email Address</p>
                <p className="text-lg font-semibold text-gray-900">
                  {user.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formData.phone || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Account Type</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">
                  {user.role}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Security Section */}
        <div className="border-t mt-8 pt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Security</h3>
          <button className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition">
            Change Password
          </button>
        </div>
      </div>

      {/* My Bookings Section */}
      <div className="mt-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">My Bookings</h2>

        {bookings && bookings.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {bookings.map((booking, index) => (
              <div
                key={booking.id || index}
                className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-600"
              >
                {/* Booking Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {booking.eventName || "Event"}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Booking ID:{" "}
                      <span className="font-mono font-semibold">
                        {booking.id}
                      </span>
                    </p>
                  </div>
                  <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full font-semibold text-sm">
                    ✓ {booking.status || "Confirmed"}
                  </span>
                </div>

                {/* Booking Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-200">
                  {/* Date */}
                  <div>
                    <p className="text-sm text-gray-600 mb-1">📅 Date & Time</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {booking.eventDate || "N/A"}
                    </p>
                  </div>

                  {/* Location */}
                  <div>
                    <p className="text-sm text-gray-600 mb-1">📍 Location</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {booking.eventLocation || "N/A"}
                    </p>
                  </div>

                  {/* Seats */}
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      🎫 Number of Seats
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {booking.numberOfSeats || booking.seats?.length || 0}{" "}
                      Seats
                    </p>
                  </div>

                  {/* Seat Numbers */}
                  {booking.seats && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        🎯 Seat Numbers
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {typeof booking.seats === "string"
                          ? booking.seats
                          : booking.seats.join(", ")}
                      </p>
                    </div>
                  )}

                  {/* Amount */}
                  <div>
                    <p className="text-sm text-gray-600 mb-1">💰 Amount Paid</p>
                    <p className="text-lg font-bold text-green-600">
                      ${booking.totalAmount || booking.amount || "0.00"}
                    </p>
                  </div>

                  {/* Booking Date */}
                  {booking.createdAt && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">📝 Booked On</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(booking.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition">
                    Download Ticket
                  </button>
                  <button className="flex-1 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-2 px-4 rounded-lg transition">
                    Contact Support
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <svg
              className="h-16 w-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Bookings Yet
            </h3>
            <p className="text-gray-600 mb-6">
              You haven't booked any events yet. Browse events and make your
              first booking!
            </p>
            <a
              href="/#events"
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition"
            >
              Browse Events
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
