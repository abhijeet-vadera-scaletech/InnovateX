import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./stores/authStore";
import { authApi } from "./lib/api";
import { Loader2 } from "lucide-react";

// Layouts
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import CanvasLayout from "./layouts/CanvasLayout";
import EmployeeLayout from "./layouts/EmployeeLayout";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import JoinPage from "./pages/auth/JoinPage";
import CreateOrgPage from "./pages/auth/CreateOrgPage";

// Employee Pages
import InnovationHub from "./pages/employee/InnovationHub";
import MyIdeas from "./pages/employee/MyIdeasHub";
import IdeaCanvasPage from "./pages/employee/IdeaCanvasPage";
import IdeaDetail from "./pages/employee/IdeaDetail";
import IdeaPreview from "./pages/employee/IdeaPreview";

// Reviewer Pages
import ReviewerDashboard from "./pages/reviewer/Dashboard";
import ReviewQueue from "./pages/reviewer/ReviewQueue";
import ReviewIdea from "./pages/reviewer/ReviewIdea";
import ReviewAgents from "./pages/reviewer/ReviewAgents";
import CreateAgent from "./pages/reviewer/CreateAgent";

// Management Pages
import ManagementDashboard from "./pages/management/Dashboard";
import ShortlistedIdeas from "./pages/management/ShortlistedIdeas";
import AllIdeas from "./pages/management/AllIdeas";
import Users from "./pages/management/Users";
import Settings from "./pages/management/Settings";
import Analytics from "./pages/management/Analytics";
import IdeaDiscovery from "./pages/management/IdeaDiscovery";

// Common Pages
import Leaderboard from "./pages/common/Leaderboard";
import Profile from "./pages/common/Profile";
import NotFound from "./pages/common/NotFound";

// Helper to get dashboard route based on role
function getRoleDashboard(role?: string) {
  switch (role) {
    case "ADMIN":
    case "MANAGEMENT":
      return "/management/dashboard";
    case "REVIEWER":
      return "/reviewer/dashboard";
    default:
      return "/employee/dashboard";
  }
}

// Protected Route Component
function ProtectedRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: string[];
}) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    // Redirect to user's own dashboard if accessing unauthorized route
    return <Navigate to={getRoleDashboard(user.role)} replace />;
  }

  return <>{children}</>;
}

function App() {
  const { isAuthenticated, user, token, updateUser, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  // Fetch fresh profile data on app load
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await authApi.getProfile();
        updateUser(response.data);
      } catch (error: any) {
        // If profile fetch fails (e.g., token expired), logout
        if (error.response?.status === 401) {
          logout();
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [token, updateUser, logout]);

  // Redirect to appropriate dashboard based on role
  const getDashboardRoute = () => {
    if (!user) return "/employee";
    switch (user.role) {
      case "ADMIN":
      case "MANAGEMENT":
        return "/management/dashboard";
      case "REVIEWER":
        return "/reviewer/dashboard";
      default:
        return "/employee/dashboard";
    }
  };

  // Show loading spinner while fetching profile
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/join/:code" element={<JoinPage />} />
        <Route path="/create-organisation" element={<CreateOrgPage />} />
      </Route>

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard redirect */}
        <Route
          path="/dashboard"
          element={<Navigate to={getDashboardRoute()} replace />}
        />

        {/* Employee idea detail - still uses dashboard layout */}
        <Route
          path="/employee/ideas/:id"
          element={
            <ProtectedRoute roles={["EMPLOYEE"]}>
              <IdeaDetail />
            </ProtectedRoute>
          }
        />

        {/* Reviewer Routes */}
        <Route
          path="/reviewer/dashboard"
          element={
            <ProtectedRoute roles={["REVIEWER"]}>
              <ReviewerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reviewer/queue"
          element={
            <ProtectedRoute roles={["REVIEWER"]}>
              <ReviewQueue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reviewer/ideas/:id"
          element={
            <ProtectedRoute roles={["REVIEWER"]}>
              <ReviewIdea />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reviewer/agents"
          element={
            <ProtectedRoute roles={["REVIEWER"]}>
              <ReviewAgents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reviewer/agents/new"
          element={
            <ProtectedRoute roles={["REVIEWER"]}>
              <CreateAgent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reviewer/analytics"
          element={
            <ProtectedRoute roles={["REVIEWER"]}>
              <Analytics />
            </ProtectedRoute>
          }
        />

        {/* Management Routes */}
        <Route
          path="/management/dashboard"
          element={
            <ProtectedRoute roles={["MANAGEMENT", "ADMIN"]}>
              <ManagementDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/management/shortlisted"
          element={
            <ProtectedRoute roles={["MANAGEMENT", "ADMIN"]}>
              <ShortlistedIdeas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/management/ideas"
          element={
            <ProtectedRoute roles={["MANAGEMENT", "ADMIN"]}>
              <AllIdeas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/management/users"
          element={
            <ProtectedRoute roles={["MANAGEMENT", "ADMIN"]}>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/management/settings"
          element={
            <ProtectedRoute roles={["MANAGEMENT", "ADMIN"]}>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/management/analytics"
          element={
            <ProtectedRoute roles={["MANAGEMENT", "ADMIN"]}>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/management/discover"
          element={
            <ProtectedRoute roles={["MANAGEMENT", "ADMIN"]}>
              <IdeaDiscovery />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Employee Layout Routes */}
      <Route
        element={
          <ProtectedRoute roles={["EMPLOYEE"]}>
            <EmployeeLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/employee/dashboard" element={<InnovationHub />} />
        <Route path="/employee/ideas" element={<MyIdeas />} />
        <Route path="/employee/leaderboard" element={<Leaderboard />} />
        <Route path="/employee/profile" element={<Profile />} />
      </Route>

      {/* Legacy routes for backward compatibility */}
      <Route
        path="/leaderboard"
        element={<Navigate to="/employee/leaderboard" replace />}
      />
      <Route
        path="/profile"
        element={<Navigate to="/employee/profile" replace />}
      />

      {/* Canvas Routes - Full screen canvas experience */}
      <Route
        element={
          <ProtectedRoute>
            <CanvasLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/employee/ideas/new"
          element={
            <ProtectedRoute roles={["EMPLOYEE"]}>
              <IdeaCanvasPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/ideas/:id/edit"
          element={
            <ProtectedRoute roles={["EMPLOYEE"]}>
              <IdeaCanvasPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Full-screen preview route */}
      <Route
        path="/employee/ideas/:id/preview"
        element={
          <ProtectedRoute roles={["EMPLOYEE"]}>
            <IdeaPreview />
          </ProtectedRoute>
        }
      />

      {/* Root redirect */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
