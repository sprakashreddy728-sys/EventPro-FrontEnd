import api from "./api";

export const bookingService = {
  createBooking: async (bookingData) => {
    try {
      console.log("=== BOOKING SERVICE ===");
      console.log(
        "Creating booking with data:",
        JSON.stringify(bookingData, null, 2)
      );
      console.log("Request will be sent to: POST /bookings");
      console.log("Token available:", !!localStorage.getItem("token"));

      const response = await api.post("/bookings", bookingData);
      console.log("✅ Booking created successfully:", response.data);
      return response.data.booking || response.data;
    } catch (error) {
      console.error("❌ Booking creation failed");
      console.error("Error object:", error);
      console.error("Error status:", error.response?.status);
      console.error("Error statusText:", error.response?.statusText);
      console.error("Error data:", error.response?.data);
      console.error("Error message:", error.message);
      console.error("Full response:", error.response);
      console.error("Request URL:", error.config?.url);
      console.error("Request headers:", error.config?.headers);
      console.error("Request data:", error.config?.data);

      // Don't use localStorage fallback - force backend to work
      throw error.response?.data || error;
    }
  },

  getBookingById: async (bookingId) => {
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      return response.data.booking;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getCustomerBookings: async (customerId) => {
    try {
      const response = await api.get(`/bookings/customer/${customerId}`);
      return response.data.bookings;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deleteBooking: async (bookingId) => {
    try {
      const response = await api.delete(`/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  processPayment: async (paymentData) => {
    try {
      const response = await api.post("/bookings/payment", paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
