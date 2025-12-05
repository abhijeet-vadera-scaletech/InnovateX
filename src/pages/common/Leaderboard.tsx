import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { useThemeStore } from "@/stores/themeStore";
import { usersApi } from "@/lib/api";
import { generateInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Trophy,
  Medal,
  Crown,
  Sparkles,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Users,
  Lightbulb,
  Search,
} from "lucide-react";

const ITEMS_PER_PAGE = 20;

export default function Leaderboard() {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => usersApi.getLeaderboard(1000).then((res) => res.data),
  });

  // Find current user's rank (in full list)
  const currentUserRank =
    leaderboard?.findIndex((u: any) => u.id === user?.id) ?? -1;
  const currentUserData =
    currentUserRank >= 0 ? leaderboard[currentUserRank] : null;

  // Filter by search
  const filteredLeaderboard =
    leaderboard?.filter((u: any) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  // Pagination
  const totalUsers = filteredLeaderboard.length;
  const totalPages = Math.ceil(totalUsers / ITEMS_PER_PAGE);
  const paginatedData = filteredLeaderboard.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Get original rank for a user
  const getOriginalRank = (userId: string) => {
    return (leaderboard?.findIndex((u: any) => u.id === userId) ?? -1) + 1;
  };

  const getRankDisplay = (rank: number) => {
    if (rank === 1)
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-md">
          <Crown className="w-4 h-4 text-white" />
        </div>
      );
    if (rank === 2)
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shadow-md">
          <Medal className="w-4 h-4 text-white" />
        </div>
      );
    if (rank === 3)
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center shadow-md">
          <Medal className="w-4 h-4 text-white" />
        </div>
      );
    return (
      <span
        className={cn(
          "text-sm font-semibold",
          isDark ? "text-white/70" : "text-slate-600"
        )}
      >
        #{rank}
      </span>
    );
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(
          1,
          "...",
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }
    return pages;
  };

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
            isDark ? "bg-yellow-600/10" : "bg-yellow-400/20"
          )}
        />
        <div
          className={cn(
            "absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[100px] animate-pulse",
            isDark ? "bg-purple-600/10" : "bg-purple-400/15"
          )}
          style={{ animationDelay: "1s" }}
        />
      </div>

      {/* Main Content */}
      <main className="relative pt-24 pb-12 px-4 sm:px-6 max-w-[1200px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 mb-4 shadow-xl shadow-amber-500/30">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1
            className={cn(
              "text-3xl font-bold mb-2",
              isDark ? "text-white" : "text-slate-900"
            )}
          >
            Leaderboard
          </h1>
          <p
            className={cn(
              "text-base",
              isDark ? "text-white/60" : "text-slate-600"
            )}
          >
            Top innovators in your organization
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div
            className={cn(
              "p-4 rounded-xl border text-center",
              isDark
                ? "bg-white/5 border-white/10"
                : "bg-white border-slate-200"
            )}
          >
            <Users
              className={cn(
                "w-6 h-6 mx-auto mb-2",
                isDark ? "text-blue-400" : "text-blue-500"
              )}
            />
            <div
              className={cn(
                "text-2xl font-bold",
                isDark ? "text-white" : "text-slate-900"
              )}
            >
              {totalUsers}
            </div>
            <div
              className={cn(
                "text-xs",
                isDark ? "text-white/50" : "text-slate-500"
              )}
            >
              Total Innovators
            </div>
          </div>
          {leaderboard?.[0] && (
            <div
              className={cn(
                "p-4 rounded-xl border text-center",
                isDark
                  ? "bg-yellow-500/10 border-yellow-500/20"
                  : "bg-yellow-50 border-yellow-200"
              )}
            >
              <Crown className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
              <div
                className={cn(
                  "text-lg font-bold truncate",
                  isDark ? "text-yellow-400" : "text-yellow-600"
                )}
              >
                {leaderboard[0].name.split(" ")[0]}
              </div>
              <div
                className={cn(
                  "text-xs",
                  isDark ? "text-yellow-400/60" : "text-yellow-600/70"
                )}
              >
                Top Innovator
              </div>
            </div>
          )}
          <div
            className={cn(
              "p-4 rounded-xl border text-center",
              isDark
                ? "bg-white/5 border-white/10"
                : "bg-white border-slate-200"
            )}
          >
            <Trophy
              className={cn(
                "w-6 h-6 mx-auto mb-2",
                isDark ? "text-amber-400" : "text-amber-500"
              )}
            />
            <div
              className={cn(
                "text-2xl font-bold",
                isDark ? "text-white" : "text-slate-900"
              )}
            >
              {leaderboard?.[0]?.totalPoints || 0}
            </div>
            <div
              className={cn(
                "text-xs",
                isDark ? "text-white/50" : "text-slate-500"
              )}
            >
              Highest Points
            </div>
          </div>
          {currentUserData && (
            <div
              className={cn(
                "p-4 rounded-xl border text-center",
                isDark
                  ? "bg-purple-500/10 border-purple-500/20"
                  : "bg-purple-50 border-purple-200"
              )}
            >
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-purple-500" />
              <div
                className={cn(
                  "text-2xl font-bold",
                  isDark ? "text-purple-400" : "text-purple-600"
                )}
              >
                #{currentUserRank + 1}
              </div>
              <div
                className={cn(
                  "text-xs",
                  isDark ? "text-purple-400/60" : "text-purple-600/70"
                )}
              >
                Your Rank
              </div>
            </div>
          )}
        </motion.div>

        {/* Search and Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col sm:flex-row gap-4 mb-6"
        >
          <div className="relative flex-1">
            <Search
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5",
                isDark ? "text-white/40" : "text-slate-400"
              )}
            />
            <input
              type="text"
              placeholder="Search innovators..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className={cn(
                "w-full pl-10 pr-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-purple-500/50 transition-all",
                isDark
                  ? "bg-white/5 border-white/10 text-white placeholder-white/40"
                  : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              )}
            />
          </div>
          <div
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl border",
              isDark
                ? "bg-white/5 border-white/10"
                : "bg-white border-slate-200"
            )}
          >
            <span
              className={cn(
                "text-sm",
                isDark ? "text-white/60" : "text-slate-500"
              )}
            >
              Showing
            </span>
            <span
              className={cn(
                "font-semibold",
                isDark ? "text-white" : "text-slate-900"
              )}
            >
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
              {Math.min(currentPage * ITEMS_PER_PAGE, totalUsers)}
            </span>
            <span
              className={cn(
                "text-sm",
                isDark ? "text-white/60" : "text-slate-500"
              )}
            >
              of {totalUsers}
            </span>
          </div>
        </motion.div>

        {/* Leaderboard Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cn(
            "rounded-2xl border overflow-hidden",
            isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
          )}
        >
          {/* Table Header */}
          <div
            className={cn(
              "grid grid-cols-12 gap-4 px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b",
              isDark
                ? "bg-white/5 border-white/10 text-white/50"
                : "bg-slate-50 border-slate-200 text-slate-500"
            )}
          >
            <div className="col-span-1 text-center">Rank</div>
            <div className="col-span-7 sm:col-span-6">Innovator</div>
            <div className="col-span-4 sm:col-span-3 text-right">Points</div>
            <div className="hidden sm:block col-span-2 text-right">Ideas</div>
          </div>

          {/* Table Body */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Lightbulb className="w-12 h-12 text-yellow-400" />
              </motion.div>
            </div>
          ) : paginatedData.length > 0 ? (
            <div
              className={cn(
                "divide-y",
                isDark ? "divide-white/5" : "divide-slate-100"
              )}
            >
              {paginatedData.map((rankedUser: any) => {
                const rank = getOriginalRank(rankedUser.id);
                const isCurrentUser = rankedUser.id === user?.id;

                return (
                  <div
                    key={rankedUser.id}
                    className={cn(
                      "grid grid-cols-12 gap-4 px-4 py-3 items-center transition-colors",
                      isCurrentUser
                        ? isDark
                          ? "bg-purple-500/10"
                          : "bg-purple-50"
                        : rank <= 3
                        ? isDark
                          ? "bg-yellow-500/5"
                          : "bg-yellow-50/50"
                        : isDark
                        ? "hover:bg-white/5"
                        : "hover:bg-slate-50"
                    )}
                  >
                    {/* Rank */}
                    <div className="col-span-1 flex justify-center">
                      {getRankDisplay(rank)}
                    </div>

                    {/* User Info */}
                    <div className="col-span-7 sm:col-span-6 flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-bold text-white",
                          rank === 1
                            ? "bg-gradient-to-br from-yellow-400 to-orange-500"
                            : rank === 2
                            ? "bg-gradient-to-br from-slate-400 to-slate-500"
                            : rank === 3
                            ? "bg-gradient-to-br from-amber-500 to-amber-600"
                            : "bg-gradient-to-br from-blue-500 to-purple-500"
                        )}
                      >
                        {generateInitials(rankedUser.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "font-medium truncate",
                              isDark ? "text-white" : "text-slate-900"
                            )}
                          >
                            {rankedUser.name}
                          </span>
                          {isCurrentUser && (
                            <span
                              className={cn(
                                "px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0",
                                isDark
                                  ? "bg-purple-500/20 text-purple-300"
                                  : "bg-purple-100 text-purple-700"
                              )}
                            >
                              You
                            </span>
                          )}
                          {rank === 1 && (
                            <Sparkles className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                          )}
                        </div>
                        {rankedUser.department && (
                          <span
                            className={cn(
                              "text-xs truncate block",
                              isDark ? "text-white/40" : "text-slate-500"
                            )}
                          >
                            {rankedUser.department}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Points */}
                    <div className="col-span-4 sm:col-span-3 text-right">
                      <span
                        className={cn(
                          "text-lg font-bold",
                          rank === 1
                            ? "text-yellow-500"
                            : rank === 2
                            ? isDark
                              ? "text-slate-300"
                              : "text-slate-600"
                            : rank === 3
                            ? "text-amber-500"
                            : isDark
                            ? "text-white"
                            : "text-slate-900"
                        )}
                      >
                        {rankedUser.totalPoints.toLocaleString()}
                      </span>
                      <span
                        className={cn(
                          "text-xs ml-1",
                          isDark ? "text-white/40" : "text-slate-500"
                        )}
                      >
                        pts
                      </span>
                    </div>

                    {/* Ideas Count (optional) */}
                    <div className="hidden sm:block col-span-2 text-right">
                      <span
                        className={cn(
                          "text-sm",
                          isDark ? "text-white/60" : "text-slate-600"
                        )}
                      >
                        {rankedUser.ideasCount || "-"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className={cn(
                "text-center py-20",
                isDark ? "text-white/40" : "text-slate-500"
              )}
            >
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No results found</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="flex items-center justify-center gap-2 mt-6"
          >
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={cn(
                "p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                isDark
                  ? "hover:bg-white/10 text-white/70"
                  : "hover:bg-slate-100 text-slate-600"
              )}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, idx) =>
                page === "..." ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className={cn(
                      "px-2",
                      isDark ? "text-white/40" : "text-slate-400"
                    )}
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page as number)}
                    className={cn(
                      "w-10 h-10 rounded-lg font-medium transition-all",
                      currentPage === page
                        ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                        : isDark
                        ? "hover:bg-white/10 text-white/70"
                        : "hover:bg-slate-100 text-slate-600"
                    )}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={cn(
                "p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                isDark
                  ? "hover:bg-white/10 text-white/70"
                  : "hover:bg-slate-100 text-slate-600"
              )}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {/* Your Ranking Sticky Footer (if not on first page or filtered) */}
        {currentUserData && (searchQuery || currentPage > 1) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 p-4 rounded-xl border shadow-xl z-40",
              isDark
                ? "bg-slate-900/95 backdrop-blur-xl border-purple-500/30"
                : "bg-white/95 backdrop-blur-xl border-purple-200 shadow-purple-500/10"
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white",
                  "bg-gradient-to-br from-purple-500 to-blue-500"
                )}
              >
                {generateInitials(currentUserData.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className={cn(
                    "font-medium truncate",
                    isDark ? "text-white" : "text-slate-900"
                  )}
                >
                  Your Ranking
                </div>
                <div
                  className={cn(
                    "text-sm",
                    isDark ? "text-white/60" : "text-slate-500"
                  )}
                >
                  {currentUserData.totalPoints} points
                </div>
              </div>
              <div
                className={cn(
                  "text-2xl font-bold",
                  isDark ? "text-purple-400" : "text-purple-600"
                )}
              >
                #{currentUserRank + 1}
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
