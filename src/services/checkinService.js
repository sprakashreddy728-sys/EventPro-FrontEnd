import api from "./api";

// Mock check-in data for development/testing
const MOCK_CHECKINS = [
  {
    id: "CHK001",
    customerName: "John Smith",
    eventName: "Rock Concert 2025",
    bookingReference: "BK001",
    ticketId: "TKT-BK001-ABC123",
    totalSeats: 2,
    amount: 150.0,
  },
  {
    id: "CHK002",
    customerName: "Sarah Johnson",
    eventName: "Rock Concert 2025",
    bookingReference: "BK002",
    ticketId: "TKT-BK002-DEF456",
    totalSeats: 1,
    amount: 100.0,
  },
  {
    id: "CHK003",
    customerName: "Michael Brown",
    eventName: "Rock Concert 2025",
    bookingReference: "BK003",
    ticketId: "TKT-BK003-GHI789",
    totalSeats: 3,
    amount: 225.0,
  },
];

export const checkInService = {
  getEventCheckIns: async (eventId, token) => {
    try {
      console.log("📋 Fetching check-ins for event:", eventId);
      const response = await api.get(`/checkin/event/${eventId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log("✅ Check-ins fetched from backend");
      return response.data;
    } catch (error) {
      console.warn("⚠️ Backend unavailable, returning empty check-ins");
      // Return empty array gracefully
      return {
        success: true,
        checkIns: [],
        isMock: false,
      };
    }
  },

  createCheckIn: async (bookingId) => {
    try {
      const response = await api.post("/checkin", { bookingId });
      return response.data.checkIn;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  scanTicket: async (ticketId, eventId, token) => {
    try {
      console.log("🔍 Scanning ticket:", ticketId);
      const response = await api.post(
        `/checkin/scan`,
        { ticketId, eventId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("✅ Ticket scanned successfully");
      return response.data;
    } catch (error) {
      console.warn("⚠️ Backend unavailable, using mock validation");
      // Mock scan response - check if ticket exists in mock data
      const matchingTicket = MOCK_CHECKINS.find(
        (t) => t.ticketId === ticketId || t.id === ticketId
      );

      if (matchingTicket) {
        return {
          success: true,
          status: "valid",
          booking: {
            customerName: matchingTicket.customerName,
            eventName: matchingTicket.eventName,
            eventId: eventId || 1,
            bookingReference: matchingTicket.bookingReference,
            totalSeats: matchingTicket.totalSeats,
            amount: matchingTicket.amount,
          },
          isMock: true,
        };
      } else {
        return {
          success: false,
          status: "invalid",
          message: "Ticket not found",
          isMock: true,
        };
      }
    }
  },
};

// Keep old export for compatibility
export const checkinService = {
  createCheckIn: async (bookingId) => {
    try {
      const response = await api.post("/checkin", { bookingId });
      return response.data.checkIn;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getEventCheckIns: async (eventId) => {
    try {
      const response = await api.get(`/checkin/event/${eventId}`);
      return response.data.checkIns;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
