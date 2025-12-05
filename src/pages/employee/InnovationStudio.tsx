import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useThemeStore } from "@/stores/themeStore";
import { analyticsApi, ideasApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Plus,
  Sparkles,
  Trophy,
  TrendingUp,
  FileText,
  Clock,
  CheckCircle,
  Star,
  ArrowRight,
  Lightbulb,
  Users,
  Target,
  Zap,
  Gift,
  Crown,
  ChevronRight,
  BarChart3,
  Rocket,
} from "lucide-react";
import { motion } from "framer-motion";

// Idea status colors for the stack visualization
const statusColors = {
  DRAFT: {
    bg: "bg-slate-200 dark:bg-slate-700",
    text: "text-slate-700 dark:text-slate-300",
    label: "Draft",
  },
  SUBMITTED: {
    bg: "bg-blue-200 dark:bg-blue-900",
    text: "text-blue-700 dark:text-blue-300",
    label: "Under Review",
  },
  UNDER_REVIEW: {
    bg: "bg-yellow-200 dark:bg-yellow-900",
    text: "text-yellow-700 dark:text-yellow-300",
    label: "Reviewing",
  },
  SHORTLISTED: {
    bg: "bg-purple-200 dark:bg-purple-900",
    text: "text-purple-700 dark:text-purple-300",
    label: "Shortlisted",
  },
  APPROVED: {
    bg: "bg-green-200 dark:bg-green-900",
    text: "text-green-700 dark:text-green-300",
    label: "Approved",
  },
  REJECTED: {
    bg: "bg-red-200 dark:bg-red-900",
    text: "text-red-700 dark:text-red-300",
    label: "Rejected",
  },
  NEEDS_REVISION: {
    bg: "bg-orange-200 dark:bg-orange-900",
    text: "text-orange-700 dark:text-orange-300",
    label: "Needs Revision",
  },
};

