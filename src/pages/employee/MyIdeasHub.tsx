import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useThemeStore } from "@/stores/themeStore";
import { ideasApi } from "@/lib/api";
import { getStatusLabel, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
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
  ArrowLeft,
} from "lucide-react";

// Status styles with light/dark mode support
const statusStyles: Record<
  string,
  { bg: string; border: string; text: string; icon: string }
> = {
  DRAFT: {
    bg: "bg-slate-100 dark:bg-slate-500/20",
    border: "border-slate-200 dark:border-slate-500/30",
    text: "text-slate-600 dark:text-slate-300",
    icon: "📝",
  },
  SUBMITTED: {
    bg: "bg-blue-100 dark:bg-blue-500/20",
    border: "border-blue-200 dark:border-blue-500/30",
    text: "text-blue-600 dark:text-blue-300",
    icon: "📤",
  },
  UNDER_REVIEW: {
    bg: "bg-yellow-100 dark:bg-yellow-500/20",
    border: "border-yellow-200 dark:border-yellow-500/30",
    text: "text-yellow-600 dark:text-yellow-300",
    icon: "🔍",
  },
  SHORTLISTED: {
    bg: "bg-purple-100 dark:bg-purple-500/20",
    border: "border-purple-200 dark:border-purple-500/30",
    text: "text-purple-600 dark:text-purple-300",
    icon: "⭐",
  },
  APPROVED: {
    bg: "bg-green-100 dark:bg-green-500/20",
    border: "border-green-200 dark:border-green-500/30",
    text: "text-green-600 dark:text-green-300",
    icon: "✅",
  },
  REJECTED: {
    bg: "bg-red-100 dark:bg-red-500/20",
    border: "border-red-200 dark:border-red-500/30",
    text: "text-red-600 dark:text-red-300",
    icon: "❌",
  },
  NEEDS_REVISION: {
    bg: "bg-orange-100 dark:bg-orange-500/20",
    border: "border-orange-200 dark:border-orange-500/30",
    text: "text-orange-600 dark:text-orange-300",
    icon: "🔄",
  },
};

type ViewMode = "grid" | "list";

