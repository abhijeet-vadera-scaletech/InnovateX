import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useEffect } from "react";
import {
  AlertTriangle,
  Trash2,
  Info,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

type ConfirmationType = "danger" | "warning" | "info" | "success";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmationType;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const typeConfig: Record<
  ConfirmationType,
  {
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
    confirmButtonClass: string;
  }
> = {
  danger: {
    icon: <Trash2 className="w-6 h-6" />,
    iconBg: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-600 dark:text-red-400",
    confirmButtonClass:
      "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
  },
  warning: {
    icon: <AlertTriangle className="w-6 h-6" />,
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    confirmButtonClass:
      "bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500",
  },
  info: {
    icon: <Info className="w-6 h-6" />,
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    confirmButtonClass:
      "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
  },
  success: {
    icon: <CheckCircle className="w-6 h-6" />,
    iconBg: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600 dark:text-green-400",
    confirmButtonClass:
      "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500",
  },
};

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
  isLoading = false,
  icon,
}: ConfirmationModalProps) {
  const config = typeConfig[type];

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, isLoading]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !isLoading && onClose()}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 350,
            }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            {/* Content */}
            <div className="p-6">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  damping: 15,
                  stiffness: 300,
                  delay: 0.1,
                }}
                className={cn(
                  "w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-4",
                  config.iconBg
                )}
              >
                <span className={config.iconColor}>{icon || config.icon}</span>
              </motion.div>

              {/* Title */}
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-xl font-semibold text-center text-slate-900 dark:text-white mb-2"
              >
                {title}
              </motion.h3>

              {/* Message */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center text-slate-600 dark:text-slate-400"
              >
                {typeof message === "string" ? <p>{message}</p> : message}
              </motion.div>
            </div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700"
            >
              <Button
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={isLoading}
              >
                {cancelText}
              </Button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className={cn(
                  "flex-1 px-4 py-2 rounded-lg font-medium transition-all",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  config.confirmButtonClass
                )}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  confirmText
                )}
              </button>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (typeof window === "undefined") return null;
  return createPortal(modalContent, document.body);
}
