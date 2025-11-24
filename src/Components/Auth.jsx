import { useState } from "react";
import RegisterForm from "./RegisterForm";
import LoginForm from "./LoginForm";

export default function Auth({ onClose }) {
  const [authStep, setAuthStep] = useState("options"); // options, register, login, success
  const [userType, setUserType] = useState(null);
  const [registeredUser, setRegisteredUser] = useState(null);

  const userOptions = [
    { id: "customer", label: "As a Customer", icon: "🎫" },
    { id: "organizer", label: "As a Event Organizer", icon: "🎪" },
    { id: "admin", label: "As an Admin", icon: "👨‍💼" },
    { id: "staff", label: "As a Staff", icon: "👔" },
  ];

  const handleSelectUserType = (type) => {
    setUserType(type);
    setAuthStep("register");
  };

  const handleSwitchToLogin = () => {
    setAuthStep("login");
  };

  const handleSwitchToRegister = () => {
    setAuthStep("register");
  };

  const handleRegistrationSuccess = (userData) => {
    setRegisteredUser(userData);
    setAuthStep("success");
    setTimeout(() => {
      setAuthStep("login");
    }, 2000);
  };

  const handleLoginSuccess = () => {
    setAuthStep("options");
    setUserType(null);
    onClose?.();
  };

  const handleBackToOptions = () => {
    setAuthStep("options");
    setUserType(null);
  };

  const handleClose = () => {
    onClose?.();
  };

  return (
    <>
      {/* Overlay - Click to close */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
        onClick={(e) => {
          // Only close if clicking on the backdrop, not the modal content
          if (e.target === e.currentTarget) {
            handleClose();
          }
        }}
      >
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          {/* Close Button */}
          <div className="sticky top-0 bg-white border-b flex justify-between items-center p-6">
            <div className="flex items-center gap-3">
              {(authStep === "register" || authStep === "login") && (
                <div className="bg-red-500 text-white p-2 rounded-full">
                  <svg
                    className="h-5 w-5"
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
                </div>
              )}
              <h2 className="text-2xl font-bold text-gray-900">
                {authStep === "options" && "Login"}
                {authStep === "register" && "Register"}
                {authStep === "login" && "Login"}
                {authStep === "success" && "Success"}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-600 hover:text-gray-900 text-2xl font-bold"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {authStep === "options" && (
              <div>
                <p className="text-gray-600 mb-6 text-center">
                  Choose how you want to login
                </p>
                <div className="space-y-3">
                  {userOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleSelectUserType(option.id)}
                      className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition text-left font-semibold text-gray-900"
                    >
                      <span className="text-3xl">{option.icon}</span>
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {authStep === "register" && userType && (
              <RegisterForm
                userType={userType}
                onSuccess={handleRegistrationSuccess}
                onSwitchToLogin={handleSwitchToLogin}
              />
            )}

            {authStep === "login" && userType && (
              <LoginForm
                userType={userType}
                onSuccess={handleLoginSuccess}
                onSwitchToRegister={handleSwitchToRegister}
              />
            )}

            {authStep === "success" && (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">✓</div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">
                  Successfully Registered!
                </h3>
                <p className="text-gray-600 mb-6">
                  Welcome {registeredUser?.name}! Redirecting to login...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
