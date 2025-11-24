import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { bookingService } from "../../services/bookingService";
import { seatService } from "../../services/seatService";
import { authService } from "../../services/authService";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state?.booking || {};

  console.log("CheckoutPage received bookingData:", bookingData);

  const [cardData, setCardData] = useState({
    cardholderName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number with spaces
    if (name === "cardNumber") {
      formattedValue = value
        .replace(/\s/g, "")
        .replace(/(\d{4})/g, "$1 ")
        .trim();
    }

    // Format expiry date
    if (name === "expiryDate") {
      formattedValue = value.replace(/\D/g, "");
      if (formattedValue.length >= 2) {
        formattedValue =
          formattedValue.substring(0, 2) + "/" + formattedValue.substring(2, 4);
      }
    }

    // Limit CVV to 3 digits
    if (name === "cvv") {
      formattedValue = value.replace(/\D/g, "").substring(0, 3);
    }

    setCardData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validatePayment = () => {
    const newErrors = {};

    if (!cardData.cardholderName.trim()) {
      newErrors.cardholderName = "Cardholder name is required";
    }

    if (
      !cardData.cardNumber ||
      cardData.cardNumber.replace(/\s/g, "").length !== 16
    ) {
      newErrors.cardNumber = "Valid card number required (16 digits)";
    }

    if (!cardData.expiryDate || cardData.expiryDate.length !== 5) {
      newErrors.expiryDate = "Valid expiry date required (MM/YY)";
    }

    if (!cardData.cvv || cardData.cvv.length !== 3) {
      newErrors.cvv = "Valid CVV required (3 digits)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!validatePayment()) {
      return;
    }

    setLoading(true);

    try {
      // Get user from localStorage
      const user = authService.getUser();

      if (!user) {
        alert("User not found. Please login again.");
        navigate("/login");
        setLoading(false);
        return;
      }

      // Validate booking data
      if (
        !bookingData.selectedSeats ||
        bookingData.selectedSeats.length === 0
      ) {
        alert("No seats selected. Please go back and select seats.");
        navigate("/booking");
        setLoading(false);
        return;
      }

      console.log("Booking data received:", bookingData);
      console.log("User:", user);

      // Calculate total with fees
      const seatCount = bookingData.selectedSeats?.length || 0;
      const subtotal = bookingData.totalPrice || 0;
      const platformCharge = ((subtotal + 15) * 0.02).toFixed(2);
      const totalWithFees = (
        subtotal +
        15 +
        parseFloat(platformCharge)
      ).toFixed(2);

      // Prepare booking data - Simplified payload
      const bookingPayload = {
        customerId: parseInt(user.id) || 1,
        eventId: parseInt(bookingData.eventId) || 1,
        numberOfSeats: bookingData.selectedSeats?.length || 1,
        totalAmount: parseFloat(totalWithFees) || 0, // Use calculated total with fees
        amount: parseFloat(totalWithFees) || 0, // Use calculated total with fees
        seats: bookingData.selectedSeats?.join(",") || "A1", // Convert array to comma-separated string
        status: "pending",
      };

      console.log("Sending simplified booking payload:", bookingPayload);
      console.log("Selected seats:", bookingData.selectedSeats);

      // Validate payload
      if (
        !bookingPayload.customerId ||
        !bookingPayload.eventId ||
        !bookingPayload.seats ||
        bookingPayload.seats.length === 0
      ) {
        alert("Invalid booking data. Please try again.");
        setLoading(false);
        return;
      }

      // Create booking
      const newBooking = await bookingService.createBooking(bookingPayload);
      console.log("Booking created successfully:", newBooking);
      console.log("Booking ID value:", newBooking?.id);
      console.log("Booking ticket ID:", newBooking?.ticketId);
      console.log(
        "Booking full structure:",
        JSON.stringify(newBooking, null, 2)
      );

      // Mark selected seats as sold
      try {
        const seatIds = bookingPayload.seats.split(",");
        await seatService.markSeatsAsSold(bookingPayload.eventId, seatIds);
        console.log("Seats marked as sold successfully");

        // Dispatch event to update booking page in real-time
        window.dispatchEvent(
          new CustomEvent("seatsMarkedSold", {
            detail: {
              eventId: bookingPayload.eventId,
              seatIds: seatIds,
            },
          })
        );

        // Also store in localStorage for cross-tab communication
        const bookedSeatsKey = `bookedSeats_${bookingPayload.eventId}`;
        const existingBooked = JSON.parse(
          localStorage.getItem(bookedSeatsKey) || "[]"
        );
        const updatedBooked = [...new Set([...existingBooked, ...seatIds])];
        localStorage.setItem(bookedSeatsKey, JSON.stringify(updatedBooked));
        console.log(
          "[CheckoutPage] Stored booked seats in localStorage:",
          updatedBooked
        );
      } catch (seatError) {
        console.warn("Warning: Could not mark seats as sold:", seatError);
        // Don't fail the entire booking if seat marking fails
      }

      // Dispatch booking created event to update organizer dashboard and MyBookings
      window.dispatchEvent(
        new CustomEvent("bookingCreated", {
          detail: {
            id: newBooking.id,
            eventId: bookingData.eventId,
            numberOfSeats: bookingData.selectedSeats?.length || 0,
            totalAmount: parseFloat(totalWithFees),
            eventName: bookingData.eventName,
            eventDate: bookingData.eventDate,
            eventLocation: bookingData.eventLocation,
          },
        })
      );

      // Show confirmation modal with booking details
      const bookingId =
        newBooking.id ||
        newBooking.booking?.id ||
        Math.random().toString(36).substr(2, 9);
      const randomSuffix = Math.random()
        .toString(36)
        .substr(2, 5)
        .toUpperCase();
      const generatedTicketId = `TKT-${bookingId}-${randomSuffix}`;

      setConfirmationData({
        bookingId: bookingId,
        ticketId: newBooking.ticketId || generatedTicketId,
        eventName: bookingData.eventName,
        eventDate: bookingData.eventDate,
        eventLocation: bookingData.eventLocation,
        totalSeats: bookingData.selectedSeats?.length || 0,
        totalAmount: parseFloat(totalWithFees),
      });

      console.log("Confirmation data set:", {
        bookingId,
        ticketId: newBooking.ticketId || generatedTicketId,
        newBooking,
      });

      setLoading(false);
    } catch (error) {
      console.error("Payment failed - Full error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Error message:", error.message);

      let errorMessage = "An error occurred during payment processing.";

      if (error.response?.data?.errors) {
        // Validation errors from backend
        errorMessage = Object.values(error.response.data.errors).join(", ");
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.statusText) {
        errorMessage = `Server error (${error.response.status}): ${error.response.statusText}`;
      } else if (error.message) {
        errorMessage = error.message;
      }

      console.error("Final error message:", errorMessage);
      alert(`Payment failed: ${errorMessage}`);
      setLoading(false);
    }
  };

  const seatCount = bookingData.selectedSeats?.length || 0;
  const subtotal = bookingData.totalPrice || 0;
  const platformCharge = ((subtotal + 15) * 0.02).toFixed(2);
  const total = (subtotal + 15 + parseFloat(platformCharge)).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-lg text-gray-600">
            Complete your booking for {bookingData.eventName || "Event"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Order Summary
            </h2>

            <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Event:</span>
                <span className="font-semibold text-gray-900">
                  {bookingData.eventName || "Rock Concert 2025"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Date:</span>
                <span className="font-semibold text-gray-900">
                  {bookingData.eventDate || "2025-12-15 at 19:00"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Location:</span>
                <span className="font-semibold text-gray-900">
                  {bookingData.eventLocation ||
                    "Madison Square Garden, New York"}
                </span>
              </div>
            </div>

            {/* Selected Seats */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Selected Seats ({seatCount})
              </h3>
              <div className="space-y-2">
                {bookingData.selectedSeats &&
                  bookingData.selectedSeats.map((seat) => (
                    <div key={seat} className="flex justify-between text-sm">
                      <span className="text-gray-700">{seat}</span>
                      <span className="font-semibold text-gray-900">
                        ${bookingData.seatPrices?.[seat] || 75}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold text-gray-900">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Booking Fee:</span>
                <span className="font-semibold text-gray-900">$15.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Platform Charge (2%):</span>
                <span className="font-semibold text-gray-900">
                  ${platformCharge}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-bold text-gray-900">Total:</span>
              <span className="text-3xl font-bold text-red-600">${total}</span>
            </div>

            {/* Security Info */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-4">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Your payment information is secure</span>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Payment Information
            </h2>

            <form onSubmit={handlePayment} className="space-y-5">
              {/* Cardholder Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  name="cardholderName"
                  value={cardData.cardholderName}
                  onChange={handleCardChange}
                  placeholder="John Doe"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.cardholderName ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.cardholderName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.cardholderName}
                  </p>
                )}
              </div>

              {/* Card Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  name="cardNumber"
                  value={cardData.cardNumber}
                  onChange={handleCardChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.cardNumber ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.cardNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.cardNumber}
                  </p>
                )}
              </div>

              {/* Expiry and CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={cardData.expiryDate}
                    onChange={handleCardChange}
                    placeholder="MM/YY"
                    maxLength="5"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      errors.expiryDate ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.expiryDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.expiryDate}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    name="cvv"
                    value={cardData.cvv}
                    onChange={handleCardChange}
                    placeholder="123"
                    maxLength="3"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      errors.cvv ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.cvv && (
                    <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
                  )}
                </div>
              </div>

              {/* Payment Buttons */}
              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => navigate("/booking")}
                  className="w-1/2 border-2 border-gray-300 hover:border-gray-400 text-gray-800 font-bold py-3 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
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
                      d="M3 10l1.5 1.5a7 7 0 0010 0L16 10M3 14l1.5 1.5a7 7 0 0010 0L16 14"
                    />
                  </svg>
                  {loading ? "Processing..." : `Pay $${total}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      {confirmationData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 shadow-2xl">
            {/* Success Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>

            {/* Success Message */}
            <h2 className="text-xl font-bold text-center text-gray-900 mb-1">
              Booking Confirmed!
            </h2>
            <p className="text-center text-gray-600 mb-4 text-sm">
              Your payment has been processed successfully
            </p>

            {/* Booking Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
              {/* Booking ID */}
              <div className="border-b border-gray-200 pb-2">
                <p className="text-xs text-gray-600 mb-1">Booking ID</p>
                <p className="text-sm font-bold text-gray-900 font-mono">
                  {confirmationData.bookingId}
                </p>
              </div>

              {/* Ticket ID */}
              <div className="border-b border-gray-200 pb-2">
                <p className="text-xs text-gray-600 mb-1">🎫 Ticket ID</p>
                <p className="text-sm font-bold text-gray-900 font-mono">
                  {confirmationData.ticketId
                    ? confirmationData.ticketId
                    : `TKT-${confirmationData.bookingId}-${Math.random()
                        .toString(36)
                        .substr(2, 5)
                        .toUpperCase()}`}
                </p>
              </div>

              {/* Event Name */}
              <div className="border-b border-gray-200 pb-2">
                <p className="text-xs text-gray-600 mb-1">Event</p>
                <p className="text-sm font-semibold text-gray-900">
                  {confirmationData.eventName}
                </p>
              </div>

              {/* Event Date */}
              <div className="border-b border-gray-200 pb-2">
                <p className="text-xs text-gray-600 mb-1">📅 Date & Time</p>
                <p className="text-sm font-semibold text-gray-900">
                  {confirmationData.eventDate}
                </p>
              </div>

              {/* Location */}
              <div className="border-b border-gray-200 pb-2">
                <p className="text-xs text-gray-600 mb-1">📍 Location</p>
                <p className="text-sm font-semibold text-gray-900">
                  {confirmationData.eventLocation}
                </p>
              </div>

              {/* Seats & Amount */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Seats</p>
                  <p className="text-lg font-bold text-gray-900">
                    {confirmationData.totalSeats}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Amount Paid</p>
                  <p className="text-lg font-bold text-green-600">
                    ${confirmationData.totalAmount?.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Info Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-800">
                ✓ A confirmation email has been sent to your registered email
                address.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/my-bookings")}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 text-sm rounded-lg transition"
              >
                View My Bookings
              </button>
              <button
                onClick={() => navigate("/#events")}
                className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-800 font-bold py-2 text-sm rounded-lg transition"
              >
                Browse Events
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}