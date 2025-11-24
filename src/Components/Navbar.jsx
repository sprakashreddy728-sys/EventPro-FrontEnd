import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import Auth from "./Auth";

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [logoutMessage, setLogoutMessage] = useState("");
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Check for logged-in user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
    } else {
      setUser(null);
      setIsLoggedIn(false);
    }

    // Listen for storage changes (login/logout from other tabs)
    const handleStorageChange = (e) => {
      if (e.key === "loggedInUser") {
        if (e.newValue) {
          setUser(JSON.parse(e.newValue));
          setIsLoggedIn(true);
        } else {
          setUser(null);
          setIsLoggedIn(false);
        }
      }
    };

    // Listen for custom userLoggedIn event
    const handleUserLoggedIn = () => {
      const updatedUser = localStorage.getItem("loggedInUser");
      if (updatedUser) {
        setUser(JSON.parse(updatedUser));
        setIsLoggedIn(true);
      }
    };

    // Listen for logout event
    const handleUserLogout = () => {
      setLogoutMessage("✓ Logged out successfully");
      setTimeout(() => setLogoutMessage(""), 3000);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userLoggedIn", handleUserLoggedIn);
    window.addEventListener("userLoggedOut", handleUserLogout);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userLoggedIn", handleUserLoggedIn);
      window.removeEventListener("userLoggedOut", handleUserLogout);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isUserMenuOpen && !e.target.closest(".user-menu-container")) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isUserMenuOpen]);

  const handleLogout = () => {
    // Clear all user data from localStorage FIRST
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("checkedInAttendees");
    localStorage.removeItem("currentEventId");

    // Update local state immediately
    setUser(null);
    setIsLoggedIn(false);
    setIsUserMenuOpen(false);
    setLogoutMessage("✓ Logged out successfully");

    // Dispatch logout event so App.jsx updates
    window.dispatchEvent(new Event("userLoggedOut"));

    // Reload page to "/" - this is the most reliable way to clear state and redirect
    setTimeout(() => {
      window.location.href = "/";
    }, 100);
  };

  return (
    <>
      {/* Logout Success Message */}
      {logoutMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 font-semibold">
          {logoutMessage}
        </div>
      )}

      <nav className="bg-white text-gray-900 shadow-lg fixed top-0 left-0 right-0 z-50">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Logo />
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-8 items-center flex-1 justify-center">
              <a
                href="#home"
                className="font-bold text-gray-900 border-b-2 border-transparent hover:border-red-500 pb-1 transition"
              >
                Home
              </a>
              {isLoggedIn && (
                <button
                  onClick={() => navigate("/my-bookings")}
                  className="font-bold text-gray-900 border-b-2 border-transparent hover:border-red-500 pb-1 transition"
                >
                  My Bookings
                </button>
              )}
              <a
                href="#events"
                className="font-bold text-gray-900 border-b-2 border-transparent hover:border-red-500 pb-1 transition"
              >
                Events
              </a>
              <a
                href="#gallery"
                className="font-bold text-gray-900 border-b-2 border-transparent hover:border-red-500 pb-1 transition"
              >
                Gallery
              </a>

              <a
                href="#contact"
                className="font-bold text-gray-900 border-b-2 border-transparent hover:border-red-500 pb-1 transition"
              >
                Contact Us
              </a>
            </div>

            {/* Login + Profile Button */}
            <div className="hidden md:flex space-x-4 items-center relative user-menu-container">
              {isLoggedIn ? (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleUserMenu();
                    }}
                    className="flex items-center justify-center bg-red-500 text-white p-2 rounded-full font-semibold hover:bg-red-600 transition w-10 h-10"
                    title={user?.name}
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </button>

                  {/* User Menu Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute top-16 right-0 bg-white shadow-lg rounded-lg p-4 w-48 z-50 border border-gray-200">
                      <div className="pb-3 border-b border-gray-200">
                        <p className="font-semibold text-gray-900">
                          {user?.name}
                        </p>
                        <p className="text-sm text-gray-600">{user?.email}</p>
                        {user?.role && (
                          <p className="text-xs font-semibold text-red-600 mt-1 uppercase">
                            Logged as {user?.role}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded mt-2 font-semibold"
                      >
                        🚪 Logout
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="font-bold text-gray-900 border-b-2 border-transparent hover:border-red-500 pb-1 transition"
                >
                  Login
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleSidebar}
              className={`md:hidden p-2 rounded-md text-gray-900 hover:text-red-500 hover:bg-gray-100 transition ${
                isSidebarOpen ? "hidden" : ""
              }`}
            >
              <svg
                className={`h-6 w-6 transition-transform ${
                  isSidebarOpen ? "rotate-90" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* Mobile Sidebar */}
        <div
          className={`fixed right-0 top-0 bottom-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-40 md:hidden ${
            isSidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Close Button */}
          <button
            onClick={closeSidebar}
            className="absolute top-4 right-4 p-2 text-gray-900 hover:text-red-500 transition"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="overflow-y-auto h-full">
            <nav className="px-4 py-6 space-y-2">
              <a
                href="#home"
                onClick={closeSidebar}
                className="block px-4 py-3 rounded-lg font-semibold text-gray-900 hover:bg-red-50 hover:text-red-500 transition"
              >
                Home
              </a>
              {isLoggedIn && (
                <button
                  onClick={() => {
                    navigate("/my-bookings");
                    closeSidebar();
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg font-semibold text-gray-900 hover:bg-red-50 hover:text-red-500 transition"
                >
                  My Bookings
                </button>
              )}
              <a
                href="#events"
                onClick={closeSidebar}
                className="block px-4 py-3 rounded-lg font-semibold text-gray-900 hover:bg-red-50 hover:text-red-500 transition"
              >
                Events
              </a>
              <a
                href="#gallery"
                onClick={closeSidebar}
                className="block px-4 py-3 rounded-lg font-semibold text-gray-900 hover:bg-red-50 hover:text-red-500 transition"
              >
                Gallery
              </a>

              <a
                href="#contact"
                onClick={closeSidebar}
                className="block px-4 py-3 rounded-lg font-semibold text-gray-900 hover:bg-red-50 hover:text-red-500 transition"
              >
                Contact Us
              </a>

              <div className="border-t border-gray-200 my-4 pt-4">
                {isLoggedIn ? (
                  <>
                    <div className="px-4 py-3 bg-red-50 rounded-lg mb-3">
                      <p className="font-semibold text-gray-900 text-sm">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-600">{user?.email}</p>
                      {user?.role && (
                        <p className="text-xs font-semibold text-red-600 mt-1 uppercase">
                          Logged as {user?.role}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        closeSidebar();
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg font-semibold text-red-600 hover:bg-red-50 transition mt-2"
                    >
                      🚪 Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setIsAuthOpen(true);
                      closeSidebar();
                    }}
                    className="w-full text-left px-4 py-3 rounded-lg font-semibold text-gray-900 hover:bg-red-50 hover:text-red-500 transition"
                  >
                    Login
                  </button>
                )}
              </div>
            </nav>
          </div>
        </div>
        {isAuthOpen && <Auth onClose={() => setIsAuthOpen(false)} />}
      </nav>
    </>
  );
}
