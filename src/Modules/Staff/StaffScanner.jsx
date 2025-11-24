import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Check,
  AlertCircle,
  LogOut,
  Zap,
  QrCode,
  Menu,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "../../Components/Logo";
import { checkInService } from "../../services/checkInService";
import { authService } from "../../services/authService";

const StaffScanner = () => {
  const navigate = useNavigate();
  const [scannedTickets, setScannedTickets] = useState([]);
  const [scanInput, setScanInput] = useState("");
  const [scanMessage, setScanMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success', 'error', 'warning'
  const [stats, setStats] = useState({ total: 0, checkedIn: 0, pending: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isScanning, setIsScanning] = useState(false);
  const [countAnimated, setCountAnimated] = useState(false);
  const [checkedInAttendees, setCheckedInAttendees] = useState([]);
  const [currentEventId, setCurrentEventId] = useState(null);
  const [isLoadingCheckIns, setIsLoadingCheckIns] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const scanInputRef = useRef(null);
  const messageTimeoutRef = useRef(null);

  // Get auth token from localStorage
  const token = localStorage.getItem("token");

  // Load persisted check-in data on mount
  useEffect(() => {
    const savedCheckIns = localStorage.getItem("checkedInAttendees");
    const savedEventId = localStorage.getItem("currentEventId");

    if (savedCheckIns) {
      try {
        setCheckedInAttendees(JSON.parse(savedCheckIns));
        console.log("Restored checked-in attendees from localStorage");
      } catch (error) {
        console.error("Error parsing saved check-ins:", error);
      }
    }

    if (savedEventId) {
      setCurrentEventId(savedEventId);
      console.log("Restored currentEventId from localStorage:", savedEventId);
    }

    scanInputRef.current?.focus();
  }, []);

  // Save check-in data to localStorage whenever it changes
  useEffect(() => {
    if (checkedInAttendees.length > 0) {
      localStorage.setItem(
        "checkedInAttendees",
        JSON.stringify(checkedInAttendees)
      );
      console.log("Saved checked-in attendees to localStorage");
    }
  }, [checkedInAttendees]);

  // Save current event ID to localStorage
  useEffect(() => {
    if (currentEventId) {
      localStorage.setItem("currentEventId", currentEventId);
      // Fetch check-in data when event ID is set
      fetchCheckedInAttendees(currentEventId);
    }
  }, [currentEventId]);

  useEffect(() => {
    // Load event ID from localStorage and fetch data on mount
    const savedEventId = localStorage.getItem("currentEventId");
    if (savedEventId && token) {
      fetchCheckedInAttendees(savedEventId);
    }
  }, [token]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Open sidebar on desktop, close on mobile
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Update stats whenever scannedTickets changes
    const checkedIn = scannedTickets.filter((t) => t.checkedIn).length;
    const pending = scannedTickets.filter((t) => !t.checkedIn).length;
    console.log(
      "📊 Updating stats - scannedTickets:",
      scannedTickets.length,
      "checkedIn:",
      checkedIn
    );
    setStats({
      total: scannedTickets.length,
      checkedIn: checkedIn,
      pending: pending,
    });

    // Trigger animation when count increases
    if (checkedIn > 0) {
      setCountAnimated(true);
      const timer = setTimeout(() => setCountAnimated(false), 600);
      return () => clearTimeout(timer);
    }
  }, [scannedTickets]);

  const showMessage = (message, type) => {
    setMessageType(type);
    setScanMessage(message);

    // Clear previous timeout
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }

    // Auto-clear message after 5 seconds
    messageTimeoutRef.current = setTimeout(() => {
      setScanMessage("");
      setMessageType("");
    }, 5000);
  };

  // Fetch checked-in attendees after scanning
  const fetchCheckedInAttendees = async (eventId) => {
    try {
      setIsLoadingCheckIns(true);
      console.log("Fetching checked-in attendees for event:", eventId);
      const response = await checkInService.getEventCheckIns(eventId, token);

      console.log("Full response from getEventCheckIns:", response);

      // Handle the backend response structure: { success: true, checkIns: [...] }
      let attendeesData = [];

      if (
        response?.success &&
        response?.checkIns &&
        Array.isArray(response.checkIns)
      ) {
        // Backend returns { success: true, checkIns: [...] }
        attendeesData = response.checkIns;
        console.log("✅ Extracted from checkIns:", attendeesData);
      } else if (Array.isArray(response)) {
        // Backend returns array directly
        attendeesData = response;
        console.log("Response is direct array");
      } else if (response?.data && Array.isArray(response.data)) {
        // Backend returns { data: [...] }
        attendeesData = response.data;
        console.log("Extracted from data:", attendeesData);
      }

      console.log("Final attendees data to set:", attendeesData);

      if (attendeesData.length > 0) {
        setCheckedInAttendees(attendeesData);
        console.log(
          "✅ Checked-in attendees updated:",
          attendeesData.length,
          "records"
        );
      } else {
        console.log("⚠ No attendees data found in response");
        setCheckedInAttendees([]);
      }
    } catch (error) {
      console.error("Error fetching check-ins:", error);
    } finally {
      setIsLoadingCheckIns(false);
    }
  };

  const validateAndCheckIn = async (qrCode) => {
    const trimmedCode = qrCode.trim();

    if (!trimmedCode) {
      showMessage("Please enter a ticket ID", "error");
      return;
    }

    setIsScanning(true);

    try {
      // Call backend API to scan ticket
      const result = await checkInService.scanTicket(
        trimmedCode,
        currentEventId,
        token
      );

      console.log("Scan result:", result);

      if (result.success && result.status === "valid") {
        // New ticket, add to scanned list
        const booking = result.booking;
        const bookingEventId = booking.eventId || 1; // Default to 1 if not provided

        const newTicket = {
          id: trimmedCode,
          customerName: booking.customerName || "N/A",
          eventName: booking.eventName || "Event",
          eventType: booking.eventName || "Event",
          totalSeats: booking.totalSeats || 0,
          amount: booking.amount !== undefined ? booking.amount : 0,
          ticketNumber: booking.bookingReference || trimmedCode,
          guestCount: booking.totalSeats || 0,
          checkedIn: true,
          scannedTime: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          checkedInTime: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          status: "scanned",
        };

        setScannedTickets((prev) => [newTicket, ...prev]);
        showMessage(
          `✅ ${booking.customerName} checked in successfully!`,
          "success"
        );

        // Fetch checked-in attendees after successful scan
        setCurrentEventId(bookingEventId);
        await fetchCheckedInAttendees(bookingEventId);
      } else if (result.status === "already_scanned") {
        // Already scanned, but still add to list for visibility
        const booking = result.booking;
        const bookingEventId = booking.eventId || 1; // Default to 1 if not provided

        const newTicket = {
          id: trimmedCode,
          customerName: booking.customerName || "N/A",
          eventName: booking.eventName || "Event",
          eventType: booking.eventName || "Event",
          totalSeats: booking.totalSeats || 0,
          amount: booking.amount !== undefined ? booking.amount : 0,
          ticketNumber: booking.bookingReference || trimmedCode,
          guestCount: booking.totalSeats || 0,
          checkedIn: true,
          scannedTime: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          checkedInTime: booking.scannedAt
            ? new Date(booking.scannedAt).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              }),
          status: "already_scanned",
        };

        setScannedTickets((prev) => {
          // Check if already in list to avoid duplicates
          const exists = prev.some((t) => t.id === trimmedCode);
          if (exists) {
            return prev;
          }
          return [newTicket, ...prev];
        });

        showMessage(
          `⚠ ${booking.customerName} already checked in at ${booking.scannedAt}`,
          "warning"
        );

        // Fetch checked-in attendees after scan (even if already scanned)
        setCurrentEventId(bookingEventId);
        await fetchCheckedInAttendees(bookingEventId);
      } else if (result.status === "invalid") {
        showMessage(`❌ Invalid ticket. Ticket not found in system.`, "error");
      } else {
        showMessage(`❌ ${result.message || "Failed to scan ticket"}`, "error");
      }
    } catch (error) {
      console.error("Scan error:", error);
      showMessage(`❌ ${error.message || "Failed to scan ticket"}`, "error");
    } finally {
      setIsScanning(false);
      // Clear input and refocus
      setScanInput("");
      scanInputRef.current?.focus();

      // Close sidebar on mobile after scan
      if (isMobile) {
        setSidebarOpen(false);
      }
    }
  };

  const handleManualScan = (e) => {
    if (e.key === "Enter" && !isScanning) {
      validateAndCheckIn(scanInput);
    }
  };

  const handleLogout = () => {
    // Show logout confirmation modal instead of logging out immediately
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    // Clear all user data from localStorage FIRST (before any state changes)
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("checkedInAttendees");
    localStorage.removeItem("currentEventId");

    // Add a special flag to indicate we just logged out
    localStorage.setItem("justLoggedOut", "true");

    // Clear all scanned data
    setScannedTickets([]);
    setCheckedInAttendees([]);
    setScanMessage("");
    setMessageType("");
    setStats({ total: 0, checkedIn: 0, pending: 0 });

    // Dispatch logout event so App.jsx can update state
    window.dispatchEvent(new Event("userLoggedOut"));

    // Navigate to home immediately with a small delay to ensure state updates
    setTimeout(() => {
      navigate("/", { replace: true });
    }, 50);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const resetScanner = () => {
    setScannedTickets([]);
    setCheckedInAttendees([]);
    setScanMessage("");
    setMessageType("");
    localStorage.removeItem("checkedInAttendees");
    localStorage.removeItem("currentEventId");
    showMessage("✨ Scanner reset. Ready for new scanning session.", "success");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-sm mx-4">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="bg-red-100 rounded-full p-4">
                  <LogOut className="text-red-600" size={32} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Confirm Logout?
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Are you sure you want to logout? All unsaved scanning data will
                be lost.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelLogout}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay for mobile when sidebar is open */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`${
          isMobile ? "fixed left-0 top-0 h-full z-40 w-64" : "relative w-64"
        } bg-white border-r border-gray-200 flex flex-col shadow-lg transition-all duration-300 overflow-hidden ${
          isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        {/* Header with Logo */}
        <div className="bg-white text-white p-6 flex items-center justify-center border-b border-gray-200">
          <div>
            <Logo />
          </div>
        </div>

        {/* Stats Section */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          <div className="space-y-3 mt-8">
            {/* Checked In */}
            <div
              className={`bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border-l-4 border-green-500 transition-all duration-300 ${
                countAnimated ? "scale-105 shadow-lg" : "scale-100"
              }`}
            >
              <p className="text-gray-600 text-sm font-semibold">Checked In</p>
              <p
                className={`text-3xl font-bold text-green-600 mt-1 transition-all duration-300 ${
                  countAnimated ? "scale-125" : "scale-100"
                }`}
              >
                {scannedTickets.filter((t) => t.checkedIn).length}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 space-y-3 border-t border-gray-200">
          <button
            onClick={resetScanner}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-semibold text-sm flex items-center justify-center gap-2"
          >
            <Zap size={16} />
            Reset Session
          </button>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-semibold text-sm flex items-center justify-center gap-2"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto flex flex-col">
        {/* Top Header */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 md:py-6 shadow-sm">
          <div className="flex items-center justify-between">
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="hover:bg-gray-100 p-2 rounded text-gray-800 md:hidden"
              >
                <Menu size={20} />
              </button>
            )}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-3">
                <span className="text-xl md:text-4xl">Staff Check-in</span>
              </h1>
            </div>
            <div className="text-right space-y-1 ml-4">
              <p className="text-xs md:text-sm text-gray-600 font-semibold">
                {new Date().toLocaleDateString("en-US", { weekday: "long" })}
              </p>
              <p className="text-xs md:text-sm text-gray-600 font-semibold">
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <p className="text-xs md:text-sm text-gray-600 font-semibold">
                {new Date().toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 md:p-8 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
            {/* Scanner Input Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-8 sticky top-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  Enter Ticket ID/Booking ID
                </h2>

                {/* Message Display */}
                {scanMessage && (
                  <div
                    className={`mb-4 p-3 rounded-lg border-l-4 ${
                      messageType === "success"
                        ? "bg-green-50 border-green-500 text-green-700"
                        : messageType === "error"
                        ? "bg-red-50 border-red-500 text-red-700"
                        : "bg-yellow-50 border-yellow-500 text-yellow-700"
                    }`}
                  >
                    <p className="text-sm font-semibold">{scanMessage}</p>
                  </div>
                )}

                {/* Input Field */}
                <div className="mb-6">
                  <input
                    ref={scanInputRef}
                    type="text"
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    onKeyPress={handleManualScan}
                    placeholder="Enter Ticket ID or scan QR code..."
                    disabled={isScanning}
                    className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-600 text-center font-mono text-lg ${
                      isScanning ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                    autoComplete="off"
                  />
                </div>

                {/* Scanning Indicator */}
                {isScanning && (
                  <div className="mb-4 p-3 rounded-lg bg-blue-50 border-l-4 border-blue-500 text-blue-700">
                    <p className="text-sm font-semibold flex items-center gap-2">
                      <span className="animate-spin">⏳</span> Scanning...
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Checked-in List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-4">
                  <h2
                    className={`text-xl font-bold text-white flex items-center gap-2 transition-all duration-300 ${
                      countAnimated ? "scale-105" : "scale-100"
                    }`}
                  >
                    <Check size={24} />
                    Checked In Attendees ({scannedTickets.length})
                  </h2>
                </div>

                {scannedTickets.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-gray-500 font-semibold">
                      No attendees checked in yet
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b-2 border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                            Customer Name
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                            Event Name
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                            Booking ID
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                            Ticket ID
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                            Check-in Time
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                            Seats
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {scannedTickets.map((attendee) => (
                          <tr
                            key={attendee.id}
                            className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Check size={18} className="text-green-600" />
                                <span className="font-semibold text-gray-800">
                                  {attendee.customerName}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-700">
                              {attendee.eventName}
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-mono text-sm bg-red-50 px-2 py-1 rounded text-red-600 font-semibold">
                                {attendee.ticketNumber}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-mono text-sm bg-yellow-50 px-2 py-1 rounded text-yellow-600 font-semibold">
                                {attendee.id}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium text-green-600">
                                {attendee.scannedTime}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                                {attendee.totalSeats}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffScanner;
