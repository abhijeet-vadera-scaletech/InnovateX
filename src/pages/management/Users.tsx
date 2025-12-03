import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usersApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { generateInitials, getRoleColor, getRoleLabel, cn } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  Users as UsersIcon,
  MoreVertical,
  Shield,
  UserCheck,
  UserX,
  Loader2,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";

const roleOptions = [
  { value: "EMPLOYEE", label: "Employee", description: "Can submit ideas" },
  {
    value: "REVIEWER",
    label: "Reviewer",
    description: "Can review and shortlist ideas",
  },
  {
    value: "MANAGEMENT",
    label: "Management",
    description: "Can approve/reject shortlisted ideas",
  },
];

export default function Users() {
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleChangeDialog, setRoleChangeDialog] = useState<{
    open: boolean;
    user: any;
    newRole: string;
  }>({ open: false, user: null, newRole: "" });

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => usersApi.getAll().then((res) => res.data),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      usersApi.updateRole(userId, role),
    onSuccess: () => {
      toast.success("User role updated successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setRoleChangeDialog({ open: false, user: null, newRole: "" });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update role");
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (userId: string) => usersApi.deactivate(userId),
    onSuccess: () => {
      toast.success("User deactivated");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to deactivate user");
    },
  });

  const activateMutation = useMutation({
    mutationFn: (userId: string) => usersApi.activate(userId),
    onSuccess: () => {
      toast.success("User activated");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to activate user");
    },
  });

  const handleRoleChange = (user: any, newRole: string) => {
    if (user.role === newRole) return;
    setRoleChangeDialog({ open: true, user, newRole });
  };

  const confirmRoleChange = () => {
    if (roleChangeDialog.user && roleChangeDialog.newRole) {
      updateRoleMutation.mutate({
        userId: roleChangeDialog.user.id,
        role: roleChangeDialog.newRole,
      });
    }
  };

  const filteredUsers = users?.data?.filter(
    (user: any) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  const canManageUser = (user: any) => {
    // Admin can manage everyone except themselves
    // Management can only manage employees and reviewers
    if (user.id === currentUser?.id) return false;
    if (currentUser?.role === "ADMIN") return user.role !== "ADMIN";
    if (currentUser?.role === "MANAGEMENT")
      return ["EMPLOYEE", "REVIEWER"].includes(user.role);
    return false;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Team Members</h1>
          <p className="text-muted-foreground">
            Manage organization members and roles
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredUsers?.length > 0 ? (
        <div className="grid gap-4">
          {filteredUsers.map((user: any) => (
            <Card
              key={user.id}
              className={cn(
                "transition-all hover:shadow-md",
                !user.isActive && "opacity-60"
              )}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {generateInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    {!user.isActive && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{user.name}</h3>
                      <Badge className={getRoleColor(user.role)}>
                        {getRoleLabel(user.role)}
                      </Badge>
                      {!user.isActive && (
                        <Badge
                          variant="outline"
                          className="text-red-500 border-red-200"
                        >
                          Inactive
                        </Badge>
                      )}
                      {user.id === currentUser?.id && (
                        <Badge
                          variant="outline"
                          className="text-blue-500 border-blue-200"
                        >
                          You
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {user.email}
                    </p>
                    {user.department && (
                      <p className="text-xs text-muted-foreground">
                        {user.department.name}
                      </p>
                    )}
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="font-semibold text-lg">
                      {user.totalPoints || 0}
                      <span className="text-xs text-muted-foreground ml-1">
                        pts
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {user._count?.ideas || 0} ideas
                    </div>
                  </div>

                  {/* Role Change Dropdown */}
                  {canManageUser(user) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {roleOptions.map((role) => (
                          <DropdownMenuItem
                            key={role.value}
                            onClick={() => handleRoleChange(user, role.value)}
                            className={cn(
                              "flex flex-col items-start gap-0.5 cursor-pointer",
                              user.role === role.value && "bg-accent"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4" />
                              <span className="font-medium">{role.label}</span>
                              {user.role === role.value && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs ml-auto"
                                >
                                  Current
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground pl-6">
                              {role.description}
                            </span>
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        {user.isActive ? (
                          <DropdownMenuItem
                            onClick={() => deactivateMutation.mutate(user.id)}
                            className="text-red-600 cursor-pointer"
                          >
                            <UserX className="w-4 h-4 mr-2" />
                            Deactivate User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => activateMutation.mutate(user.id)}
                            className="text-green-600 cursor-pointer"
                          >
                            <UserCheck className="w-4 h-4 mr-2" />
                            Activate User
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <UsersIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-medium mb-2">
              {search ? "No users found" : "No users yet"}
            </h3>
            <p className="text-muted-foreground">
              {search
                ? "Try adjusting your search"
                : "Invite team members to get started"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Role Change Confirmation Dialog */}
      <Dialog
        open={roleChangeDialog.open}
        onOpenChange={(open: boolean) =>
          !open && setRoleChangeDialog({ open: false, user: null, newRole: "" })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to change{" "}
              <span className="font-semibold">
                {roleChangeDialog.user?.name}
              </span>
              's role from{" "}
              <Badge
                className={getRoleColor(roleChangeDialog.user?.role || "")}
              >
                {getRoleLabel(roleChangeDialog.user?.role || "")}
              </Badge>{" "}
              to{" "}
              <Badge className={getRoleColor(roleChangeDialog.newRole)}>
                {getRoleLabel(roleChangeDialog.newRole)}
              </Badge>
              ?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">
                {roleChangeDialog.newRole === "REVIEWER" && (
                  <>
                    <strong>Reviewer</strong> can review submitted ideas,
                    provide feedback, and shortlist ideas for management review.
                  </>
                )}
                {roleChangeDialog.newRole === "EMPLOYEE" && (
                  <>
                    <strong>Employee</strong> can submit new ideas and track
                    their own submissions.
                  </>
                )}
                {roleChangeDialog.newRole === "MANAGEMENT" && (
                  <>
                    <strong>Management</strong> can approve or reject
                    shortlisted ideas, manage team members, and access
                    analytics.
                  </>
                )}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setRoleChangeDialog({ open: false, user: null, newRole: "" })
              }
            >
              Cancel
            </Button>
            <Button
              onClick={confirmRoleChange}
              disabled={updateRoleMutation.isPending}
            >
              {updateRoleMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
