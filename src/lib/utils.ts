import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: string | Date) {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-800",
    SUBMITTED: "bg-blue-100 text-blue-800",
    UNDER_REVIEW: "bg-yellow-100 text-yellow-800",
    SHORTLISTED: "bg-purple-100 text-purple-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    NEEDS_REVISION: "bg-orange-100 text-orange-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    DRAFT: "Draft",
    SUBMITTED: "Submitted",
    UNDER_REVIEW: "Under Review",
    SHORTLISTED: "Shortlisted",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    NEEDS_REVISION: "Needs Revision",
  };
  return labels[status] || status;
}

export function getRoleColor(role: string) {
  const colors: Record<string, string> = {
    EMPLOYEE: "bg-blue-100 text-blue-800",
    REVIEWER: "bg-purple-100 text-purple-800",
    MANAGEMENT: "bg-green-100 text-green-800",
    ADMIN: "bg-red-100 text-red-800",
  };
  return colors[role] || "bg-gray-100 text-gray-800";
}

export function getRoleLabel(role: string) {
  const labels: Record<string, string> = {
    EMPLOYEE: "Employee",
    REVIEWER: "Reviewer",
    MANAGEMENT: "Management",
    ADMIN: "Admin",
  };
  return labels[role] || role;
}

export function truncate(str: string, length: number) {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function generateInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatNumber(num: number) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}
