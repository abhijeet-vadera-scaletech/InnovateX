import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
import { authApi, organisationsApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Loader2, Building2 } from "lucide-react";

const joinSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  designation: z.string().optional(),
});

type JoinForm = z.infer<typeof joinSchema>;

export default function JoinPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [orgInfo, setOrgInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JoinForm>({
    resolver: zodResolver(joinSchema),
  });

  useEffect(() => {
    const validateCode = async () => {
      if (!code) {
        setError("Invalid invite link");
        setIsValidating(false);
        return;
      }

      try {
        const response = await organisationsApi.validateInviteCode(code);
        console.log("🚀 ~ validateCode ~ response:", response);
        setOrgInfo(response.data);
      } catch (err: any) {
        console.log("🚀 ~ validateCode ~ err:", err);
        setError(
          err.response?.data?.message || "Invalid or expired invite link"
        );
      } finally {
        setIsValidating(false);
      }
    };

    validateCode();
  }, [code]);

  const onSubmit = async (data: JoinForm) => {
    if (!code) return;

    setIsLoading(true);
    try {
      const response = await authApi.registerWithInvite({
        ...data,
        inviteCode: code,
      });
      const { user, access_token } = response.data;
      setAuth(user, access_token);
      toast.success("Welcome to " + orgInfo?.organisation?.name + "!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <Card className="border-0 shadow-none">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-0 shadow-none">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-destructive">
            Invalid Link
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link to="/login">
            <Button>Go to Login</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">
          Join {orgInfo?.organisation?.name}
        </CardTitle>
        <CardDescription>Create your account to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="John Doe" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input
                id="phone"
                placeholder="+1234567890"
                {...register("phone")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="designation">Designation (Optional)</Label>
              <Input
                id="designation"
                placeholder="Software Engineer"
                {...register("designation")}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Join Organisation
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
