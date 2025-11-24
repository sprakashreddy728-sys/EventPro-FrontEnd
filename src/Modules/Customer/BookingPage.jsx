import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { seatService } from "../../services/seatService";

export default function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const eventFromState = location.state?.event;

  // Default event data if none passed from Events page
  const defaultEvent = {
    id: 1,
    title: "Summer Music Festival",
    date: "July 20, 2024",
    location: "Event Venue",
  };

  const currentEvent = eventFromState || defaultEvent;

  // Define rows and columns
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [lockedSeats, setLockedSeats] = useState({});
  const [realtimeStatus, setRealtimeStatus] = useState({});
  const [bookedSeats, setBookedSeats] = useState(new Set());
  const LOCK_TIMEOUT = 15 * 60 * 1000;
  const POLLING_INTERVAL = 5 * 1000; // Poll every 5 seconds for real-time updates

  // Debug: Log whenever bookedSeats changes
  useEffect(() => {
    if (bookedSeats.size > 0) {
      console.log("[DEBUG] BookedSeats updated. Count:", bookedSeats.size);
      console.log("[DEBUG] Booked seat IDs:", Array.from(bookedSeats));
    }
  }, [bookedSeats]);

  // Fetch booked seats from backend on component mount and when event changes
  useEffect(() => {
    const fetchBookedSeats = async () => {
      try {
        if (currentEvent?.id) {
          console.log(
            "[BookingPage] Fetching booked seats for event ID:",
            currentEvent.id
          );
          const booked = await seatService.getBookedSeats(currentEvent.id);
          console.log("[BookingPage] Booked seats response:", booked);
          console.log("[BookingPage] Booked seats count:", booked?.length || 0);
          if (booked && booked.length > 0) {
            console.log("[BookingPage] Setting bookedSeats to:", booked);
          }

          // Also check localStorage for booked seats (from CheckoutPage)
          const bookedSeatsKey = `bookedSeats_${currentEvent.id}`;
          const storedBooked = JSON.parse(
            localStorage.getItem(bookedSeatsKey) || "[]"
          );
          console.log(
            "[BookingPage] Stored booked seats from localStorage:",
            storedBooked
          );

          // Merge backend booked seats with localStorage booked seats
          const mergedBooked = [
            ...new Set([...(booked || []), ...storedBooked]),
          ];
          console.log("[BookingPage] Merged booked seats:", mergedBooked);

          setBookedSeats(new Set(mergedBooked));
        }
      } catch (error) {
        console.warn("[BookingPage] Error fetching booked seats:", error);
        // Fall back to empty set if backend fails
        setBookedSeats(new Set());
      }
    };

    fetchBookedSeats();

    // Listen for seat sold events (from same session)
    const handleSeatsMarked = (event) => {
      console.log(
        "[BookingPage] Seats marked as sold event received:",
        event.detail
      );
      setBookedSeats((prev) => new Set([...prev, ...event.detail.seatIds]));
    };

    // Listen for storage changes from other tabs
    const handleStorageChange = (e) => {
      const bookedSeatsKey = `bookedSeats_${currentEvent.id}`;
      if (e.key === bookedSeatsKey) {
        console.log(
          "[BookingPage] Storage changed in another tab for booked seats"
        );
        const storedBooked = JSON.parse(e.newValue || "[]");
        console.log(
          "[BookingPage] Updated booked seats from storage:",
          storedBooked
        );
        setBookedSeats(new Set(storedBooked));
      }
    };

    window.addEventListener("seatsMarkedSold", handleSeatsMarked);
    window.addEventListener("storage", handleStorageChange);

    // Set up polling to fetch booked seats periodically for real-time updates from other users
    const pollInterval = setInterval(() => {
      console.log("[BookingPage] Polling for booked seats...");
      fetchBookedSeats();
    }, POLLING_INTERVAL);

    return () => {
      window.removeEventListener("seatsMarkedSold", handleSeatsMarked);
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(pollInterval);
    };
  }, [currentEvent?.id]);

  // Get seat category based on row letter
  const getSeatCategory = (seatId) => {
    const row = seatId[0];
    if (["A", "B"].includes(row)) return "vip";
    if (["C", "D", "E", "F", "G", "H"].includes(row)) return "normal";
    return "balcony";
  };

  // Get seat price based on category
  const getSeatPrice = (category) => {
    const prices = {
      vip: 150,
      normal: 100,
      balcony: 50,
    };
    return prices[category] || 100;
  };

  // Simulate real-time seat updates (Redis stream updates)
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate random users locking/unlocking seats
      setRealtimeStatus((prev) => {
        const updated = { ...prev };
        const randomRow = rows[Math.floor(Math.random() * rows.length)];
        const randomCol = Math.floor(Math.random() * 10) + 1;
        const randomSeat = `${randomRow}${randomCol}`;

        // Don't simulate locks for already booked or selected seats
        if (
          !bookedSeats.has(randomSeat) &&
          !selectedSeats.includes(randomSeat)
        ) {
          if (Math.random() > 0.5) {
            updated[randomSeat] = { locked: true, user: "Another user" };
          } else {
            delete updated[randomSeat];
          }
        }
        return updated;
      });
    }, 4000); // Update every 4 seconds

    return () => clearInterval(interval);
  }, [selectedSeats, bookedSeats, rows]);

  // Clean up expired locks (Redis TTL simulation)
  useEffect(() => {
    const interval = setInterval(() => {
      setLockedSeats((prev) => {
        const updated = { ...prev };
        const now = Date.now();
        Object.keys(updated).forEach((seatId) => {
          if (now - updated[seatId] > LOCK_TIMEOUT) {
            delete updated[seatId];
          }
        });
        return updated;
      });
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, []);

  const toggleSeat = (seatId) => {
    const category = getSeatCategory(seatId);

    if (bookedSeats.has(seatId)) return;
    if (realtimeStatus[seatId]?.locked) return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats((prev) => prev.filter((s) => s !== seatId));
      setLockedSeats((prev) => {
        const updated = { ...prev };
        delete updated[seatId];
        return updated;
      });
    } else {
      setSelectedSeats((prev) => [...prev, seatId]);
      // Lock seat in Redis (TTL 15 minutes)
      setLockedSeats((prev) => ({
        ...prev,
        [seatId]: Date.now(),
      }));
    }
  };

  const getSeatStatus = (seatId) => {
    if (bookedSeats.has(seatId)) return "booked";
    if (realtimeStatus[seatId]?.locked) return "locked"; // Real-time locked by others
    if (selectedSeats.includes(seatId)) return "selected";
    if (lockedSeats[seatId]) return "own-locked"; // Your own lock
    return "available";
  };

  const getSeatColor = (status, isBooked) => {
    // Always prioritize booked status - show red
    if (isBooked || status === "booked") {
      return "bg-red-500 cursor-not-allowed";
    }
    switch (status) {
      case "available":
        return "bg-gray-400 hover:bg-gray-500";
      case "selected":
        return "bg-blue-600";
      case "own-locked":
        return "bg-blue-500 hover:bg-blue-600";
      case "locked":
        return "bg-yellow-500 cursor-not-allowed";
      default:
        return "bg-gray-400";
    }
  };

  // Calculate total price based on seat categories
  const calculateTotal = () => {
    return selectedSeats.reduce((total, seatId) => {
      const category = getSeatCategory(seatId);
      return total + getSeatPrice(category);
    }, 0);
  };

  const totalPrice = calculateTotal();
  const bookingFee = selectedSeats.length > 0 ? 15 : 0;

  return (
    <div className="min-h-screen bg-white pt-20 px-4 md:px-6 pb-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/#events")}
          className="text-red-600 hover:text-red-700 font-semibold mb-6 flex items-center gap-2"
        >
          ← Back to Events
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Select Your Seats
          </h1>
          <p className="text-lg text-gray-600">
            <strong>
              {currentEvent.name || currentEvent.title || "Event Name"}
            </strong>{" "}
            • {currentEvent.date}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            📍 Location:{" "}
            <strong>
              {currentEvent.location ||
                currentEvent.venue ||
                "Location Not Specified"}
            </strong>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            {/* Legend */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-400 rounded"></div>
                <span className="font-semibold text-sm">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-600 rounded"></div>
                <span className="font-semibold text-sm">Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-yellow-500 rounded"></div>
                <span className="font-semibold text-sm">Locked (Others)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-red-500 rounded"></div>
                <span className="font-semibold text-sm">Sold Out</span>
              </div>
            </div>{" "}
            {/* Seat Categories Info */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
                <h4 className="font-bold text-purple-900 mb-2">
                  VIP Seats (Rows A-B)
                </h4>
                <p className="text-2xl font-bold text-purple-600">$150</p>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg border-2 border-amber-200">
                <h4 className="font-bold text-amber-900 mb-2">
                  Middle Seats (Rows C-H)
                </h4>
                <p className="text-2xl font-bold text-amber-600">$100</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                <h4 className="font-bold text-blue-900 mb-2">
                  Standard Seats (Rows I-J)
                </h4>
                <p className="text-2xl font-bold text-blue-600">$50</p>
              </div>
            </div>
            <div className="text-center mb-8">
              <div className="bg-gray-800 text-white py-3 rounded-lg font-bold inline-block">
                STAGE
              </div>
            </div>
            {/* Real-time Status Indicator */}
            <div className="mb-4 flex items-center justify-center gap-2 text-sm font-semibold">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700">Real-time seat availability</span>
              {bookedSeats.size > 0 && (
                <span className="ml-4 text-red-600 font-bold">
                  ({bookedSeats.size} seats sold)
                </span>
              )}
            </div>
            <div className="mb-8 bg-gray-50 p-6 rounded-lg overflow-x-auto">
              {/* VIP Section */}
              <div className="mb-8">
                <div className="bg-purple-600 text-white font-bold py-2 px-4 rounded mb-4 text-center">
                  VIP SECTION - $150/Seat
                </div>
                <div className="space-y-2">
                  {["A", "B"].map((row) => (
                    <div key={row} className="flex gap-2 items-center">
                      <span className="w-12 font-bold text-gray-700 text-center text-sm">
                        {row}
                      </span>
                      <div className="flex gap-2">
                        {cols.map((col) => {
                          const seatId = `${row}${col}`;
                          const status = getSeatStatus(seatId);
                          const isBooked = bookedSeats.has(seatId);
                          const category = getSeatCategory(seatId);

                          return (
                            <button
                              key={seatId}
                              onClick={() => !isBooked && toggleSeat(seatId)}
                              disabled={
                                isBooked || realtimeStatus[seatId]?.locked
                              }
                              title={
                                isBooked
                                  ? `${seatId} - SOLD OUT`
                                  : `${seatId} - ${category} ($${getSeatPrice(
                                      category
                                    )})`
                              }
                              className={`w-8 h-8 rounded text-xs font-bold text-white transition ${getSeatColor(
                                status,
                                isBooked
                              )}`}
                            ></button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Middle Section */}
              <div className="mb-8">
                <div className="bg-amber-600 text-white font-bold py-2 px-4 rounded mb-4 text-center">
                  MIDDLE SECTION - $100/Seat
                </div>
                <div className="space-y-2">
                  {["C", "D", "E", "F", "G", "H"].map((row) => (
                    <div key={row} className="flex gap-2 items-center">
                      <span className="w-12 font-bold text-gray-700 text-center text-sm">
                        {row}
                      </span>
                      <div className="flex gap-2">
                        {cols.map((col) => {
                          const seatId = `${row}${col}`;
                          const status = getSeatStatus(seatId);
                          const isBooked = bookedSeats.has(seatId);
                          const category = getSeatCategory(seatId);

                          return (
                            <button
                              key={seatId}
                              onClick={() => !isBooked && toggleSeat(seatId)}
                              disabled={
                                isBooked || realtimeStatus[seatId]?.locked
                              }
                              title={
                                isBooked
                                  ? `${seatId} - SOLD OUT`
                                  : `${seatId} - ${category} ($${getSeatPrice(
                                      category
                                    )})`
                              }
                              className={`w-8 h-8 rounded text-xs font-bold text-white transition ${getSeatColor(
                                status,
                                isBooked
                              )}`}
                            ></button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Standard Section */}
              <div>
                <div className="bg-blue-600 text-white font-bold py-2 px-4 rounded mb-4 text-center">
                  STANDARD SECTION - $50/Seat
                </div>
                <div className="space-y-2">
                  {["I", "J"].map((row) => (
                    <div key={row} className="flex gap-2 items-center">
                      <span className="w-12 font-bold text-gray-700 text-center text-sm">
                        {row}
                      </span>
                      <div className="flex gap-2">
                        {cols.map((col) => {
                          const seatId = `${row}${col}`;
                          const status = getSeatStatus(seatId);
                          const isBooked = bookedSeats.has(seatId);
                          const category = getSeatCategory(seatId);

                          return (
                            <button
                              key={seatId}
                              onClick={() => !isBooked && toggleSeat(seatId)}
                              disabled={
                                isBooked || realtimeStatus[seatId]?.locked
                              }
                              title={
                                isBooked
                                  ? `${seatId} - SOLD OUT`
                                  : `${seatId} - ${category} ($${getSeatPrice(
                                      category
                                    )})`
                              }
                              className={`w-8 h-8 rounded text-xs font-bold text-white transition ${getSeatColor(
                                status,
                                isBooked
                              )}`}
                            ></button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {selectedSeats.length > 0 && (
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                <p className="font-semibold text-blue-900 mb-2">
                  Selected Seats ({selectedSeats.length}):{" "}
                  {selectedSeats.sort().join(", ")}
                </p>
                <p className="text-sm text-blue-700">
                  ⏱️ Seats locked for 15 minutes • Changes will be saved in
                  real-time
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-50 border rounded-lg p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Booking Summary
              </h3>

              {/* Event Details */}
              <div className="bg-white border-2 border-red-200 rounded-lg p-4 mb-6">
                <h4 className="font-bold text-gray-900 text-lg mb-3">
                  {currentEvent.name || currentEvent.title || "Event"}
                </h4>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">
                    📅{" "}
                    <span className="font-semibold">{currentEvent.date}</span>
                  </p>
                  <p className="text-gray-600">
                    📍{" "}
                    <span className="font-semibold">
                      {currentEvent.location ||
                        currentEvent.venue ||
                        "Location TBA"}
                    </span>
                  </p>
                </div>
              </div>

              {selectedSeats.length > 0 ? (
                <>
                  {/* Seat Breakdown by Category */}
                  <div className="space-y-2 mb-6 pb-4 border-b">
                    {["VIP", "Middle", "Standard"].map((category) => {
                      const seatsInCategory = selectedSeats.filter(
                        (seat) => getSeatCategory(seat) === category
                      );
                      const count = seatsInCategory.length;
                      if (count === 0) return null;

                      return (
                        <div
                          key={category}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-gray-700">
                            {category} ({count}x${getSeatPrice(category)})
                          </span>
                          <span className="font-semibold">
                            ${count * getSeatPrice(category)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Price Summary */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">${totalPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking Fee</span>
                      <span className="font-semibold">${bookingFee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Platform Charge (2%)
                      </span>
                      <span className="font-semibold">
                        ${((totalPrice + bookingFee) * 0.02).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-4 mb-6">
                    <div className="flex justify-between items-center">
                      <p className="text-lg font-bold">Total</p>
                      <p className="text-3xl font-bold text-red-600">
                        $
                        {(
                          totalPrice +
                          bookingFee +
                          (totalPrice + bookingFee) * 0.02
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Seat Lock Info */}
                  <div className="bg-blue-100 border border-blue-300 rounded p-3 mb-6">
                    <p className="text-xs font-semibold text-blue-900 mb-1">
                      🔒 Seat Lock Status
                    </p>
                    <p className="text-xs text-blue-800">
                      Your seats are locked for <strong>15 minutes</strong>.
                      Complete your payment before the timer expires.
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">
                    Select seats to see pricing
                  </p>
                </div>
              )}

              <button
                onClick={() => {
                  const bookingData = {
                    eventId: currentEvent.id,
                    selectedSeats: selectedSeats,
                    totalPrice: totalPrice,
                    eventName:
                      currentEvent.title || currentEvent.name || "Event",
                    eventDate: currentEvent.date,
                    eventLocation: currentEvent.location || currentEvent.venue,
                  };
                  console.log(
                    "Booking data being sent to checkout:",
                    bookingData
                  );
                  navigate("/checkout", { state: { booking: bookingData } });
                }}
                disabled={selectedSeats.length === 0}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition mb-3"
              >
                Proceed to Payment
              </button>
              <button
                onClick={() => navigate("/#events")}
                className="w-full border-2 border-gray-300 hover:border-gray-400 text-gray-800 font-bold py-3 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}