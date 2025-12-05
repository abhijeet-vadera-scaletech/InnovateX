import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useThemeStore } from "@/stores/themeStore";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { generateInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  Search,
  Bell,
  Lightbulb,
  Home,
  FolderOpen,
  Trophy,
  ChevronDown,
  User,
  LogOut,
} from "lucide-react";

interface EmployeeHeaderProps {
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
}

export function EmployeeHeader({
  showSearch = true,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search ideas...",
}: EmployeeHeaderProps) {
  const { user, logout } = useAuthStore();
  const { theme } = useThemeStore();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isDark = theme === "dark";

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b",
        isDark
          ? "bg-[#0a0a1a]/80 border-white/5"
          : "bg-white/80 border-slate-200/50"
      )}
    >
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo & Nav */}
          <div className="flex items-center gap-4">
            <Link to="/employee/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <span
                className={cn(
                  "text-xl font-bold bg-clip-text text-transparent hidden sm:block",
                  isDark
                    ? "bg-gradient-to-r from-white to-white/60"
                    : "bg-gradient-to-r from-slate-900 to-slate-600"
                )}
              >
                InnovateX
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1 ml-4">
              <Link
                to="/employee/dashboard"
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  isActive("/employee/dashboard")
                    ? isDark
                      ? "bg-white/10 text-white"
                      : "bg-slate-100 text-slate-900"
                    : isDark
                    ? "text-white/60 hover:text-white hover:bg-white/5"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                <Home className="w-4 h-4" />
                Home
              </Link>
              <Link
                to="/employee/ideas"
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  isActive("/employee/ideas")
                    ? isDark
                      ? "bg-white/10 text-white"
                      : "bg-slate-100 text-slate-900"
                    : isDark
                    ? "text-white/60 hover:text-white hover:bg-white/5"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                <FolderOpen className="w-4 h-4" />
                My Ideas
              </Link>
              <Link
                to="/employee/leaderboard"
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  isActive("/employee/leaderboard")
                    ? isDark
                      ? "bg-white/10 text-white"
                      : "bg-slate-100 text-slate-900"
                    : isDark
                    ? "text-white/60 hover:text-white hover:bg-white/5"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                <Trophy className="w-4 h-4" />
                Leaderboard
              </Link>
            </div>
          </div>

          {/* Center - Search */}
          {showSearch && (
            <div className="hidden lg:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search
                  className={cn(
                    "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4",
                    isDark ? "text-white/40" : "text-slate-400"
                  )}
                />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className={cn(
                    "w-full pl-10 pr-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm border",
                    isDark
                      ? "bg-white/5 border-white/10 text-white placeholder-white/40"
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                  )}
                />
              </div>
            </div>
          )}

          {/* Right side - Actions */}
          <div className="flex items-center gap-3">
            {/* Points Badge */}
            <div
              className={cn(
                "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border",
                isDark
                  ? "bg-yellow-500/10 border-yellow-500/20"
                  : "bg-yellow-50 border-yellow-200"
              )}
            >
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span
                className={cn(
                  "font-semibold text-sm",
                  isDark ? "text-yellow-400" : "text-yellow-600"
                )}
              >
                {user?.totalPoints || 0} pts
              </span>
            </div>

            <ThemeToggle />

            <button
              className={cn(
                "relative p-2 rounded-xl transition-all",
                isDark ? "hover:bg-white/5" : "hover:bg-slate-100"
              )}
            >
              <Bell
                className={cn(
                  "w-5 h-5",
                  isDark ? "text-white/60" : "text-slate-500"
                )}
              />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={cn(
                  "flex items-center gap-2 p-1 rounded-xl transition-all",
                  isDark ? "hover:bg-white/5" : "hover:bg-slate-100"
                )}
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white">
                  {generateInitials(user?.name || "")}
                </div>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 hidden sm:block transition-transform",
                    showUserMenu && "rotate-180",
                    isDark ? "text-white/60" : "text-slate-500"
                  )}
                />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div
                    className={cn(
                      "absolute right-0 top-full mt-2 w-56 rounded-xl border shadow-xl z-50 overflow-hidden",
                      isDark
                        ? "bg-slate-900 border-white/10"
                        : "bg-white border-slate-200"
                    )}
                  >
                    <div
                      className={cn(
                        "px-4 py-3 border-b",
                        isDark ? "border-white/10" : "border-slate-100"
                      )}
                    >
                      <p
                        className={cn(
                          "font-medium text-sm",
                          isDark ? "text-white" : "text-slate-900"
                        )}
                      >
                        {user?.name}
                      </p>
                      <p
                        className={cn(
                          "text-xs",
                          isDark ? "text-white/50" : "text-slate-500"
                        )}
                      >
                        {user?.email}
                      </p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/employee/profile"
                        onClick={() => setShowUserMenu(false)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                          isDark
                            ? "text-white/70 hover:text-white hover:bg-white/5"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        )}
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                        }}
                        className={cn(
                          "flex items-center gap-3 px-4 py-2.5 text-sm w-full transition-colors",
                          isDark
                            ? "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            : "text-red-600 hover:text-red-700 hover:bg-red-50"
                        )}
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
