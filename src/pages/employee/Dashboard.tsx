import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { analyticsApi, ideasApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { getStatusColor, getStatusLabel, formatDate } from "@/lib/utils";
import {
  FileText,
  PlusCircle,
  Trophy,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";

export default function EmployeeDashboard() {
  const { user } = useAuthStore();

  const { data: stats } = useQuery({
    queryKey: ["employee-stats"],
    queryFn: () => analyticsApi.getEmployeeStats().then((res) => res.data),
  });

  const { data: recentIdeas } = useQuery({
    queryKey: ["my-ideas", { limit: 5 }],
    queryFn: () => ideasApi.getMy({ limit: 5 }).then((res) => res.data),
  });

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your innovation journey
          </p>
        </div>
        <Link to="/employee/ideas/new">
          <Button>
            <PlusCircle className="w-4 h-4 mr-2" />
            New Idea
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Ideas
            </CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalIdeas || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved
            </CardTitle>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.approved || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Review
            </CardTitle>
            <Clock className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.submitted || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Points
            </CardTitle>
            <Trophy className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.totalPoints || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Ideas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/employee/ideas/new" className="block">
              <Button variant="outline" className="w-full justify-start">
                <PlusCircle className="w-4 h-4 mr-2" />
                Submit New Idea
              </Button>
            </Link>
            <Link to="/employee/ideas" className="block">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                View My Ideas
              </Button>
            </Link>
            <Link to="/leaderboard" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Trophy className="w-4 h-4 mr-2" />
                View Leaderboard
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Ideas */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Ideas</CardTitle>
            <Link to="/employee/ideas">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentIdeas?.data?.length > 0 ? (
              <div className="space-y-4">
                {recentIdeas.data.map((idea: any) => (
                  <Link
                    key={idea.id}
                    to={`/employee/ideas/${idea.id}`}
                    className="block p-4 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{idea.title}</h3>
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {idea.summary}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDate(idea.createdAt)}
                        </p>
                      </div>
                      <Badge className={getStatusColor(idea.status)}>
                        {getStatusLabel(idea.status)}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No ideas yet</p>
                <Link to="/employee/ideas/new">
                  <Button variant="link">Create your first idea</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Success Rate */}
      {stats && stats.totalIdeas > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Your Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{stats.drafts}</div>
                <div className="text-sm text-muted-foreground">Drafts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.submitted}
                </div>
                <div className="text-sm text-muted-foreground">Submitted</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {stats.shortlisted}
                </div>
                <div className="text-sm text-muted-foreground">Shortlisted</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.successRate}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Success Rate
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
