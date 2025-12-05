import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useThemeStore } from "@/stores/themeStore";
import { authApi, ideasApi } from "@/lib/api";
import { generateInitials, getRoleLabel, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Building2,
  Trophy,
  Lightbulb,
  FolderOpen,
  ArrowLeft,
  Award,
  Target,
  Edit3,
  Shield,
  Briefcase,
  ChevronRight,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export default function Profile() {
  const { user: authUser, updateUser } = useAuthStore();
  const { theme } = useThemeStore();
  const navigate = useNavigate();

  const isDark = theme === "dark";

  // Fetch fresh profile data from API
  const { data: profileData, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => authApi.getProfile().then((res) => res.data),
    enabled: !!authUser,
  });

  // Fetch user's ideas stats
  const { data: ideasData } = useQuery({
    queryKey: ["my-ideas-stats"],
    queryFn: () => ideasApi.getMy({ limit: 100 }).then((res) => res.data),
    enabled: !!authUser,
  });

  // Update auth store with fresh data
  useEffect(() => {
    if (profileData) {
      updateUser(profileData);
    }
  }, [profileData, updateUser]);

  const user = profileData || authUser;

  // Calculate stats
  const stats = {
    totalIdeas: ideasData?.data?.length || 0,
    approved:
      ideasData?.data?.filter((i: any) => i.status === "APPROVED").length || 0,
    pending:
      ideasData?.data?.filter((i: any) =>
        ["SUBMITTED", "UNDER_REVIEW"].includes(i.status)
      ).length || 0,
    drafts:
      ideasData?.data?.filter((i: any) => i.status === "DRAFT").length || 0,
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          "min-h-screen flex items-center justify-center",
          isDark
            ? "bg-[#0a0a1a]"
            : "bg-gradient-to-br from-slate-50 via-white to-blue-50"
        )}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Lightbulb className="w-12 h-12 text-yellow-400" />
        </motion.div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div
      className={cn(
        "min-h-screen transition-colors duration-300",
        isDark
          ? "bg-[#0a0a1a] text-white"
          : "bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900"
      )}
    >
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className={cn(
            "absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full blur-[120px] animate-pulse",
            isDark ? "bg-purple-600/10" : "bg-purple-400/20"
          )}
        />
        <div
          className={cn(
            "absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[100px] animate-pulse",
            isDark ? "bg-blue-600/10" : "bg-blue-400/15"
          )}
          style={{ animationDelay: "1s" }}
        />
      </div>

      {/* Main Content */}
      <main className="relative pt-24 pb-12 px-4 sm:px-6 max-w-[1400px] mx-auto">
        {/* Back button & Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className={cn(
              "flex items-center gap-2 mb-4 text-sm font-medium transition-colors",
              isDark
                ? "text-white/60 hover:text-white"
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </motion.div>

        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cn(
            "relative overflow-hidden rounded-3xl border mb-8",
            isDark
              ? "bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10"
              : "bg-white border-slate-200 shadow-xl shadow-slate-200/50"
          )}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-50">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl" />
          </div>

          <div className="relative p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-1 shadow-xl shadow-purple-500/25">
                  <div
                    className={cn(
                      "w-full h-full rounded-xl flex items-center justify-center text-3xl font-bold",
                      isDark
                        ? "bg-slate-900 text-white"
                        : "bg-white text-slate-900"
                    )}
                  >
                    {generateInitials(user.name)}
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shadow-lg">
                  <div className="w-3 h-3 bg-white rounded-full" />
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h1
                  className={cn(
                    "text-3xl font-bold mb-2",
                    isDark ? "text-white" : "text-slate-900"
                  )}
                >
                  {user.name}
                </h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium",
                      isDark
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : "bg-purple-100 text-purple-700 border border-purple-200"
                    )}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    {getRoleLabel(user.role)}
                  </span>
                  {user.department && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm",
                        isDark
                          ? "bg-white/5 text-white/60 border border-white/10"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      )}
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      {user.department.name}
                    </span>
                  )}
                </div>
                <p
                  className={cn(
                    "text-sm",
                    isDark ? "text-white/50" : "text-slate-500"
                  )}
                >
                  Member since {formatDate(user.createdAt)}
                </p>
              </div>

              {/* Points Card */}
              <div
                className={cn(
                  "flex flex-col items-center p-6 rounded-2xl border",
                  isDark
                    ? "bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20"
                    : "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200"
                )}
              >
                <Trophy className="w-10 h-10 text-yellow-500 mb-2" />
                <span
                  className={cn(
                    "text-3xl font-bold",
                    isDark ? "text-yellow-400" : "text-yellow-600"
                  )}
                >
                  {user.totalPoints || 0}
                </span>
                <span
                  className={cn(
                    "text-sm",
                    isDark ? "text-yellow-400/60" : "text-yellow-600/80"
                  )}
                >
                  Total Points
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {[
            {
              label: "Total Ideas",
              value: stats.totalIdeas,
              icon: Lightbulb,
              color: "blue",
            },
            {
              label: "Approved",
              value: stats.approved,
              icon: Award,
              color: "green",
            },
            {
              label: "Pending Review",
              value: stats.pending,
              icon: Target,
              color: "yellow",
            },
            {
              label: "Drafts",
              value: stats.drafts,
              icon: Edit3,
              color: "slate",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={cn(
                "p-5 rounded-2xl border transition-all hover:scale-[1.02]",
                isDark
                  ? "bg-white/5 border-white/10 hover:border-white/20"
                  : "bg-white border-slate-200 hover:shadow-lg"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center mb-3",
                  stat.color === "blue" &&
                    (isDark ? "bg-blue-500/20" : "bg-blue-100"),
                  stat.color === "green" &&
                    (isDark ? "bg-green-500/20" : "bg-green-100"),
                  stat.color === "yellow" &&
                    (isDark ? "bg-yellow-500/20" : "bg-yellow-100"),
                  stat.color === "slate" &&
                    (isDark ? "bg-slate-500/20" : "bg-slate-100")
                )}
              >
                <stat.icon
                  className={cn(
                    "w-5 h-5",
                    stat.color === "blue" && "text-blue-500",
                    stat.color === "green" && "text-green-500",
                    stat.color === "yellow" && "text-yellow-500",
                    stat.color === "slate" &&
                      (isDark ? "text-slate-400" : "text-slate-500")
                  )}
                />
              </div>
              <p
                className={cn(
                  "text-2xl font-bold mb-1",
                  isDark ? "text-white" : "text-slate-900"
                )}
              >
                {stat.value}
              </p>
              <p
                className={cn(
                  "text-sm",
                  isDark ? "text-white/50" : "text-slate-500"
                )}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={cn(
              "p-6 rounded-2xl border",
              isDark
                ? "bg-white/5 border-white/10"
                : "bg-white border-slate-200"
            )}
          >
            <h3
              className={cn(
                "text-lg font-semibold mb-4 flex items-center gap-2",
                isDark ? "text-white" : "text-slate-900"
              )}
            >
              <User className="w-5 h-5" />
              Contact Information
            </h3>
            <div className="space-y-4">
              <div
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl",
                  isDark ? "bg-white/5" : "bg-slate-50"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    isDark ? "bg-blue-500/20" : "bg-blue-100"
                  )}
                >
                  <Mail className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p
                    className={cn(
                      "text-xs uppercase tracking-wider mb-0.5",
                      isDark ? "text-white/40" : "text-slate-400"
                    )}
                  >
                    Email Address
                  </p>
                  <p
                    className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-slate-900"
                    )}
                  >
                    {user.email}
                  </p>
                </div>
              </div>

              {user.organisation && (
                <div
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl",
                    isDark ? "bg-white/5" : "bg-slate-50"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      isDark ? "bg-purple-500/20" : "bg-purple-100"
                    )}
                  >
                    <Building2 className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p
                      className={cn(
                        "text-xs uppercase tracking-wider mb-0.5",
                        isDark ? "text-white/40" : "text-slate-400"
                      )}
                    >
                      Organisation
                    </p>
                    <p
                      className={cn(
                        "font-medium",
                        isDark ? "text-white" : "text-slate-900"
                      )}
                    >
                      {user.organisation.name}
                    </p>
                  </div>
                </div>
              )}

              {user.department && (
                <div
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl",
                    isDark ? "bg-white/5" : "bg-slate-50"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      isDark ? "bg-green-500/20" : "bg-green-100"
                    )}
                  >
                    <Briefcase className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p
                      className={cn(
                        "text-xs uppercase tracking-wider mb-0.5",
                        isDark ? "text-white/40" : "text-slate-400"
                      )}
                    >
                      Department
                    </p>
                    <p
                      className={cn(
                        "font-medium",
                        isDark ? "text-white" : "text-slate-900"
                      )}
                    >
                      {user.department.name}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={cn(
              "p-6 rounded-2xl border",
              isDark
                ? "bg-white/5 border-white/10"
                : "bg-white border-slate-200"
            )}
          >
            <h3
              className={cn(
                "text-lg font-semibold mb-4 flex items-center gap-2",
                isDark ? "text-white" : "text-slate-900"
              )}
            >
              <Sparkles className="w-5 h-5" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link
                to="/employee/ideas/new"
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl transition-all group",
                  isDark
                    ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border border-blue-500/20"
                    : "bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border border-blue-200"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p
                      className={cn(
                        "font-medium",
                        isDark ? "text-white" : "text-slate-900"
                      )}
                    >
                      Create New Idea
                    </p>
                    <p
                      className={cn(
                        "text-sm",
                        isDark ? "text-white/50" : "text-slate-500"
                      )}
                    >
                      Share your innovation
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className={cn(
                    "w-5 h-5 transition-transform group-hover:translate-x-1",
                    isDark ? "text-white/40" : "text-slate-400"
                  )}
                />
              </Link>

              <Link
                to="/employee/ideas"
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl transition-all group",
                  isDark
                    ? "bg-white/5 hover:bg-white/10 border border-white/10"
                    : "bg-slate-50 hover:bg-slate-100 border border-slate-200"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      isDark ? "bg-white/10" : "bg-slate-200"
                    )}
                  >
                    <FolderOpen
                      className={cn(
                        "w-5 h-5",
                        isDark ? "text-white/60" : "text-slate-600"
                      )}
                    />
                  </div>
                  <div>
                    <p
                      className={cn(
                        "font-medium",
                        isDark ? "text-white" : "text-slate-900"
                      )}
                    >
                      View My Ideas
                    </p>
                    <p
                      className={cn(
                        "text-sm",
                        isDark ? "text-white/50" : "text-slate-500"
                      )}
                    >
                      Manage your submissions
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className={cn(
                    "w-5 h-5 transition-transform group-hover:translate-x-1",
                    isDark ? "text-white/40" : "text-slate-400"
                  )}
                />
              </Link>

              <Link
                to="/leaderboard"
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl transition-all group",
                  isDark
                    ? "bg-white/5 hover:bg-white/10 border border-white/10"
                    : "bg-slate-50 hover:bg-slate-100 border border-slate-200"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      isDark ? "bg-yellow-500/20" : "bg-yellow-100"
                    )}
                  >
                    <TrendingUp className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <p
                      className={cn(
                        "font-medium",
                        isDark ? "text-white" : "text-slate-900"
                      )}
                    >
                      Leaderboard
                    </p>
                    <p
                      className={cn(
                        "text-sm",
                        isDark ? "text-white/50" : "text-slate-500"
                      )}
                    >
                      See top innovators
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className={cn(
                    "w-5 h-5 transition-transform group-hover:translate-x-1",
                    isDark ? "text-white/40" : "text-slate-400"
                  )}
                />
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
