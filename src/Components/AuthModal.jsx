import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function AuthModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login"); // 'login' or 'register'

  if (!isOpen) return null;

  const handleLoginSuccess = () => {
    onClose();
    // User will be redirected by LoginForm based on their role
  };

  const switchToRegister = () => {
    setActiveTab("register");
  };

  const switchToLogin = () => {
    setActiveTab("login");
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="animate-fadeIn relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold z-10"
          >
            ×
          </button>

          {/* Modal Content */}
          <div>
            {activeTab === "login" ? (
              <>
                <LoginForm
                  userType="customer"
                  onSuccess={handleLoginSuccess}
                  onSwitchToRegister={switchToRegister}
                />
              </>
            ) : (
              <>
                <RegisterForm
                  userType="customer"
                  onSuccess={handleLoginSuccess}
                  onSwitchToLogin={switchToLogin}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
