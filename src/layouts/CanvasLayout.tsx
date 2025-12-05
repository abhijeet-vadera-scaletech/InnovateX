import { Outlet } from "react-router-dom";
import { useThemeStore } from "@/stores/themeStore";
import { useEffect } from "react";

export default function CanvasLayout() {
  const { theme } = useThemeStore();

  // Ensure theme is applied
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <div className="h-screen w-screen overflow-hidden">
      <Outlet />
    </div>
  );
}
