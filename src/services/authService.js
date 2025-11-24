import api from "./api";

// Mock users for testing (remove in production when backend is ready)
const MOCK_USERS = {
  "customer@example.com": {
    id: 1,
    name: "John Customer",
    email: "customer@example.com",
    role: "customer",
    password: "password123",
  },
  "organizer@example.com": {
    id: 2,
    name: "Jane Organizer",
    email: "organizer@example.com",
    role: "organizer",
    password: "password123",
  },
  "admin@example.com": {
    id: 3,
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    password: "password123",
  },
  "staff@example.com": {
    id: 4,
    name: "Staff Member",
    email: "staff@example.com",
    role: "staff",
    password: "password123",
  },
};

// Simple JWT creation for mock login (for testing only)
const createMockJWT = (user) => {
  // This is a simple JWT-like token for testing
  // In production, the backend should create real JWTs
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      id: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
    })
  );
  const signature = btoa("mock-signature-" + Date.now());
  return `${header}.${payload}.${signature}`;
};

export const authService = {
  register: async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem(
          "loggedInUser",
          JSON.stringify(response.data.user)
        );
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  login: async (email, password) => {
    try {
      // Try real backend first
      const response = await api.post("/auth/login", { email, password });
      console.log("Auth service login response:", response.data);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem(
          "loggedInUser",
          JSON.stringify(response.data.user)
        );
        console.log("User saved to localStorage:", response.data.user);
      }
      return response.data;
    } catch (error) {
      console.log("Backend login failed, trying mock login...", error);

      // Fallback to mock login for testing
      if (MOCK_USERS[email] && MOCK_USERS[email].password === password) {
        const mockUser = { ...MOCK_USERS[email] };
        delete mockUser.password; // Don't store password

        // Create a mock JWT for testing
        const mockToken = createMockJWT(mockUser);

        const mockResponse = {
          success: true,
          token: mockToken,
          user: mockUser,
        };

        localStorage.setItem("token", mockResponse.token);
        localStorage.setItem("user", JSON.stringify(mockUser));
        localStorage.setItem("loggedInUser", JSON.stringify(mockUser));

        console.log("Mock login successful:", mockUser);
        console.log("Mock token created:", mockToken);
        return mockResponse;
      }

      throw error.response?.data || error;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("loggedInUser");
  },

  getUser: () => {
    const user = localStorage.getItem("user");
    if (!user) {
      const loggedInUser = localStorage.getItem("loggedInUser");
      return loggedInUser ? JSON.parse(loggedInUser) : null;
    }
    return user ? JSON.parse(user) : null;
  },

  getToken: () => {
    return localStorage.getItem("token");
  },
};
