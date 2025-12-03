import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { authApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { generateInitials, getRoleColor, getRoleLabel } from "@/lib/utils";
import { User, Mail, Building2, Trophy, Loader2 } from "lucide-react";

export default function Profile() {
  const { user: authUser, updateUser } = useAuthStore();

  // Fetch fresh profile data from API
  const { data: profileData, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => authApi.getProfile().then((res) => res.data),
    enabled: !!authUser,
  });

  // Update auth store with fresh data
  useEffect(() => {
    if (profileData) {
      updateUser(profileData);
    }
  }, [profileData, updateUser]);

  const user = profileData || authUser;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <Avatar className="w-24 h-24 mb-4">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-2xl">
                {generateInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <Badge className={`mt-2 ${getRoleColor(user.role)}`}>
              {getRoleLabel(user.role)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>
          {user.organisation && (
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Organisation</p>
                <p className="font-medium">{user.organisation.name}</p>
              </div>
            </div>
          )}
          {user.department && (
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="font-medium">{user.department.name}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Points</p>
              <p className="font-medium text-lg">{user.totalPoints || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
