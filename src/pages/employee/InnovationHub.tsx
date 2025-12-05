import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useAuthStore } from "@/stores/authStore";
import { useThemeStore } from "@/stores/themeStore";
import { ideasApi, usersApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { getStatusLabel, formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Plus,
  Sparkles,
  Trophy,
  Lightbulb,
  ChevronRight,
  Edit3,
  Calendar,
  Tag,
  Crown,
  Medal,
  Trash2,
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

export default function InnovationHub() {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    ideaId: string;
    ideaTitle: string;
  }>({ isOpen: false, ideaId: "", ideaTitle: "" });

  // Fetch all ideas
  const { data: ideas, isLoading } = useQuery({
    queryKey: ["my-ideas", { limit: 50 }],
    queryFn: () => ideasApi.getMy({ limit: 50 }).then((res) => res.data),
  });

  // Delete mutation
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
    e.stopPropagation();
    setDeleteModal({ isOpen: true, ideaId: id, ideaTitle: title });
  };

  const handleConfirmDelete = () => {
    if (deleteModal.ideaId) {
      deleteMutation.mutate(deleteModal.ideaId);
    }
  };

  // Fetch leaderboard
  const { data: leaderboard } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => usersApi.getLeaderboard(5).then((res: any) => res.data),
  });

  // Get all ideas
  const filteredIdeas = ideas?.data || [];

  const isDark = theme === "dark";

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
            isDark ? "bg-blue-600/10" : "bg-blue-400/20"
          )}
        />
        <div
          className={cn(
            "absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[100px] animate-pulse",
            isDark ? "bg-purple-600/10" : "bg-purple-400/15"
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
        {/* Header with Create Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div>
            <h1
              className={cn(
                "text-3xl sm:text-4xl font-bold",
                isDark
                  ? "bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent"
                  : "text-slate-900"
              )}
            >
              Welcome back, {user?.name?.split(" ")[0]} 👋
            </h1>
            <p
              className={cn(
                "mt-2",
                isDark ? "text-white/50" : "text-slate-500"
              )}
            >
              Your creative space for innovation
            </p>
          </div>

          <Link to="/employee/ideas/new">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-2xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all font-semibold"
            >
              <Plus className="w-5 h-5" />
              Create New Idea
            </motion.button>
          </Link>
        </motion.div>

        {/* Main Grid - Ideas + Leaderboard */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Ideas Section - Takes 3 columns */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2
                className={cn(
                  "text-xl font-semibold flex items-center gap-2",
                  isDark ? "text-white" : "text-slate-900"
                )}
              >
                <Sparkles className="w-5 h-5 text-yellow-500" />
                My Ideas
              </h2>
              <Link
                to="/employee/ideas"
                className={cn(
                  "text-sm flex items-center gap-1 transition-colors",
                  isDark
                    ? "text-blue-400 hover:text-blue-300"
                    : "text-blue-600 hover:text-blue-700"
                )}
              >
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Lightbulb className="w-12 h-12 text-yellow-400" />
                </motion.div>
              </div>
            ) : filteredIdeas.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
              >
                {filteredIdeas.map((idea: any, index: number) => {
                  const style = statusStyles[idea.status] || statusStyles.DRAFT;
                  return (
                    <motion.div
                      key={idea.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      whileHover={{ y: -4 }}
                      onClick={() =>
                        navigate(`/employee/ideas/${idea.id}/preview`)
                      }
                      className={cn(
                        "group relative overflow-hidden rounded-2xl cursor-pointer transition-all border",
                        isDark
                          ? "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/[0.07]"
                          : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-lg"
                      )}
                    >
                      {/* Status accent bar */}
                      <div
                        className={cn(
                          "absolute top-0 left-0 right-0 h-1",
                          style.bg.replace("/20", "").replace("dark:", "")
                        )}
                      />

                      <div className="p-5">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <span
                            className={cn(
                              "flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium border",
                              style.bg,
                              style.text,
                              style.border
                            )}
                          >
                            <span>{style.icon}</span>
                            {getStatusLabel(idea.status)}
                          </span>

                          {/* Edit & Delete buttons for drafts */}
                          {(idea.status === "DRAFT" ||
                            idea.status === "NEEDS_REVISION") && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/employee/ideas/${idea.id}/edit`);
                                }}
                                className={cn(
                                  "p-1.5 rounded-lg transition-all",
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
                                    "p-1.5 rounded-lg transition-all",
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
                            {idea.tags.slice(0, 2).map((tag: string) => (
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
                            {idea.tags.length > 2 && (
                              <span
                                className={cn(
                                  "text-xs",
                                  isDark ? "text-white/30" : "text-slate-400"
                                )}
                              >
                                +{idea.tags.length - 2}
                              </span>
                            )}
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

                          <ChevronRight
                            className={cn(
                              "w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity",
                              isDark ? "text-purple-400" : "text-blue-500"
                            )}
                          />
                        </div>
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
                  No ideas yet
                </h3>
                <p
                  className={cn(
                    "text-center mb-6 max-w-sm",
                    isDark ? "text-white/40" : "text-slate-500"
                  )}
                >
                  Start your innovation journey by creating your first idea!
                </p>
                <Link to="/employee/ideas/new">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl shadow-lg font-medium"
                  >
                    <Sparkles className="w-5 h-5" />
                    Create Your First Idea
                  </motion.button>
                </Link>
              </motion.div>
            )}
          </div>

          {/* Leaderboard Section - Takes 1 column */}
          <div className="lg:col-span-1">
            <div
              className={cn(
                "sticky top-24 rounded-2xl border p-6",
                isDark
                  ? "bg-white/5 border-white/5"
                  : "bg-white border-slate-200 shadow-sm"
              )}
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3
                    className={cn(
                      "font-semibold",
                      isDark ? "text-white" : "text-slate-900"
                    )}
                  >
                    Top Innovators
                  </h3>
                  <p
                    className={cn(
                      "text-xs",
                      isDark ? "text-white/40" : "text-slate-500"
                    )}
                  >
                    This month's leaders
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {leaderboard?.slice(0, 5).map((entry: any, index: number) => (
                  <motion.div
                    key={entry.id || index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl transition-all",
                      isDark
                        ? "bg-white/5 hover:bg-white/10"
                        : "bg-slate-50 hover:bg-slate-100"
                    )}
                  >
                    {/* Rank */}
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                        index === 0 &&
                          "bg-gradient-to-br from-amber-400 to-orange-500 text-white",
                        index === 1 &&
                          "bg-gradient-to-br from-slate-300 to-slate-400 text-white",
                        index === 2 &&
                          "bg-gradient-to-br from-amber-600 to-amber-700 text-white",
                        index > 2 &&
                          (isDark
                            ? "bg-white/10 text-white/60"
                            : "bg-slate-200 text-slate-600")
                      )}
                    >
                      {index === 0 ? (
                        <Crown className="w-4 h-4" />
                      ) : index === 1 ? (
                        <Medal className="w-4 h-4" />
                      ) : index === 2 ? (
                        <Medal className="w-4 h-4" />
                      ) : (
                        index + 1
                      )}
                    </div>

                    {/* User info */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "font-medium text-sm truncate",
                          isDark ? "text-white" : "text-slate-900"
                        )}
                      >
                        {entry.user?.name || entry.name || "Anonymous"}
                      </p>
                      <p
                        className={cn(
                          "text-xs",
                          isDark ? "text-white/40" : "text-slate-500"
                        )}
                      >
                        {entry.totalPoints || entry.points || 0} points
                      </p>
                    </div>

                    {/* Points badge */}
                    <div
                      className={cn(
                        "px-2 py-1 rounded-lg text-xs font-semibold",
                        index === 0
                          ? "bg-amber-500/20 text-amber-500"
                          : isDark
                          ? "bg-white/10 text-white/60"
                          : "bg-slate-100 text-slate-600"
                      )}
                    >
                      {entry.totalPoints || entry.points || 0}
                    </div>
                  </motion.div>
                ))}

                {(!leaderboard || leaderboard.length === 0) && (
                  <div
                    className={cn(
                      "text-center py-8",
                      isDark ? "text-white/40" : "text-slate-500"
                    )}
                  >
                    <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No rankings yet</p>
                  </div>
                )}
              </div>

              {/* Current user rank */}
              {user && (
                <div
                  className={cn(
                    "mt-4 pt-4 border-t",
                    isDark ? "border-white/5" : "border-slate-100"
                  )}
                >
                  <p
                    className={cn(
                      "text-xs mb-2",
                      isDark ? "text-white/40" : "text-slate-500"
                    )}
                  >
                    Your ranking
                  </p>
                  <div
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl",
                      isDark
                        ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/20"
                        : "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200"
                    )}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                      {user.name?.charAt(0) || "U"}
                    </div>
                    <div className="flex-1">
                      <p
                        className={cn(
                          "font-medium text-sm",
                          isDark ? "text-white" : "text-slate-900"
                        )}
                      >
                        {user.name}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
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
