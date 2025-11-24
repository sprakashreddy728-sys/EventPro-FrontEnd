import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { eventService } from "../../services/eventService";

const AdminEventsManagement = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending"); // pending, approved, rejected, all
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [toast, setToast] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Load events from backend
    const loadEvents = async () => {
      try {
        // Fetch events by status from backend
        const backendEvents = await eventService.getEventsByStatus(filter);
        console.log("Events for filter:", filter, "Events:", backendEvents);
        setEvents(backendEvents || []);
      } catch (error) {
        console.error("Error loading events from backend:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();

    // Listen for real-time event updates from organizer
    const handleEventCreated = (e) => {
      console.log("New event created detected in Admin Dashboard:", e.detail);
      // Only add if it matches current filter
      if (filter === "pending" || filter === "all") {
        setEvents((prev) => {
          // Avoid duplicates
          const exists = prev.some((ev) => ev.id === e.detail.id);
          if (exists) return prev;
          return [e.detail, ...prev];
        });
      }
    };

    const handleEventUpdated = (e) => {
      console.log("Event updated detected in Admin Dashboard:", e.detail);
      setEvents((prev) =>
        prev.map((ev) => (ev.id === e.detail.id ? e.detail : ev))
      );
    };

    const handleEventDeleted = (e) => {
      console.log("Event deleted detected in Admin Dashboard:", e.detail);
      setEvents((prev) => prev.filter((ev) => ev.id !== e.detail.id));
    };

    window.addEventListener("eventCreated", handleEventCreated);
    window.addEventListener("eventUpdated", handleEventUpdated);
    window.addEventListener("eventDeleted", handleEventDeleted);

    return () => {
      window.removeEventListener("eventCreated", handleEventCreated);
      window.removeEventListener("eventUpdated", handleEventUpdated);
      window.removeEventListener("eventDeleted", handleEventDeleted);
    };
  }, [filter]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("loggedInUser");
    localStorage.setItem("justLoggedOut", "true");
    window.dispatchEvent(new Event("userLoggedOut"));
    setTimeout(() => {
      navigate("/", { replace: true });
    }, 100);
  };

  const approveEvent = async (eventId) => {
    try {
      await eventService.approveEvent(eventId);
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, status: "approved" } : e))
      );
      showToast("✅ Event approved successfully!");
    } catch (error) {
      console.error("Error approving event:", error);
      showToast("❌ Failed to approve event");
    }
  };

  const rejectEvent = async (eventId) => {
    try {
      await eventService.rejectEvent(eventId);
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, status: "rejected" } : e))
      );
      showToast("✅ Event rejected!");
    } catch (error) {
      console.error("Error rejecting event:", error);
      showToast("❌ Failed to reject event");
    }
  };

  const deleteEvent = async (eventId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this event? This action cannot be undone."
      )
    ) {
      return;
    }
    try {
      await eventService.deleteEvent(eventId);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      setSelectedEvent(null);
      showToast("✅ Event deleted successfully!");
    } catch (error) {
      console.error("Error deleting event:", error);
      showToast("❌ Failed to delete event");
    }
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2000);
  };

  const filteredEvents =
    filter === "all" ? events : events.filter((e) => e.status === filter);

  const stats = {
    total: events.length,
    pending: events.filter((e) => e.status === "pending").length,
    approved: events.filter((e) => e.status === "approved").length,
    rejected: events.filter((e) => e.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* Header */}
      <div className="w-full bg-white border-b border-gray-200 px-6 py-4 shadow">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Admin - Event Management
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Review and approve/reject submitted events
        </p>
      </div>

      <div className="flex flex-col md:flex-row flex-1">
        {/* Sidebar */}
        <aside
          className={`fixed md:static top-20 left-0 w-64 bg-white border-r border-gray-200 flex flex-col z-40 transform transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <div className="px-6 py-6 flex items-center gap-3 border-b border-gray-100">
            <img
              src="/Images/logo.png"
              alt="EventPro Logo"
              className="w-10 h-10 object-cover rounded"
            />
            <div>
              <div className="text-lg font-bold text-red-600">EventPro</div>
              <div className="text-xs text-gray-500">Admin</div>
            </div>
          </div>

          <nav className="px-3 py-6 space-y-2 flex-1">
            {[
              { label: "Dashboard", value: "all" },
              { label: "Pending Events", value: "pending" },
              { label: "Approved Events", value: "approved" },
              { label: "Rejected Events", value: "rejected" },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => {
                  setFilter(item.value);
                  setSidebarOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-md transition ${
                  filter === item.value
                    ? "bg-red-100 text-red-600 font-semibold"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 rounded-md text-red-600 hover:bg-red-100 font-semibold transition mt-4"
            >
              Logout
            </button>
          </nav>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 md:hidden z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 w-full p-4 md:p-8">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden mb-4 p-2 bg-red-600 text-white rounded"
          >
            ☰ Menu
          </button>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard title="Total Events" value={stats.total} color="blue" />
            <StatCard title="Pending" value={stats.pending} color="yellow" />
            <StatCard title="Approved" value={stats.approved} color="green" />
            <StatCard title="Rejected" value={stats.rejected} color="red" />
          </div>

          {/* Events List */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">
                {filter === "all"
                  ? "All Events"
                  : filter === "pending"
                  ? "Pending Approval"
                  : filter === "approved"
                  ? "Approved Events"
                  : "Rejected Events"}
              </h2>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-6 text-center text-gray-500">Loading...</div>
              ) : filteredEvents.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No events found
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                        Event
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 hidden md:table-cell">
                        Organizer
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 hidden lg:table-cell">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvents.map((event) => (
                      <tr
                        key={event.id}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4">
                          <div className="flex gap-3">
                            {event.image && (
                              <img
                                src={event.image}
                                alt={event.title}
                                className="w-10 h-10 rounded object-cover"
                              />
                            )}
                            <div>
                              <p className="font-semibold text-gray-900">
                                {event.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {event.venue}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">
                          {event.organizer?.name ||
                            event.organizerName ||
                            "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">
                          {event.date}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium inline-block ${
                              event.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : event.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {event.status === "approved"
                              ? "✓ Approved"
                              : event.status === "rejected"
                              ? "✗ Rejected"
                              : "⏳ Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() => setSelectedEvent(event)}
                              className="px-3 py-1 bg-blue-100 text-blue-600 rounded text-xs hover:bg-blue-200 transition"
                            >
                              View
                            </button>
                            {event.status === "pending" && (
                              <>
                                <button
                                  onClick={() => approveEvent(event.id)}
                                  className="px-3 py-1 bg-green-100 text-green-600 rounded text-xs hover:bg-green-200 transition"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => rejectEvent(event.id)}
                                  className="px-3 py-1 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200 transition"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {event.status !== "pending" && (
                              <button
                                onClick={() => deleteEvent(event.id)}
                                className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-xs hover:bg-gray-200 transition"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Modal for viewing event details */}
          {selectedEvent && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {selectedEvent.title}
                    </h3>
                    <button
                      onClick={() => setSelectedEvent(null)}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      ✕
                    </button>
                  </div>

                  {selectedEvent.image && (
                    <img
                      src={selectedEvent.image}
                      alt={selectedEvent.title}
                      className="w-full h-64 object-cover rounded-lg mb-4"
                    />
                  )}

                  <div className="space-y-3 mb-6">
                    <div>
                      <p className="text-sm text-gray-500">Organizer</p>
                      <p className="font-semibold">
                        {selectedEvent.organizer?.name ||
                          selectedEvent.organizerName ||
                          "N/A"}
                      </p>
                      {selectedEvent.organizer?.email && (
                        <p className="text-xs text-gray-500">
                          {selectedEvent.organizer.email}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="text-gray-700">
                        {selectedEvent.description}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm text-gray-500">Date & Time</p>
                        <p className="font-semibold">
                          {selectedEvent.date} at {selectedEvent.time}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Venue</p>
                        <p className="font-semibold">{selectedEvent.venue}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Capacity</p>
                        <p className="font-semibold">
                          {selectedEvent.capacity} seats
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium inline-block ${
                            selectedEvent.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : selectedEvent.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {selectedEvent.status === "approved"
                            ? "✓ Approved"
                            : selectedEvent.status === "rejected"
                            ? "✗ Rejected"
                            : "⏳ Pending"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-6 border-t flex-wrap">
                    {selectedEvent.status === "pending" && (
                      <>
                        <button
                          onClick={() => {
                            approveEvent(selectedEvent.id);
                            setSelectedEvent(null);
                          }}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 transition"
                        >
                          ✓ Approve Event
                        </button>
                        <button
                          onClick={() => {
                            rejectEvent(selectedEvent.id);
                            setSelectedEvent(null);
                          }}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded font-semibold hover:bg-red-700 transition"
                        >
                          ✗ Reject Event
                        </button>
                      </>
                    )}
                    {selectedEvent.status !== "pending" && (
                      <button
                        onClick={() => {
                          deleteEvent(selectedEvent.id);
                        }}
                        className="flex-1 px-4 py-2 bg-gray-600 text-white rounded font-semibold hover:bg-gray-700 transition"
                      >
                        🗑️ Remove Event
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="w-full mt-3 px-4 py-2 border border-gray-300 rounded font-semibold hover:bg-gray-50 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Toast */}
          {toast && (
            <div className="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg">
              {toast}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

function StatCard({ title, value, color }) {
  const colorClass = {
    blue: "text-blue-600",
    yellow: "text-yellow-600",
    green: "text-green-600",
    red: "text-red-600",
  }[color];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-3xl font-bold ${colorClass} mt-2`}>{value}</p>
    </div>
  );
}

export default AdminEventsManagement;