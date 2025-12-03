import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { organisationsApi, authApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Loader2 } from "lucide-react";

const createOrgSchema = z.object({
  name: z.string().min(2, "Organisation name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
  adminName: z.string().min(2, "Name must be at least 2 characters"),
  adminEmail: z.string().email("Invalid email address"),
  adminPassword: z.string().min(6, "Password must be at least 6 characters"),
});

type CreateOrgForm = z.infer<typeof createOrgSchema>;

export default function CreateOrgPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateOrgForm>({
    resolver: zodResolver(createOrgSchema),
  });

  const orgName = watch("name");
  console.log("🚀 ~ CreateOrgPage ~ orgName:", orgName);

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setValue("slug", slug);
  };

  const onSubmit = async (data: CreateOrgForm) => {
    setIsLoading(true);
    try {
      // Create organisation
      await organisationsApi.create(data);

      // Login with admin credentials
      const loginResponse = await authApi.login({
        email: data.adminEmail,
        password: data.adminPassword,
        organisationSlug: data.slug,
      });

      const { user, access_token } = loginResponse.data;
      setAuth(user, access_token);

      toast.success("Organisation created successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to create organisation"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">
          Create Organisation
        </CardTitle>
        <CardDescription>Set up your innovation platform</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Organisation Name</Label>
            <Input
              id="name"
              placeholder="Acme Corporation"
              {...register("name")}
              onChange={(e) => {
                register("name").onChange(e);
                handleNameChange(e);
              }}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Organisation URL</Label>
            <div className="flex items-center">
              <span className="text-sm text-muted-foreground mr-2">
                innovatex.com/
              </span>
              <Input id="slug" placeholder="acme-corp" {...register("slug")} />
            </div>
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug.message}</p>
            )}
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="text-sm font-medium mb-3">Admin Account</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminName">Your Name</Label>
                <Input
                  id="adminName"
                  placeholder="John Doe"
                  {...register("adminName")}
                />
                {errors.adminName && (
                  <p className="text-sm text-destructive">
                    {errors.adminName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminEmail">Email</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  placeholder="admin@company.com"
                  {...register("adminEmail")}
                />
                {errors.adminEmail && (
                  <p className="text-sm text-destructive">
                    {errors.adminEmail.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminPassword">Password</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  placeholder="••••••••"
                  {...register("adminPassword")}
                />
                {errors.adminPassword && (
                  <p className="text-sm text-destructive">
                    {errors.adminPassword.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Organisation
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">
            Already have an account?{" "}
          </span>
          <Link to="/login" className="text-primary hover:underline">
            Sign In
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
