import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usersApi } from "@/lib/api";
import { generateInitials } from "@/lib/utils";
import { Trophy, Medal } from "lucide-react";

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => usersApi.getLeaderboard(20).then((res) => res.data),
  });

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return (
      <span className="w-6 h-6 flex items-center justify-center font-bold text-muted-foreground">
        {rank}
      </span>
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <p className="text-muted-foreground">
          Top innovators in your organization
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Top Contributors
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : leaderboard?.length > 0 ? (
            <div className="space-y-4">
              {leaderboard.map((user: any, index: number) => (
                <div
                  key={user.id}
                  className={`flex items-center gap-4 p-4 rounded-lg ${
                    index < 3
                      ? "bg-gradient-to-r from-yellow-50 to-transparent"
                      : "bg-muted/50"
                  }`}
                >
                  <div className="w-8 flex justify-center">
                    {getRankIcon(index + 1)}
                  </div>
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>
                      {generateInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{user.name}</h3>
                    {user.department && (
                      <p className="text-sm text-muted-foreground">
                        {user.department}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">
                      {user.totalPoints}
                    </div>
                    <div className="text-xs text-muted-foreground">points</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No contributors yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
