import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ideasApi } from "@/lib/api";
import { getStatusLabel, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/stores/themeStore";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Lightbulb,
  Edit3,
  Trash2,
  Calendar,
  Tag,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Filter,
  Grid3X3,
  List,
} from "lucide-react";

// Status configuration
const statusConfig = {
  DRAFT: {
    color:
      "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    icon: "📝",
    gradient:
      "from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900",
  },
  SUBMITTED: {
    color:
      "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    icon: "📤",
    gradient:
      "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30",
  },
  UNDER_REVIEW: {
    color:
      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
    icon: "🔍",
    gradient:
      "from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/30",
  },
  SHORTLISTED: {
    color:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    icon: "⭐",
    gradient:
      "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30",
  },
  APPROVED: {
    color:
      "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
    icon: "✅",
    gradient:
      "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30",
  },
  REJECTED: {
    color:
      "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
    icon: "❌",
    gradient: "from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/30",
  },
  NEEDS_REVISION: {
    color:
      "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800",
    icon: "🔄",
    gradient:
      "from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/30",
  },
};

type ViewMode = "grid" | "list";

export default function MyIdeasNew() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useThemeStore(); // Initialize theme

  const { data: ideas, isLoading } = useQuery({
    queryKey: ["my-ideas", { search, status: statusFilter }],
    queryFn: () =>
      ideasApi
        .getMy({ search, status: statusFilter || undefined })
        .then((res) => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ideasApi.delete(id),
    onSuccess: () => {
      toast.success("Idea deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["my-ideas"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete idea");
    },
  });

  const handleDelete = (e: React.MouseEvent, id: string, title: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const statuses = [
    "DRAFT",
    "SUBMITTED",
    "UNDER_REVIEW",
    "SHORTLISTED",
    "APPROVED",
    "REJECTED",
    "NEEDS_REVISION",
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-yellow-500" />
              My Ideas
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Your creative space for innovation
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/employee/ideas/new">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all font-medium"
              >
                <Plus className="w-5 h-5" />
                New Idea
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search your ideas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* View toggle & Filter button */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    viewMode === "grid"
                      ? "bg-white dark:bg-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  )}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    viewMode === "list"
                      ? "bg-white dark:bg-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  )}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all",
                  showFilters
                    ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300"
                )}
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filters</span>
                {statusFilter && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </button>
            </div>
          </div>

          {/* Filter chips */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setStatusFilter("")}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                      statusFilter === ""
                        ? "bg-blue-500 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                    )}
                  >
                    All
                  </button>
                  {statuses.map((status) => {
                    const config =
                      statusConfig[status as keyof typeof statusConfig];
                    return (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                          statusFilter === status
                            ? "bg-blue-500 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                        )}
                      >
                        <span>{config.icon}</span>
                        {getStatusLabel(status)}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Ideas Grid/List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Lightbulb className="w-12 h-12 text-yellow-400" />
              </motion.div>
              <p className="text-slate-500 dark:text-slate-400">
                Loading your ideas...
              </p>
            </div>
          </div>
        ) : ideas?.data?.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                : "flex flex-col gap-3"
            )}
          >
            {ideas.data.map((idea: any) => {
              const config =
                statusConfig[idea.status as keyof typeof statusConfig] ||
                statusConfig.DRAFT;

              if (viewMode === "list") {
                return (
                  <motion.div
                    key={idea.id}
                    variants={itemVariants}
                    onClick={() => navigate(`/employee/ideas/${idea.id}`)}
                    className="group flex items-center gap-4 p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 cursor-pointer hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                  >
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
                        config.color
                      )}
                    >
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {idea.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        {idea.summary}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={config.color}>
                        {getStatusLabel(idea.status)}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        {formatDate(idea.createdAt)}
                      </span>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={idea.id}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  onClick={() => navigate(`/employee/ideas/${idea.id}`)}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border cursor-pointer transition-all",
                    "bg-gradient-to-br",
                    config.gradient,
                    "border-slate-200/50 dark:border-slate-700/50",
                    "hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700"
                  )}
                >
                  {/* Card content */}
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <Badge className={cn(config.color, "border")}>
                        <span className="mr-1">{config.icon}</span>
                        {getStatusLabel(idea.status)}
                      </Badge>

                      {/* Actions */}
                      {(idea.status === "DRAFT" ||
                        idea.status === "NEEDS_REVISION") && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/employee/ideas/${idea.id}/edit`);
                            }}
                            className="p-1.5 bg-white/80 dark:bg-slate-800/80 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {idea.status === "DRAFT" && (
                            <button
                              onClick={(e) =>
                                handleDelete(e, idea.id, idea.title)
                              }
                              className="p-1.5 bg-white/80 dark:bg-slate-800/80 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 text-slate-600 dark:text-slate-400 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {idea.title}
                    </h3>

                    {/* Summary */}
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
                      {idea.summary}
                    </p>

                    {/* Tags */}
                    {idea.tags && idea.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {idea.tags.slice(0, 3).map((tag: string) => (
                          <span
                            key={tag}
                            className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400"
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                        {idea.tags.length > 3 && (
                          <span className="text-xs text-slate-500">
                            +{idea.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Revision notice */}
                    {idea.status === "NEEDS_REVISION" && (
                      <div className="flex items-center gap-2 text-xs text-orange-700 dark:text-orange-400 bg-orange-100/50 dark:bg-orange-900/30 rounded-lg px-3 py-2 mb-3">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <span className="line-clamp-1">
                          {idea.reviewNotes || "Revision required"}
                        </span>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
                      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(idea.createdAt)}</span>
                      </div>

                      {idea.domain && (
                        <span className="text-xs px-2 py-0.5 bg-white/60 dark:bg-slate-800/60 rounded-full text-slate-600 dark:text-slate-400">
                          {idea.domain.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Hover arrow */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-5 h-5 text-blue-500" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="relative mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-3xl rotate-6" />
              <div className="absolute inset-0 w-24 h-24 bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center">
                <Lightbulb className="w-10 h-10 text-slate-300 dark:text-slate-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              {search || statusFilter ? "No ideas found" : "No ideas yet"}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-center mb-6 max-w-sm">
              {search || statusFilter
                ? "Try adjusting your search or filters"
                : "Every great innovation starts with a single idea. Share yours today!"}
            </p>
            <Link to="/employee/ideas/new">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl shadow-lg font-medium"
              >
                <Sparkles className="w-5 h-5" />
                Create Your First Idea
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
