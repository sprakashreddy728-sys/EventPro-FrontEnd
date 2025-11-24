import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

export default function LoginForm({ userType, onSuccess, onSwitchToRegister }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Call backend API to login
      const response = await authService.login(
        formData.email,
        formData.password
      );

      console.log("Login response:", response);

      // Check if response has user data (backend successful response)
      if (response && response.user) {
        console.log("User role:", response.user.role);
        console.log("User role type:", typeof response.user.role);
        console.log("User object:", response.user);
        // Token and user data already saved in localStorage by authService
        onSuccess();

        // Dispatch custom event to notify App component of user update
        window.dispatchEvent(new Event("userLoggedIn"));

        // Redirect based on user role
        const userRole = String(response.user.role).trim().toLowerCase();
        console.log("Redirecting user with role:", userRole);

        setTimeout(() => {
          if (userRole === "staff") {
            navigate("/staff/scanner", { replace: true });
          } else if (userRole === "admin") {
            navigate("/admin/dashboard", { replace: true });
          } else if (userRole === "organizer") {
            navigate("/organizer-dashboard", { replace: true });
          } else {
            navigate("/", { replace: true });
          }
        }, 100);
      } else {
        setErrors({
          submit: "Invalid login response from server",
        });
      }
    } catch (error) {
      console.log("Full error object:", error);
      setErrors({
        submit: "Incorrect credentials. Please try again.",
      });
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm bg-white rounded-lg p-6 border border-gray-200">
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.submit && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium">
            {errors.submit}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
              errors.email
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-red-500"
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1 font-medium">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
              errors.password
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-red-500"
            }`}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1 font-medium">
              {errors.password}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
            />
            <span className="text-gray-700">Remember me</span>
          </label>
          <a href="#" className="text-red-500 hover:text-red-600 font-medium">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      {/* Footer Links */}
      <div className="mt-8 space-y-3 border-t border-gray-100 pt-6">
        <p className="text-center text-gray-600 text-sm">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-red-600 hover:text-red-700 font-semibold"
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  );
}
