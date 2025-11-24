import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  LogOut,
  Users,
  Calendar,
  MapPin,
  DollarSign,
  Menu,
} from "lucide-react";
import Logo from "../../Components/Logo";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [analytics, setAnalytics] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersCurrentPage, setUsersCurrentPage] = useState(1);
  const usersPerPage = 10;
  const navigate = useNavigate();
  const contentRef = React.useRef(null);
  const bookingsRef = React.useRef(null);
  const usersRef = React.useRef(null);

  // Fetch analytics data from backend
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch analytics
        const analyticsResponse = await fetch(
          "http://localhost:5000/api/admin/analytics",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const analyticsData = await analyticsResponse.json();
        if (analyticsData.success) {
          setAnalytics(analyticsData.analytics);
        } else {
          setAnalytics({
            totalUsers: 0,
            totalBookings: 0,
            totalEvents: 0,
            totalRevenue: 0,
            pendingEvents: 0,
          });
        }

        // Fetch recent bookings
        const bookingsResponse = await fetch(
          "http://localhost:5000/api/bookings/admin/all",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const bookingsData = await bookingsResponse.json();
        if (bookingsData.success) {
          setRecentBookings(bookingsData.bookings || []);
        }

        // Fetch registered users from correct admin endpoint
        const usersResponse = await fetch(
          "http://localhost:5000/api/admin/users/all",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const usersData = await usersResponse.json();
        if (usersData.success) {
          setRegisteredUsers(usersData.users || []);
        } else if (usersData.users) {
          setRegisteredUsers(usersData.users);
        } else {
          setRegisteredUsers([]);
          console.error("Users fetch failed, no users loaded:", usersData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  React.useEffect(() => {
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

  const handleMenuClick = (tabId) => {
    setActiveTab(tabId);
    if (isMobile) setSidebarOpen(false);

    // Scroll to respective section
    setTimeout(() => {
      if (tabId === "bookings" && bookingsRef.current) {
        bookingsRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } else if (tabId === "users" && usersRef.current) {
        usersRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (tabId === "dashboard" && contentRef.current) {
        contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 0);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("loggedInUser");
    window.dispatchEvent(new Event("userLoggedOut"));
    setTimeout(() => navigate("/"), 100);
  };

  // Pagination logic for users
  const indexOfLastUser = usersCurrentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = registeredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalUsersPages = Math.ceil(registeredUsers.length / usersPerPage);

  // Sample data
  const stats = [
    {
      label: "Total Users",
      value: registeredUsers.length || analytics?.totalUsers || 0,
      icon: Users,
      color: "bg-red-600",
    },
    {
      label: "Total Bookings",
      value: analytics?.totalBookings ?? 0,
      icon: Calendar,
      color: "bg-red-600",
    },
    {
      label: "Total Events",
      value: analytics?.totalEvents ?? 0,
      icon: MapPin,
      color: "bg-red-600",
    },
    {
      label: "Revenue",
      value: `₹${(analytics?.totalRevenue ?? 0).toLocaleString()}`,
      icon: DollarSign,
      color: "bg-red-600",
    },
  ];

  const chartData = [
    { month: "Jan", bookings: 45, revenue: 180000 },
    { month: "Feb", bookings: 52, revenue: 210000 },
    { month: "Mar", bookings: 38, revenue: 150000 },
    { month: "Apr", bookings: 61, revenue: 240000 },
  ];

  return (
    <div className="flex h-screen bg-white">
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
        } bg-white transition-all duration-300 overflow-hidden flex flex-col ${
          isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        {/* Header with Logo */}
        <div className="bg-white text-gray-800 p-6 flex items-center justify-between border-b border-gray-200">
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="hover:bg-gray-100 p-2 rounded text-gray-800 md:hidden"
            >
              <Menu size={20} />
            </button>
          )}

          <div className={isMobile && sidebarOpen ? "flex-1" : "flex-1"}>
            <Logo />
          </div>
        </div>

        {/* White Menu Section */}
        <nav className="flex-1 mt-8 space-y-2 px-4">
          {[
            { name: "Dashboard", id: "dashboard" },
            { name: "Bookings", id: "bookings" },
            { name: "Users", id: "users" },
            { name: "Events", id: "events", navigate: "/admin/events" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.navigate) {
                  navigate(item.navigate);
                } else {
                  handleMenuClick(item.id);
                }
              }}
              className={`w-full px-4 py-3 text-left rounded transition-colors font-semibold ${
                activeTab === item.id
                  ? "bg-red-100 text-red-600"
                  : "text-gray-800 hover:bg-gray-100"
              }`}
            >
              {item.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 md:py-6 flex justify-between items-center">
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="hover:bg-gray-100 p-2 rounded text-gray-800 md:hidden"
            >
              <Menu size={20} />
            </button>
          )}
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Admin Dashboard
            </h1>
            <div className="w-20 h-1 bg-red-600 mt-2"></div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-semibold text-sm md:text-base whitespace-nowrap ml-4"
          >
            <LogOut size={18} />
            <span className="hidden md:inline">Logout</span>
            <span className="md:hidden">Logout</span>
          </button>
        </div>

        {/* Content */}
        <div ref={contentRef} className="p-4 md:p-8 flex-1 overflow-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border-b-4 border-red-600"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-gray-600 font-semibold">
                        {stat.label}
                      </h3>
                      <div className={`${stat.color} p-3 rounded text-white`}>
                        <IconComponent size={20} />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-800">
                      {stat.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts and Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Chart */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <div className="w-4 h-4 bg-red-600 rounded"></div>
                Monthly Performance
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="bookings" fill="#dc2626" name="Bookings" />
                  <Bar dataKey="revenue" fill="#f87171" name="Revenue (₹)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <div className="w-4 h-4 bg-red-600 rounded"></div>
                Quick Stats
              </h2>
              <div className="space-y-4">
                <div className="border-l-4 border-red-600 pl-4">
                  <p className="text-sm text-gray-600">Pending Events</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {analytics?.pendingEvents ?? 0}
                  </p>
                </div>
                <div className="border-l-4 border-red-600 pl-4">
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {registeredUsers.length || analytics?.totalUsers || 0}
                  </p>
                </div>
                <div className="border-l-4 border-red-600 pl-4">
                  <p className="text-sm text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {analytics?.totalEvents ?? 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Bookings Table */}
          <div ref={bookingsRef} className="bg-white rounded-lg shadow mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <div className="w-4 h-4 bg-red-600 rounded"></div>
                Recent Bookings
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-red-600">
                      Booking ID
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-red-600">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-red-600">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-red-600">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-red-600">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings && recentBookings.length > 0 ? (
                    recentBookings.map((booking, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 text-gray-800 font-semibold">
                          #{booking.id}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {booking.customer?.name || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {booking.event?.name || booking.event?.title || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {booking.createdAt
                            ? new Date(booking.createdAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              booking.paymentStatus === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {booking.paymentStatus || "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No bookings found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Registered Users Table */}
          <div ref={usersRef} className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <div className="w-4 h-4 bg-red-600 rounded"></div>
                Registered Users ({registeredUsers.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-red-600">
                      User ID
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-red-600">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-red-600">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-red-600">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers && currentUsers.length > 0 ? (
                    currentUsers.map((user, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 text-gray-800 font-semibold">
                          #{user.id}
                        </td>
                        <td className="px-6 py-4 text-gray-700">{user.name}</td>
                        <td className="px-6 py-4 text-gray-700">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                }
                              )
                            : "N/A"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalUsersPages > 1 && (
              <div className="p-6 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstUser + 1} to{" "}
                  {Math.min(indexOfLastUser, registeredUsers.length)} of{" "}
                  {registeredUsers.length} users
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setUsersCurrentPage(Math.max(1, usersCurrentPage - 1))
                    }
                    disabled={usersCurrentPage === 1}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalUsersPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setUsersCurrentPage(page)}
                        className={`px-3 py-2 rounded font-semibold ${
                          usersCurrentPage === page
                            ? "bg-red-600 text-white"
                            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    onClick={() =>
                      setUsersCurrentPage(
                        Math.min(totalUsersPages, usersCurrentPage + 1)
                      )
                    }
                    disabled={usersCurrentPage === totalUsersPages}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
