import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { eventService } from "../../services/eventService";
import AuthModal from "../../Components/AuthModal";

export default function Events() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Events");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = ["All Events", "Music", "Conference", "Theater"];

  // Fetch approved events from backend
  useEffect(() => {
    const loadApprovedEvents = async () => {
      try {
        setLoading(true);
        // Fetch approved events from backend
        const events = await eventService.getApprovedEvents();
        console.log("Approved events fetched:", events);
        console.log("📌 Categories in events:", events.map(e => ({ id: e.id, title: e.name || e.title, category: e.category })));
        setAllEvents(Array.isArray(events) ? events : []);
      } catch (error) {
        console.error("Error loading approved events:", error);
        // eventService.getApprovedEvents already returns mock data on error
        setAllEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadApprovedEvents();
  }, []);

  const filteredEvents = allEvents.filter((event) => {
    // Backend should only return approved events, but double-check
    const isApproved = event.status === "approved" || !event.status;
    const matchesCategory =
      selectedCategory === "All Events" || event.category === selectedCategory;
    const matchesSearch =
      (event.name || event.title || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (event.category || "").toLowerCase().includes(searchQuery.toLowerCase());
    return isApproved && matchesCategory && matchesSearch;
  });

  const handleBookNow = (event) => {
    // Check if user is logged in
    const user = authService.getUser();
    console.log("Book Now clicked. User:", user);
    if (!user) {
      // Show auth modal if not logged in
      console.log("No user found, showing auth modal");
      setShowAuthModal(true);
    } else {
      // Navigate to booking with event data if logged in
      console.log("User found, navigating to booking");
      navigate("/booking", { state: { event } });
    }
  };

  return (
    <section id="events" className="bg-white py-20 px-4 md:px-8">
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        modalClassName="max-w-xs p-2"
      />
      <div className="max-w-screen-xl mx-auto">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Browse Events
          </h2>
          <p className="text-lg text-gray-600">
            Celebrate life with amazing events around you.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-base md:text-lg placeholder-gray-400 shadow-sm"
          />
        </div>

        {/* Category Buttons */}
        <div className="mb-12 flex flex-wrap gap-3 justify-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2.5 rounded-full font-semibold transition duration-300 ${
                selectedCategory === category
                  ? "bg-gray-900 text-white shadow-lg"
                  : "bg-gray-100 text-gray-900 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full text-center py-16">
              <p className="text-gray-600 text-lg font-medium">
                Loading events...
              </p>
            </div>
          ) : filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100"
              >
                {/* Event Image Placeholder */}
                <div className="w-full h-56 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-7xl overflow-hidden">
                  {event.image && event.image.startsWith("http") ? (
                    <img
                      src={event.image}
                      alt={event.name || event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : event.image ? (
                    <img
                      src={event.image}
                      alt={event.name || event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src="/Images/image1.jpg"
                      alt="Default event"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Event Content */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3 gap-3">
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">
                      {event.name || event.title}
                    </h3>
                    <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded-full whitespace-nowrap">
                      {event.category || "Event"}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                    {event.description}
                  </p>

                  {/* Event Details */}
                  <div className="space-y-3 text-sm text-gray-600 mb-6 border-t border-gray-100 pt-4">
                    <p className="flex items-center gap-2">
                      <span>📅</span>
                      <span>
                        {event.date
                          ? event.date.length >= 16
                            ? `${event.date.slice(0, 10)} ${event.date.slice(
                                11,
                                16
                              )}`
                            : event.date
                          : "-"}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span>📍</span>
                      <span>{event.venue || event.location}</span>
                    </p>
                  </div>

                  {/* Book Button */}
                  <button
                    onClick={() => handleBookNow(event)}
                    className="w-full bg-gray-900 hover:bg-red-500 text-white font-bold py-3 rounded-lg transition duration-300 shadow-sm hover:shadow-md"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <p className="text-gray-600 text-lg font-medium">
                No events found matching your search.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
