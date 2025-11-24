import api from "./api";

export const eventService = {
  getAllEvents: async () => {
    try {
      const response = await api.get("/events");
      console.log("getAllEvents response:", response.data);
      // Handle different response formats from backend
      if (response.data.events && Array.isArray(response.data.events)) {
        return response.data.events;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error("getAllEvents error:", error);
      throw error.response?.data || error;
    }
  },

  getEventById: async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}`);
      return response.data.event || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  createEvent: async (eventData) => {
    try {
      console.log("Creating event with data:", eventData);
      const response = await api.post("/events", eventData);
      console.log("Event created successfully:", response.data);
      return response.data.event || response.data;
    } catch (error) {
      console.error("Event creation error - Full error:", error);
      console.error(
        "Event creation error - Response data:",
        error.response?.data
      );
      console.error("Event creation error - Status:", error.response?.status);
      console.error("Event creation error - Message:", error.message);
      throw error.response?.data || error;
    }
  },

  updateEvent: async (eventId, eventData) => {
    try {
      const response = await api.put(`/events/${eventId}`, eventData);
      return response.data.event || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  approveEvent: async (eventId) => {
    try {
      console.log("Approving event with ID:", eventId);
      // Try PATCH first, fall back to POST if PATCH fails
      try {
        const response = await api.patch(`/events/${eventId}/approve`, {});
        console.log("Event approved successfully with PATCH:", response.data);
        return response.data.event || response.data;
      } catch (patchError) {
        console.log("PATCH failed, trying POST instead");
        const response = await api.post(`/events/${eventId}/approve`, {});
        console.log("Event approved successfully with POST:", response.data);
        return response.data.event || response.data;
      }
    } catch (error) {
      console.error("Error approving event - Full error:", error);
      console.error("Error response status:", error.response?.status);
      console.error("Error response data:", error.response?.data);
      console.error("Error message:", error.message);
      throw error.response?.data || error;
    }
  },

  rejectEvent: async (eventId) => {
    try {
      console.log("Rejecting event with ID:", eventId);
      // Try PATCH first, fall back to POST if PATCH fails
      try {
        const response = await api.patch(`/events/${eventId}/reject`, {});
        console.log("Event rejected successfully with PATCH:", response.data);
        return response.data.event || response.data;
      } catch (patchError) {
        console.log("PATCH failed, trying POST instead");
        const response = await api.post(`/events/${eventId}/reject`, {});
        console.log("Event rejected successfully with POST:", response.data);
        return response.data.event || response.data;
      }
    } catch (error) {
      console.error("Error rejecting event - Full error:", error);
      console.error("Error response status:", error.response?.status);
      console.error("Error response data:", error.response?.data);
      console.error("Error message:", error.message);
      throw error.response?.data || error;
    }
  },

  deleteEvent: async (eventId) => {
    try {
      await api.delete(`/events/${eventId}`);
      return { success: true };
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getEventsByStatus: async (status) => {
    try {
      // Try the path parameter approach first: /events/status/:status
      const url = `/events/status/${status}`;
      console.log("Calling API endpoint:", url);
      const response = await api.get(url);
      console.log(`getEventsByStatus(${status}) response:`, response.data);

      // Handle different response formats from backend
      let events = [];
      if (response.data.events && Array.isArray(response.data.events)) {
        events = response.data.events;
      } else if (Array.isArray(response.data)) {
        events = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        events = response.data.data;
      }

      return events;
    } catch (error) {
      console.error("First attempt failed - API Error Details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.response?.config?.url,
        data: error.response?.data,
        message: error.message,
      });

      // Fallback: Try query parameter approach: /events?status=:status
      try {
        console.log(`Trying fallback with query parameter...`);
        const fallbackUrl = `/events?status=${status}`;
        console.log("Calling fallback API endpoint:", fallbackUrl);
        const response = await api.get(fallbackUrl);
        console.log(
          `getEventsByStatus fallback(${status}) response:`,
          response.data
        );

        let events = [];
        if (response.data.events && Array.isArray(response.data.events)) {
          events = response.data.events;
        } else if (Array.isArray(response.data)) {
          events = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          events = response.data.data;
        }
        return events;
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError.message);
        console.warn(`Backend status filter failed for ${status}`);
        return [];
      }
    }
  },

  getApprovedEvents: async () => {
    try {
      const events = await eventService.getEventsByStatus("approved");
      // Normalize categories from backend to match filter options
      return events.map((event) => {
        const category = event.category?.toLowerCase() || "";
        let normalizedCategory = event.category;

        // Map backend category values to filter categories
        if (
          category.includes("music") ||
          category.includes("concert") ||
          category.includes("melodie")
        ) {
          normalizedCategory = "Music";
        } else if (
          category.includes("conference") ||
          category.includes("tech") ||
          category.includes("seminar")
        ) {
          normalizedCategory = "Conference";
        } else if (
          category.includes("theater") ||
          category.includes("comedy") ||
          category.includes("drama") ||
          category.includes("play")
        ) {
          normalizedCategory = "Theater";
        }

        return { ...event, category: normalizedCategory };
      });
    } catch (error) {
      console.warn("Could not fetch approved events from backend:", error);
      // Return mock data as fallback
      return [
        {
          id: 1,
          name: "Rock Concert 2025",
          category: "Music",
          description: "Amazing rock concert with top artists",
          date: "2025-12-15 at 19:00",
          venue: "Madison Square Garden, New York",
          status: "approved",
        },
        {
          id: 2,
          name: "Tech Conference 2025",
          category: "Conference",
          description: "Annual technology conference",
          date: "2025-11-30 at 09:00",
          venue: "Convention Center, San Francisco",
          status: "approved",
        },
        {
          id: 3,
          name: "Comedy Night Live",
          category: "Theater",
          description: "Laugh out loud with top comedians",
          date: "2025-12-20 at 20:00",
          venue: "Apollo Theater, New York",
          status: "approved",
        },
      ];
    }
  },

  getPendingEvents: async () => {
    return eventService.getEventsByStatus("pending");
  },
};
