import { Outlet } from "react-router-dom";
import { EmployeeHeader } from "@/components/layout/EmployeeHeader";

export default function EmployeeLayout() {
  return (
    <>
      {/* Common Header for all employee routes */}
      <EmployeeHeader />

      {/* Page Content - each page handles its own styling */}
      <Outlet />
    </>
  );
}
