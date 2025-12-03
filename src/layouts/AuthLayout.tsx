import { Outlet, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";

export default function AuthLayout() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-blue-700 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Lightbulb className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">InnovateX</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-white mb-6">
            Transform Ideas into Innovation
          </h1>
          <p className="text-lg text-white/80 mb-8">
            Empower your organization with AI-assisted idea management. Collect,
            refine, evaluate, and approve employee-generated innovations.
          </p>
          <div className="flex gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">10K+</div>
              <div className="text-white/70 text-sm">Ideas Submitted</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">500+</div>
              <div className="text-white/70 text-sm">Organizations</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">85%</div>
              <div className="text-white/70 text-sm">Success Rate</div>
            </div>
          </div>
        </motion.div>

        <div className="text-white/60 text-sm">
          © 2024 InnovateX. All rights reserved.
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
}
