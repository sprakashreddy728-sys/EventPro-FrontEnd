import api from "./api";

export const staffScannerService = {
  scanTicket: async (ticketId, token) => {
    try {
      console.log("=== SCANNING TICKET ===");
      console.log("Ticket ID:", ticketId);
      console.log("Request to: POST /checkin/scan");

      const response = await api.post(
        "/checkin/scan",
        { ticketId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Ticket scanned successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to scan ticket");
      console.error("Error status:", error.response?.status);
      console.error("Error data:", error.response?.data);
      console.error("Error message:", error.message);

      // Return structured error response
      if (error.response?.data) {
        return error.response.data;
      }

      throw {
        success: false,
        status: "error",
        message: error.message || "Failed to scan ticket",
      };
    }
  },

  getTicketStatus: async (ticketId) => {
    try {
      console.log("=== FETCHING TICKET STATUS ===");
      console.log("Ticket ID:", ticketId);

      const response = await api.get(`/checkin/ticket/${ticketId}`);

      console.log("✅ Ticket status fetched:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch ticket status");
      console.error("Error status:", error.response?.status);
      console.error("Error data:", error.response?.data);
      console.error("Error message:", error.message);

      if (error.response?.data) {
        return error.response.data;
      }

      throw {
        success: false,
        status: "error",
        message: error.message || "Failed to fetch ticket status",
      };
    }
  },

  getCheckinStats: async (eventId) => {
    try {
      const response = await api.get(`/checkin/stats/${eventId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching checkin stats:", error);
      throw error.response?.data || error;
    }
  },

  getEventCheckIns: async (eventId, token) => {
    try {
      console.log("=== FETCHING EVENT CHECK-INS ===");
      console.log("Event ID:", eventId);
      console.log("Request to: GET /checkin/event/:eventId");

      const response = await api.get(`/checkin/event/${eventId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("✅ Event check-ins fetched");
      console.log("Full response.data:", response.data);
      console.log("Response.data type:", typeof response.data);
      console.log("Is array?", Array.isArray(response.data));
      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      // Return the full response - the component will handle different structures
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch event check-ins");
      console.error("Error status:", error.response?.status);
      console.error("Error data:", error.response?.data);
      console.error("Error message:", error.message);
      console.error("Full error object:", error);

      if (error.response?.data) {
        return error.response.data;
      }

      throw {
        success: false,
        status: "error",
        message: error.message || "Failed to fetch event check-ins",
      };
    }
  },
};
