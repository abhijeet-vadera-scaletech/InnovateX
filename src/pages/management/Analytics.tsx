import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { analyticsApi } from "@/lib/api";
import { BarChart3 } from "lucide-react";

export default function Analytics() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => analyticsApi.getDashboard().then((res) => res.data),
  });

  const { data: byStatus } = useQuery({
    queryKey: ["ideas-by-status"],
    queryFn: () => analyticsApi.getIdeasByStatus().then((res) => res.data),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Insights into your innovation metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total Ideas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalIdeas || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Approval Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {stats?.approvalRate || 0}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Shortlist Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {stats?.shortlistRate || 0}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalUsers || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Ideas by Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {byStatus?.map((item: any) => (
              <div key={item.status} className="flex items-center gap-4">
                <div className="w-32 text-sm font-medium">{item.status}</div>
                <div className="flex-1 bg-muted rounded-full h-4">
                  <div
                    className="bg-primary h-4 rounded-full"
                    style={{
                      width: `${
                        (item._count / (stats?.totalIdeas || 1)) * 100
                      }%`,
                    }}
                  />
                </div>
                <div className="w-12 text-right text-sm font-medium">
                  {item._count}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