export default function InnovationStudio() {
  const { user } = useAuthStore();
  useThemeStore(); // Initialize theme
  const navigate = useNavigate();

  const { data: stats } = useQuery({
    queryKey: ["employee-stats"],
    queryFn: () => analyticsApi.getEmployeeStats().then((res) => res.data),
  });

  const { data: recentIdeas } = useQuery({
    queryKey: ["my-ideas", { limit: 6 }],
    queryFn: () => ideasApi.getMy({ limit: 6 }).then((res) => res.data),
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-amber-400/10 dark:bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        className="relative max-w-7xl mx-auto px-4 py-8 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
              Innovation Studio
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Welcome back, {user?.name?.split(" ")[0]}! Ready to innovate?
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/employee/ideas/new">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all"
              >
                <Plus className="w-5 h-5" />
                <span className="font-semibold">New Idea</span>
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            {
              label: "Total Ideas",
              value: stats?.totalIdeas || 0,
              icon: Lightbulb,
              color: "blue",
            },
            {
              label: "Approved",
              value: stats?.approved || 0,
              icon: CheckCircle,
              color: "green",
            },
            {
              label: "In Review",
              value: stats?.submitted || 0,
              icon: Clock,
              color: "amber",
            },
            {
              label: "Points Earned",
              value: stats?.totalPoints || 0,
              icon: Trophy,
              color: "purple",
            },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ y: -4 }}
              className={cn(
                "relative overflow-hidden p-5 rounded-2xl border transition-all",
                "bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm",
                "border-slate-200/50 dark:border-slate-700/50",
                "hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600"
              )}
            >
              <div
                className={cn(
                  "absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 rounded-full opacity-10",
                  stat.color === "blue" && "bg-blue-500",
                  stat.color === "green" && "bg-green-500",
                  stat.color === "amber" && "bg-amber-500",
                  stat.color === "purple" && "bg-purple-500"
                )}
              />
              <stat.icon
                className={cn(
                  "w-6 h-6 mb-3",
                  stat.color === "blue" && "text-blue-500",
                  stat.color === "green" && "text-green-500",
                  stat.color === "amber" && "text-amber-500",
                  stat.color === "purple" && "text-purple-500"
                )}
              />
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {stat.value}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Drafting Pad - Main CTA */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 p-8 text-white">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <pattern
                      id="grid"
                      width="10"
                      height="10"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 10 0 L 0 0 0 10"
                        fill="none"
                        stroke="white"
                        strokeWidth="0.5"
                      />
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill="url(#grid)" />
                </svg>
              </div>

              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Drafting Pad</h2>
                    <p className="text-blue-100 max-w-md">
                      Your creative workspace to sketch, brainstorm, and develop
                      innovative ideas with our Miro-like canvas.
                    </p>
                  </div>
                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">AI Powered</span>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-4">
                  <Link to="/employee/ideas/new">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      <Rocket className="w-5 h-5" />
                      Start Creating
                    </motion.button>
                  </Link>
                  <Link to="/employee/ideas">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 px-6 py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-all"
                    >
                      <FileText className="w-5 h-5" />
                      View My Ideas
                    </motion.button>
                  </Link>
                </div>

                {/* Quick tips */}
                <div className="mt-8 grid grid-cols-3 gap-4">
                  {[
                    { icon: Target, text: "Align with company goals" },
                    { icon: Users, text: "Collaborate with team" },
                    { icon: Zap, text: "Get AI suggestions" },
                  ].map((tip, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm text-blue-100"
                    >
                      <tip.icon className="w-4 h-4 flex-shrink-0" />
                      <span>{tip.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* My Idea Stack */}
          <motion.div variants={itemVariants}>
            <div className="h-full rounded-3xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  My Idea Stack
                </h3>
                <Link
                  to="/employee/ideas"
                  className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
                >
                  View all <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Status legend */}
              <div className="flex flex-wrap gap-2 mb-6">
                {Object.entries(statusColors)
                  .slice(0, 4)
                  .map(([key, value]) => (
                    <div
                      key={key}
                      className={cn(
                        "px-2 py-1 rounded-lg text-xs font-medium",
                        value.bg,
                        value.text
                      )}
                    >
                      {value.label}
                    </div>
                  ))}
              </div>

              {/* Ideas list */}
              <div className="space-y-3">
                {recentIdeas?.data
                  ?.slice(0, 4)
                  .map((idea: any, index: number) => {
                    const status =
                      statusColors[idea.status as keyof typeof statusColors] ||
                      statusColors.DRAFT;
                    return (
                      <motion.div
                        key={idea.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => navigate(`/employee/ideas/${idea.id}`)}
                        className={cn(
                          "p-4 rounded-xl cursor-pointer transition-all",
                          "hover:shadow-md hover:-translate-y-0.5",
                          status.bg
                        )}
                      >
                        <h4 className={cn("font-medium truncate", status.text)}>
                          {idea.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                          {idea.summary}
                        </p>
                      </motion.div>
                    );
                  })}

                {(!recentIdeas?.data || recentIdeas.data.length === 0) && (
                  <div className="text-center py-8">
                    <Lightbulb className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      No ideas yet
                    </p>
                    <Link
                      to="/employee/ideas/new"
                      className="text-blue-500 text-sm hover:underline"
                    >
                      Create your first idea
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Culture & Stats Wall */}
          <motion.div variants={itemVariants}>
            <div className="rounded-3xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                Culture & Stats Wall
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Leaderboard Podium */}
                <div className="col-span-2 p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/50 dark:border-amber-800/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        Leaderboard
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Top innovators this month
                      </p>
                    </div>
                  </div>
                  <Link to="/leaderboard">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      className="w-full py-2 bg-white dark:bg-slate-800 rounded-xl text-sm font-medium text-amber-600 dark:text-amber-400 hover:shadow-md transition-all"
                    >
                      View Leaderboard
                    </motion.button>
                  </Link>
                </div>

                {/* Rewards */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200/50 dark:border-purple-800/50">
                  <Gift className="w-8 h-8 text-purple-500 mb-2" />
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    Rewards
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {stats?.totalPoints || 0} points to redeem
                  </p>
                </div>

                {/* Success Rate */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/50 dark:border-green-800/50">
                  <TrendingUp className="w-8 h-8 text-green-500 mb-2" />
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    {stats?.successRate || 0}%
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Success rate
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Innovation Flow */}
          <motion.div variants={itemVariants}>
            <div className="rounded-3xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                Innovation Flow
              </h3>

              {/* Flow visualization */}
              <div className="relative">
                <div className="flex items-center justify-between">
                  {[
                    {
                      label: "Draft",
                      icon: FileText,
                      count: stats?.drafts || 0,
                    },
                    {
                      label: "Review",
                      icon: Clock,
                      count: stats?.submitted || 0,
                    },
                    {
                      label: "Shortlisted",
                      icon: Star,
                      count: stats?.shortlisted || 0,
                    },
                    {
                      label: "Approved",
                      icon: CheckCircle,
                      count: stats?.approved || 0,
                    },
                  ].map((step, index) => (
                    <div
                      key={step.label}
                      className="flex flex-col items-center relative z-10"
                    >
                      <div
                        className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center mb-2",
                          index === 0 &&
                            "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
                          index === 1 &&
                            "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400",
                          index === 2 &&
                            "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400",
                          index === 3 &&
                            "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400"
                        )}
                      >
                        <step.icon className="w-5 h-5" />
                      </div>
                      <span className="text-2xl font-bold text-slate-900 dark:text-white">
                        {step.count}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Connecting line */}
                <div className="absolute top-6 left-8 right-8 h-0.5 bg-gradient-to-r from-slate-200 via-purple-300 to-green-200 dark:from-slate-700 dark:via-purple-700 dark:to-green-800" />
              </div>

              {/* Quick action */}
              <div className="mt-8 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-slate-500" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Track your innovation journey
                    </span>
                  </div>
                  <Link to="/employee/ideas">
                    <ArrowRight className="w-5 h-5 text-blue-500" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
