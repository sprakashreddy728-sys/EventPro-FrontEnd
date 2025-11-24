import api from "./api";

export const seatService = {
  getEventSeats: async (eventId) => {
    try {
      const response = await api.get(`/seats/event/${eventId}`);
      return response.data.seats;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  lockSeat: async (seatId, eventId) => {
    try {
      const response = await api.post("/seats/lock", { seatId, eventId });
      return response.data.seat;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  unlockSeat: async (seatId) => {
    try {
      const response = await api.post("/seats/unlock", { seatId });
      return response.data.seat;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  markSeatsAsSold: async (eventId, seatIds) => {
    try {
      console.log("Marking seats as sold:", { eventId, seatIds });
      const response = await api.post("/seats/mark-sold", {
        eventId,
        seatIds: Array.isArray(seatIds) ? seatIds : [seatIds],
      });
      console.log("Seats marked as sold successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "Error marking seats as sold:",
        error.response?.data || error
      );
      throw error.response?.data || error;
    }
  },

  getBookedSeats: async (eventId) => {
    try {
      console.log("[SeatService] Fetching booked seats for event:", eventId);
      const response = await api.get(`/seats/booked/${eventId}`);

      // Handle different response formats from backend
      let bookedSeats = [];
      if (Array.isArray(response.data)) {
        // Response is directly an array
        bookedSeats = response.data;
      } else if (response.data?.bookedSeats) {
        // Response has bookedSeats property
        bookedSeats = response.data.bookedSeats;
      } else if (response.data?.seats) {
        // Fallback to seats property
        bookedSeats = response.data.seats;
      }

      console.log(
        "[SeatService] Successfully fetched booked seats:",
        bookedSeats
      );
      console.log(
        "[SeatService] Booked seats type:",
        typeof bookedSeats,
        "Length:",
        Array.isArray(bookedSeats) ? bookedSeats.length : "N/A"
      );

      return bookedSeats || [];
    } catch (error) {
      console.error(
        "[SeatService] Error fetching booked seats:",
        error.message
      );
      console.error("[SeatService] Error details:", error);
      // Return empty array on error to allow bookings to proceed
      // Backend should handle this, frontend acts as cache
      return [];
    }
  },

  // Alias for refreshing booked seats - same as getBookedSeats
  refreshBookedSeats: async (eventId) => {
    return seatService.getBookedSeats(eventId);
  },
};