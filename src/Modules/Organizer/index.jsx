// src/components/OrganizerDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EventFormFlow from "./EventFormFlow";
import { eventService } from "../../services/eventService";

const SAMPLE_LAYOUT_PATH = "/mnt/data/4da570a2-7c22-4488-b7e8-d0d4ab6a95f1.jsx";
const LOGO = "/mnt/data/7e8df040-5ffc-4388-9610-d70629c87a79.jpg";

const fmt = (n) => (typeof n === "number" ? `$ ${n.toFixed(2)}` : n);

// === Demo API (stub) ===
const api = {
  fetchEvents: async () => [
    {
      id: "e1",
      title: "Arijit Live Concert",
      description: "A big concert.",
      date: "2025-01-25",
      time: "19:30",
      ticketsSold: 3200,
      capacity: 5000,
      totalPrice: 320000,
      layout: null,
      prices: { vip: 500, normal: 200, balcony: 150 },
    },
  ],
  createEvent: async (payload) => ({
    ...payload,
    id: `e_${Math.random().toString(36).slice(2, 8)}`,
  }),
  updateEvent: async (id, p) => ({ ...p, id }),
  deleteEvent: async (id) => true,
};
export function OrganizerDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("loggedInUser");
    window.dispatchEvent(new Event("userLoggedOut"));
    setTimeout(() => navigate("/"), 100);
  };

  useEffect(() => {
    let m = true;
    (async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const res = await fetch(
          "http://localhost:5000/api/events/organizer/events",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }

        const data = await res.json();

        if (m) {
          const events = data.events || data.data || [];
          const mapped = events.map((ev) => ({
            ...ev,
            title: ev.name || ev.title,
            rawDate: ev.date, // Keep original for formatting
            date: ev.date ? new Date(ev.date).toLocaleDateString() : "-",
            time: ev.date
              ? new Date(ev.date).toLocaleTimeString()
              : ev.time || "-",
            ticketsSold: ev.ticketsSold || 0,
            revenue: ev.revenue || 0,
          }));
          setEvents(mapped);
        }
      } catch (error) {
        console.error("Error loading organizer events:", error);
        if (m) {
          setEvents([]);
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => (m = false);
  }, []);

  // Listen for booking events to update ticket sold and revenue
  useEffect(() => {
    const handleBookingCreated = (event) => {
      const booking = event.detail;
      console.log("📌 Booking created event received:", booking);

      // Update events with new ticket sold and revenue
      setEvents((prevEvents) =>
        prevEvents.map((ev) => {
          if (ev.id === booking.eventId) {
            const ticketsSold =
              (ev.ticketsSold || 0) + (booking.numberOfSeats || 0);
            const revenue = (ev.revenue || 0) + (booking.totalAmount || 0);
            return {
              ...ev,
              ticketsSold,
              revenue,
            };
          }
          return ev;
        })
      );
    };

    window.addEventListener("bookingCreated", handleBookingCreated);
    return () =>
      window.removeEventListener("bookingCreated", handleBookingCreated);
  }, []);

  const saveEvent = async (payload, editingId = null) => {
    // Prevent duplicate submissions
    if (isSubmitting) {
      console.warn("⚠️ Submission already in progress, ignoring duplicate submit");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Get user from localStorage
      const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");

      // Map frontend field names to backend field names
      const prepared = {
        name: String(payload.title || "Untitled").trim(),
        description: String(payload.description || "").trim(),
        date: payload.date ? new Date(payload.date).toISOString() : null,
        venue: String(payload.venue || "").trim(),
        category: String(payload.category || "").trim(),
        image: payload.image || null,
        // DO NOT send organizerId - backend gets it from authenticated user via req.user.id
        // DO NOT send organizerName - backend handles this from User model
        // DO NOT send status - backend sets this on creation
      };

      console.log("Event data to send:", JSON.stringify(prepared, null, 2));
      console.log("Token available:", !!localStorage.getItem("token"));
      console.log("User from localStorage:", user);

      if (editingId) {
        const updated = await eventService.updateEvent(editingId, prepared);
        console.log("✅ Updated event from backend:", updated);
        setEvents((s) =>
          s.map((e) =>
            e.id === editingId
              ? {
                  ...updated,
                  title: updated.name,
                  category: updated.category,
                  date: updated.date
                    ? new Date(updated.date).toLocaleDateString()
                    : "-",
                  time: updated.date
                    ? new Date(updated.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : updated.time || "-",
                  ticketsSold: updated.ticketsSold,
                  revenue: updated.revenue,
                }
              : e
          )
        );
        setEditing(null);
        setToast("✅ Event updated");
        // Dispatch event update to notify listeners (Admin Dashboard)
        window.dispatchEvent(
          new CustomEvent("eventUpdated", { detail: updated })
        );
      } else {
        const created = await eventService.createEvent(prepared);
        console.log("✅ Created event from backend:", created);
        console.log("📌 Category in response:", created.category);
        setEvents((s) => [
          {
            ...created,
            title: created.name,
            category: created.category,
            date: created.date
              ? new Date(created.date).toLocaleDateString()
              : "-",
            time: created.date
              ? new Date(created.date).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : created.time || "-",
            ticketsSold: created.ticketsSold,
            revenue: created.revenue,
          },
          ...s,
        ]);
        setShowCreate(false);
        setToast("✅ Event created (pending admin approval)");
        // Dispatch event creation to notify listeners (Admin Dashboard)
        window.dispatchEvent(
          new CustomEvent("eventCreated", { detail: created })
        );
      }
      setTimeout(() => setToast(""), 2400);
    } catch (error) {
      console.error("Error saving event:", error);
      let errorMessage = "Unknown error";
      if (error?.error) {
        errorMessage = error.error;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error?.data?.error) {
        errorMessage = error.data.error;
      }
      setToast("❌ Error saving event: " + errorMessage);
      setTimeout(() => setToast(""), 2400);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this event?")) return;
    try {
      await eventService.deleteEvent(id);
      setEvents((s) => s.filter((e) => e.id !== id));
      setToast("✅ Event deleted");
      setTimeout(() => setToast(""), 2000);
      // Dispatch event deletion to notify listeners (Admin Dashboard)
      window.dispatchEvent(new CustomEvent("eventDeleted", { detail: { id } }));
    } catch (error) {
      console.error("Error deleting event:", error);
      setToast("❌ Error deleting event");
      setTimeout(() => setToast(""), 2000);
    }
  };

  // sales per section from layout.seats where taken === true
  const salesBySection = (ev) => {
    if (!ev.layout || !Array.isArray(ev.layout.seats))
      return { vip: 0, normal: 0, balcony: 0 };
    const c = { vip: 0, normal: 0, balcony: 0 };
    ev.layout.seats.forEach((s) => {
      if (s.taken) c[s.type || "normal"] = (c[s.type || "normal"] || 0) + 1;
    });
    return c;
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* Top Tagline Section */}
      <div className="w-full bg-white border-b border-gray-200 px-8 py-5">
        <p className="text-2xl md:text-base font-semibold text-gray-800 text-center leading-relaxed">
          Plan. Organize. Execute with Perfection.
        </p>
      </div>

      {/* Main Content Area - Two columns */}
      <div className="flex flex-col md:flex-row flex-1">
        {/* Sidebar - Hidden on mobile, toggle with button */}
        <aside
          className={`fixed md:static top-20 left-0 w-64 bg-white border-r border-gray-200 flex flex-col z-40 transform transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <div className="px-6 py-6 flex items-center gap-3 border-b border-gray-100">
            <img
              src="./Images/logo.png"
              alt="logo"
              className="w-10 h-10 object-cover rounded"
            />
            <div>
              <div className="text-lg font-bold text-red-600">EventPro</div>
              <div className="text-xs text-gray-500">Organizer</div>
            </div>
          </div>

          <div className="px-4 py-3 border-b border-gray-100 text-gray-600 text-xs font-medium">
            Welcome, Organizer
          </div>

          <nav className="px-3 py-6 space-y-2 flex-1">
            {["Dashboard", "My Events"].map((l) => (
              <button
                key={l}
                onClick={() => {
                  if (l === "My Events") {
                    // Scroll to "Your Events" section with a small delay
                    setTimeout(() => {
                      const eventsSection = document.getElementById(
                        "your-events-heading"
                      );
                      if (eventsSection) {
                        eventsSection.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                        // Alternative: scroll the main container
                        const mainElement = document.querySelector("main");
                        if (mainElement) {
                          const offset =
                            eventsSection.offsetTop - mainElement.offsetTop;
                          mainElement.scrollTo({
                            top: offset,
                            behavior: "smooth",
                          });
                        }
                      } else {
                        console.warn(
                          "Could not find element with id: your-events-heading"
                        );
                      }
                    }, 100);
                    setSidebarOpen(false);
                  }
                }}
                className={`w-full text-left px-4 py-3 rounded-md border border-transparent hover:bg-gray-100 transition ${
                  l === "Dashboard"
                    ? "bg-gray-100 text-red-600"
                    : "bg-white text-gray-700"
                }`}
              >
                {l}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 rounded-md border border-transparent hover:bg-red-100 transition bg-white text-red-600 font-semibold"
            >
              Logout
            </button>
          </nav>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 md:hidden z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Dashboard Content */}
        <main className="flex-1 w-full p-6 md:p-12 overflow-y-auto">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden mb-4 p-2 bg-red-600 text-white rounded"
          >
            ☰ Menu
          </button>

          <header className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
            </div>

            <div>
              <button
                onClick={() => setShowCreate(true)}
                className="px-3 md:px-4 py-2 bg-red-600 text-white rounded shadow text-sm md:text-base whitespace-nowrap"
              >
                + Create New Event
              </button>
            </div>
          </header>

          <section className="flex flex-col sm:flex-row gap-4 mb-8">
            <StatCard title="Total Events" value={events.length} />
            <StatCard
              title="Tickets Sold"
              value={events.reduce((a, b) => a + (b.ticketsSold || 0), 0)}
            />
            <StatCard
              title="Total Revenue"
              value={fmt(events.reduce((a, b) => a + (b.revenue || 0), 0))}
            />
          </section>

          <section>
            <h2
              id="your-events-heading"
              className="text-lg md:text-xl font-semibold mb-4"
            >
              Your Events
            </h2>
            <div className="bg-white rounded overflow-x-auto border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-gray-600 text-xs md:text-sm">
                      Event Name
                    </th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-gray-600 text-xs md:text-sm">
                      Date
                    </th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-gray-600 text-xs md:text-sm">
                      Time
                    </th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-gray-600 text-xs md:text-sm">
                      Revenue
                    </th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-gray-600 text-xs md:text-sm">
                      Status
                    </th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-gray-600 text-xs md:text-sm">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : events.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-gray-500">
                        No events yet
                      </td>
                    </tr>
                  ) : (
                    events.map((ev) => {
                      const bySection = salesBySection(ev);
                      return (
                        <tr key={ev.id} className="border-t hover:bg-gray-50">
                          <td className="px-3 md:px-6 py-3 md:py-4 font-medium text-xs md:text-sm">
                            {ev.title}
                          </td>
                          <td className="px-3 md:px-6 py-3 md:py-4 text-gray-600 text-xs md:text-sm">
                            {ev.date}
                          </td>
                          <td className="px-3 md:px-6 py-3 md:py-4 text-gray-600 text-xs md:text-sm">
                            {ev.time}
                          </td>
                          <td className="px-3 md:px-6 py-3 md:py-4 text-gray-700 text-xs md:text-sm">
                            {fmt(ev.revenue || 0)}
                          </td>
                          <td className="px-3 md:px-6 py-3 md:py-4">
                            <span
                              className={`px-2 py-1 rounded text-xs inline-block ${
                                ev.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : ev.status === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {ev.status === "approved"
                                ? "✓ Approved"
                                : ev.status === "rejected"
                                ? "✗ Rejected"
                                : "⏳ Pending"}
                            </span>
                          </td>
                          <td className="px-3 md:px-6 py-3 md:py-4">
                            <div className="flex gap-1 flex-col sm:flex-row">
                              <button
                                onClick={() => setSelected(ev)}
                                className="px-2 py-1 border rounded text-xs"
                              >
                                View
                              </button>
                              <button
                                onClick={() => setEditing(ev)}
                                className="px-2 py-1 border rounded text-xs"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(ev.id)}
                                className="px-2 py-1 border rounded text-xs text-red-600"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Create */}
          {showCreate && (
            <Modal onClose={() => setShowCreate(false)}>
              <EventFormFlow
                key="create-event"
                onCancel={() => setShowCreate(false)}
                onSave={(p) => saveEvent(p)}
              />
            </Modal>
          )}

          {/* Edit */}
          {editing && (
            <Modal onClose={() => setEditing(null)}>
              <EventFormFlow
                ev={editing}
                onCancel={() => setEditing(null)}
                onSave={(p) => saveEvent(p, editing.id)}
              />
            </Modal>
          )}

          {/* View */}
          {selected && (
            <Modal onClose={() => setSelected(null)}>
              <div>
                <h3 className="text-xl font-semibold mb-2">{selected.title}</h3>
                <p className="text-sm text-gray-600 mb-1">
                  {selected.description}
                </p>
                <p className="text-sm text-gray-600">
                  Date: {selected.date} • Time: {selected.time}
                </p>
                <p className="text-sm text-gray-600">
                  Capacity: {selected.capacity}
                </p>
                <p className="text-sm text-gray-600">
                  Total revenue: {fmt(selected.revenue)}
                </p>

                <div className="mt-4">
                  <h4 className="font-medium">Sales by section</h4>
                  <SectionSales ev={selected} />
                </div>

                {selected.layout && (
                  <div className="mt-4">
                    <h4 className="font-medium">Layout preview</h4>
                    <div className="mt-2 overflow-auto">
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: `repeat(${
                            selected.layout.cols || 10
                          }, 34px)`,
                          gap: 6,
                        }}
                      >
                        {(selected.layout.seats || []).map((s) => (
                          <div
                            key={s.id}
                            className={`h-8 w-8 rounded flex items-center justify-center text-xs border ${
                              s.type === "vip"
                                ? "bg-yellow-300"
                                : s.type === "balcony"
                                ? "bg-purple-200"
                                : "bg-white"
                            }`}
                          >
                            {s.taken ? "X" : s.row + "-" + s.col}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 text-right">
                  <button
                    onClick={() => setSelected(null)}
                    className="px-3 py-1 border rounded"
                  >
                    Close
                  </button>
                </div>
              </div>
            </Modal>
          )}

          {toast && (
            <div className="fixed bottom-6 right-6 bg-gray-800 text-white px-4 py-2 rounded">
              {toast}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ===== Helper components below =====

function StatCard({ title, value }) {
  return (
    <div className="bg-white border border-gray-200 rounded p-6 md:p-8 flex-1 min-w-0">
      <div className="text-xl md:text-2xl font-bold text-red-600">{value}</div>
      <div className="text-xs md:text-sm text-gray-500 mt-1">{title}</div>
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded shadow-lg max-w-md w-full p-3 max-h-[90vh] overflow-y-auto border-t-4 border-red-600">
        <div className="flex justify-end mb-2">
          <button
            onClick={onClose}
            className="px-2 py-1 text-lg text-gray-500 hover:text-red-600 transition"
          >
            ✕
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

function SectionSales({ ev }) {
  const bySection = { vip: 0, normal: 0, balcony: 0 };
  if (ev.layout && Array.isArray(ev.layout.seats)) {
    ev.layout.seats.forEach((s) => {
      if (s.taken)
        bySection[s.type || "normal"] =
          (bySection[s.type || "normal"] || 0) + 1;
    });
  }
  const prices = ev.prices || { vip: 0, normal: 0, balcony: 0 };
  return (
    <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
      {["vip", "normal", "balcony"].map((k) => (
        <div key={k} className="p-3 border rounded">
          <div className="text-xs md:text-sm text-gray-600 uppercase">{k}</div>
          <div className="text-xl md:text-2xl font-bold">
            {bySection[k] || 0}
          </div>
          <div className="text-xs md:text-sm text-gray-500">
            Revenue: {fmt((bySection[k] || 0) * (prices[k] || 0))}
          </div>
        </div>
      ))}
    </div>
  );
}