export default function MyIdeasHub() {
  const { theme } = useThemeStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    ideaId: string;
    ideaTitle: string;
  }>({ isOpen: false, ideaId: "", ideaTitle: "" });

  const isDark = theme === "dark";

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
      setDeleteModal({ isOpen: false, ideaId: "", ideaTitle: "" });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete idea");
    },
  });

  const handleDeleteClick = (
    e: React.MouseEvent,
    id: string,
    title: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteModal({ isOpen: true, ideaId: id, ideaTitle: title });
  };

  const handleConfirmDelete = () => {
    if (deleteModal.ideaId) {
      deleteMutation.mutate(deleteModal.ideaId);
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
            "absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px] animate-pulse",
            isDark ? "bg-purple-600/10" : "bg-purple-400/20"
          )}
        />
        <div
          className={cn(
            "absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[100px] animate-pulse",
            isDark ? "bg-blue-600/10" : "bg-blue-400/15"
          )}
          style={{ animationDelay: "1s" }}
        />
        {isDark && (
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
            }}
          />
        )}
      </div>

      {/* Main Content */}
      <main className="relative pt-24 pb-12 px-4 sm:px-6 max-w-[1800px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/employee/dashboard")}
              className={cn(
                "p-2 rounded-xl transition-all",
                isDark ? "hover:bg-white/5" : "hover:bg-slate-100"
              )}
            >
              <ArrowLeft
                className={cn(
                  "w-5 h-5",
                  isDark ? "text-white/60" : "text-slate-500"
                )}
              />
            </button>
            <div>
              <h1
                className={cn(
                  "text-3xl font-bold flex items-center gap-3",
                  isDark ? "text-white" : "text-slate-900"
                )}
              >
                <Sparkles className="w-8 h-8 text-yellow-400" />
                My Ideas
              </h1>
              <p
                className={cn(
                  "mt-1",
                  isDark ? "text-white/50" : "text-slate-500"
                )}
              >
                {ideas?.data?.length || 0} ideas in your collection
              </p>
            </div>
          </div>

          <Link to="/employee/ideas/new">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl shadow-lg shadow-purple-500/25 font-semibold"
            >
              <Plus className="w-5 h-5" />
              New Idea
            </motion.button>
          </Link>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cn(
            "backdrop-blur-sm rounded-2xl border p-4 mb-6",
            isDark ? "bg-white/5 border-white/5" : "bg-white border-slate-200"
          )}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                className={cn(
                  "absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5",
                  isDark ? "text-white/40" : "text-slate-400"
                )}
              />
              <input
                type="text"
                placeholder="Search your ideas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cn(
                  "w-full pl-12 pr-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/50 transition-all border",
                  isDark
                    ? "bg-white/5 border-white/10 text-white placeholder-white/40"
                    : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                )}
              />
            </div>

            {/* View toggle & Filter */}
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex items-center rounded-xl p-1 border",
                  isDark
                    ? "bg-white/5 border-white/5"
                    : "bg-slate-100 border-slate-200"
                )}
              >
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    viewMode === "grid"
                      ? isDark
                        ? "bg-white/10 text-white"
                        : "bg-white text-slate-900 shadow-sm"
                      : isDark
                      ? "text-white/40 hover:text-white"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    viewMode === "list"
                      ? isDark
                        ? "bg-white/10 text-white"
                        : "bg-white text-slate-900 shadow-sm"
                      : isDark
                      ? "text-white/40 hover:text-white"
                      : "text-slate-500 hover:text-slate-700"
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
                    ? "bg-purple-500/20 border-purple-500/30 text-purple-300"
                    : isDark
                    ? "bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/20"
                    : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300"
                )}
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filters</span>
                {statusFilter && (
                  <span className="w-2 h-2 bg-purple-500 rounded-full" />
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
                <div
                  className={cn(
                    "flex flex-wrap gap-2 pt-4 mt-4 border-t",
                    isDark ? "border-white/5" : "border-slate-200"
                  )}
                >
                  <button
                    onClick={() => setStatusFilter("")}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                      statusFilter === ""
                        ? "bg-purple-500 text-white"
                        : isDark
                        ? "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                    )}
                  >
                    All
                  </button>
                  {statuses.map((status) => {
                    const style = statusStyles[status];
                    return (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                          statusFilter === status
                            ? "bg-purple-500 text-white"
                            : isDark
                            ? "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                        )}
                      >
                        <span>{style.icon}</span>
                        {getStatusLabel(status)}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Ideas Grid/List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Lightbulb className="w-12 h-12 text-yellow-400" />
            </motion.div>
          </div>
        ) : ideas?.data?.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                : "flex flex-col gap-3"
            )}
          >
            {ideas.data.map((idea: any, index: number) => {
              const style = statusStyles[idea.status] || statusStyles.DRAFT;

              if (viewMode === "list") {
                return (
                  <motion.div
                    key={idea.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() =>
                      navigate(`/employee/ideas/${idea.id}/preview`)
                    }
                    className={cn(
                      "group flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.01]",
                      isDark
                        ? "bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/[0.07]"
                        : "bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md"
                    )}
                  >
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center text-2xl border",
                        style.bg,
                        style.border
                      )}
                    >
                      {style.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className={cn(
                          "font-semibold truncate transition-colors",
                          isDark
                            ? "text-white group-hover:text-purple-300"
                            : "text-slate-900 group-hover:text-blue-600"
                        )}
                      >
                        {idea.title}
                      </h3>
                      <p
                        className={cn(
                          "text-sm truncate",
                          isDark ? "text-white/40" : "text-slate-500"
                        )}
                      >
                        {idea.summary}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Edit & Delete buttons for list view */}
                      {(idea.status === "DRAFT" ||
                        idea.status === "NEEDS_REVISION") && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/employee/ideas/${idea.id}/edit`);
                            }}
                            className={cn(
                              "p-1.5 rounded-lg transition-colors",
                              isDark
                                ? "bg-white/10 hover:bg-blue-500/30 text-white/60 hover:text-blue-300"
                                : "bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-600"
                            )}
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {idea.status === "DRAFT" && (
                            <button
                              onClick={(e) =>
                                handleDeleteClick(e, idea.id, idea.title)
                              }
                              className={cn(
                                "p-1.5 rounded-lg transition-colors",
                                isDark
                                  ? "bg-white/10 hover:bg-red-500/30 text-white/60 hover:text-red-300"
                                  : "bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-600"
                              )}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                      <span
                        className={cn(
                          "px-2 py-1 rounded-lg text-xs font-medium border",
                          style.bg,
                          style.text,
                          style.border
                        )}
                      >
                        {getStatusLabel(idea.status)}
                      </span>
                      <span
                        className={cn(
                          "text-xs",
                          isDark ? "text-white/30" : "text-slate-400"
                        )}
                      >
                        {formatDate(idea.createdAt)}
                      </span>
                      <ChevronRight
                        className={cn(
                          "w-5 h-5 transition-colors",
                          isDark
                            ? "text-white/20 group-hover:text-purple-400"
                            : "text-slate-300 group-hover:text-blue-500"
                        )}
                      />
                    </div>
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={idea.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ y: -4 }}
                  onClick={() => navigate(`/employee/ideas/${idea.id}/preview`)}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl cursor-pointer transition-all border",
                    isDark
                      ? "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/[0.07]"
                      : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-lg"
                  )}
                >
                  {/* Gradient accent */}
                  <div
                    className={cn(
                      "absolute top-0 left-0 right-0 h-1",
                      style.bg.replace("/20", "")
                    )}
                  />

                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <span
                        className={cn(
                          "flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium",
                          style.bg,
                          style.text,
                          "border",
                          style.border
                        )}
                      >
                        <span>{style.icon}</span>
                        {getStatusLabel(idea.status)}
                      </span>

                      {/* Actions */}
                      {(idea.status === "DRAFT" ||
                        idea.status === "NEEDS_REVISION") && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/employee/ideas/${idea.id}/edit`);
                            }}
                            className={cn(
                              "p-1.5 rounded-lg transition-colors",
                              isDark
                                ? "bg-white/10 hover:bg-blue-500/30 text-white/60 hover:text-blue-300"
                                : "bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-600"
                            )}
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {idea.status === "DRAFT" && (
                            <button
                              onClick={(e) =>
                                handleDeleteClick(e, idea.id, idea.title)
                              }
                              className={cn(
                                "p-1.5 rounded-lg transition-colors",
                                isDark
                                  ? "bg-white/10 hover:bg-red-500/30 text-white/60 hover:text-red-300"
                                  : "bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-600"
                              )}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h3
                      className={cn(
                        "font-bold text-lg mb-2 line-clamp-2 transition-colors",
                        isDark
                          ? "text-white group-hover:text-purple-300"
                          : "text-slate-900 group-hover:text-blue-600"
                      )}
                    >
                      {idea.title}
                    </h3>

                    {/* Summary */}
                    <p
                      className={cn(
                        "text-sm line-clamp-2 mb-4",
                        isDark ? "text-white/40" : "text-slate-500"
                      )}
                    >
                      {idea.summary}
                    </p>

                    {/* Tags */}
                    {idea.tags && idea.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {idea.tags.slice(0, 3).map((tag: string) => (
                          <span
                            key={tag}
                            className={cn(
                              "inline-flex items-center text-xs px-2 py-0.5 rounded-full border",
                              isDark
                                ? "bg-white/5 text-white/50 border-white/5"
                                : "bg-slate-50 text-slate-500 border-slate-200"
                            )}
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                        {idea.tags.length > 3 && (
                          <span
                            className={cn(
                              "text-xs",
                              isDark ? "text-white/30" : "text-slate-400"
                            )}
                          >
                            +{idea.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Revision notice */}
                    {idea.status === "NEEDS_REVISION" && (
                      <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-300 bg-orange-100 dark:bg-orange-500/10 rounded-lg px-3 py-2 mb-3 border border-orange-200 dark:border-orange-500/20">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <span className="line-clamp-1">
                          {idea.reviewNotes || "Revision required"}
                        </span>
                      </div>
                    )}

                    {/* Footer */}
                    <div
                      className={cn(
                        "flex items-center justify-between pt-3 border-t",
                        isDark ? "border-white/5" : "border-slate-100"
                      )}
                    >
                      <div
                        className={cn(
                          "flex items-center gap-1 text-xs",
                          isDark ? "text-white/30" : "text-slate-400"
                        )}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(idea.createdAt)}</span>
                      </div>

                      {idea.domain && (
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full border",
                            isDark
                              ? "bg-white/5 text-white/40 border-white/5"
                              : "bg-slate-50 text-slate-500 border-slate-200"
                          )}
                        >
                          {idea.domain.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Hover arrow */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight
                      className={cn(
                        "w-5 h-5",
                        isDark ? "text-purple-400" : "text-blue-500"
                      )}
                    />
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
              <div
                className={cn(
                  "w-24 h-24 rounded-3xl rotate-6",
                  isDark
                    ? "bg-gradient-to-br from-purple-500/20 to-pink-500/20"
                    : "bg-gradient-to-br from-blue-100 to-purple-100"
                )}
              />
              <div
                className={cn(
                  "absolute inset-0 w-24 h-24 rounded-3xl border-2 border-dashed flex items-center justify-center",
                  isDark
                    ? "bg-white/5 border-white/10"
                    : "bg-white border-slate-300"
                )}
              >
                <Lightbulb
                  className={cn(
                    "w-10 h-10",
                    isDark ? "text-white/20" : "text-slate-300"
                  )}
                />
              </div>
            </div>
            <h3
              className={cn(
                "text-xl font-semibold mb-2",
                isDark ? "text-white" : "text-slate-900"
              )}
            >
              {search || statusFilter ? "No ideas found" : "No ideas yet"}
            </h3>
            <p
              className={cn(
                "text-center mb-6 max-w-sm",
                isDark ? "text-white/40" : "text-slate-500"
              )}
            >
              {search || statusFilter
                ? "Try adjusting your search or filters"
                : "Every great innovation starts with a single idea. Share yours today!"}
            </p>
            <Link to="/employee/ideas/new">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl shadow-lg font-medium"
              >
                <Sparkles className="w-5 h-5" />
                Create Your First Idea
              </motion.button>
            </Link>
          </motion.div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({ isOpen: false, ideaId: "", ideaTitle: "" })
        }
        onConfirm={handleConfirmDelete}
        title="Delete Idea"
        message={
          <>
            Are you sure you want to delete{" "}
            <span className="font-semibold">"{deleteModal.ideaTitle}"</span>?
            This action cannot be undone.
          </>
        }
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
