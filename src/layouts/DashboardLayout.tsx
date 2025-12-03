import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { authApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Lightbulb,
  LayoutDashboard,
  FileText,
  PlusCircle,
  Users,
  Settings,
  BarChart3,
  Trophy,
  LogOut,
  Menu,
  X,
  Bot,
  Search,
  ChevronDown,
} from "lucide-react";
import { generateInitials, getRoleLabel } from "@/lib/utils";

export default function DashboardLayout() {
  const { user, logout, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch fresh profile data to keep points updated
  const { data: profileData } = useQuery({
    queryKey: ["profile"],
    queryFn: () => authApi.getProfile().then((res) => res.data),
    enabled: !!user,
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000, // Consider data stale after 30 seconds
  });

  // Update auth store with fresh data
  useEffect(() => {
    if (profileData && user) {
      // Only update if points changed to avoid unnecessary re-renders
      if (profileData.totalPoints !== user.totalPoints) {
        updateUser({ totalPoints: profileData.totalPoints });
      }
    }
  }, [profileData, user, updateUser]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const role = user?.role;

  // Role-specific navigation items
  const getNavItems = () => {
    switch (role) {
      case "EMPLOYEE":
        return [
          {
            label: "Dashboard",
            icon: LayoutDashboard,
            href: "/employee/dashboard",
            end: true,
          },
          {
            label: "My Ideas",
            icon: FileText,
            href: "/employee/ideas",
            end: true,
          },
          {
            label: "New Idea",
            icon: PlusCircle,
            href: "/employee/ideas/new",
            end: true,
          },
        ];
      case "REVIEWER":
        return [
          {
            label: "Dashboard",
            icon: LayoutDashboard,
            href: "/reviewer/dashboard",
          },
          { label: "Review Queue", icon: FileText, href: "/reviewer/queue" },
          { label: "AI Agent", icon: Bot, href: "/reviewer/agents" },
          { label: "Analytics", icon: BarChart3, href: "/reviewer/analytics" },
        ];
      case "MANAGEMENT":
        return [
          {
            label: "Dashboard",
            icon: LayoutDashboard,
            href: "/management/dashboard",
          },
          { label: "All Ideas", icon: FileText, href: "/management/ideas" },
          { label: "AI Discovery", icon: Search, href: "/management/discover" },
          {
            label: "Analytics",
            icon: BarChart3,
            href: "/management/analytics",
          },
          { label: "Team", icon: Users, href: "/management/users" },
          { label: "Settings", icon: Settings, href: "/management/settings" },
        ];
      case "ADMIN":
        return [
          {
            label: "Dashboard",
            icon: LayoutDashboard,
            href: "/management/dashboard",
          },
          { label: "All Ideas", icon: FileText, href: "/management/ideas" },
          { label: "AI Discovery", icon: Search, href: "/management/discover" },
          {
            label: "Analytics",
            icon: BarChart3,
            href: "/management/analytics",
          },
          { label: "Team", icon: Users, href: "/management/users" },
          { label: "Settings", icon: Settings, href: "/management/settings" },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-card border-r transform transition-transform duration-200 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">InnovateX</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={(item as any).end}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>

          {/* User info */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>
                  {generateInitials(user?.name || "U")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {getRoleLabel(user?.role || "")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b">
          <div className="flex items-center justify-between px-4 h-16">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            <div className="flex-1" />

            <div className="flex items-center gap-4">
              {/* Points display - only for employees and reviewers */}
              {user?.role && !["ADMIN", "MANAGEMENT"].includes(user.role) && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-full">
                  <Trophy className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {profileData?.totalPoints ?? user?.totalPoints ?? 0} pts
                  </span>
                </div>
              )}

              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback>
                        {generateInitials(user?.name || "U")}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div>
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
