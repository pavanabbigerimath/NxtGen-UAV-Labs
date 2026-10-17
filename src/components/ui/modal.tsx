"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  className
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-space-950/85 p-4 backdrop-blur-md sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <motion.div
            className={cn("panel relative my-8 w-full max-w-3xl bg-space-900/95 p-6 shadow-panel sm:p-8", className)}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="absolute right-4 top-4 rounded-lg border border-white/10 p-1.5 text-coolgray transition hover:border-white/25 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mb-5 pr-10">
              <h3 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">{title}</h3>
              {subtitle && <p className="mt-1.5 text-sm text-coolgray">{subtitle}</p>}
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
