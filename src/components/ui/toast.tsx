"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export type ToastMsg = { id: number; kind: "ok" | "error"; text: string };

export function ToastStack({ items, onDismiss }: { items: ToastMsg[]; onDismiss: (id: number) => void }) {
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[200] flex w-[min(92vw,360px)] flex-col gap-2">
      <AnimatePresence>
        {items.map((t) => (
          <motion.button
            key={t.id}
            layout
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            onClick={() => onDismiss(t.id)}
            className={`pointer-events-auto flex items-start gap-2.5 rounded-xl border p-3.5 text-left text-xs shadow-panel backdrop-blur-md ${
              t.kind === "ok"
                ? "border-emerald-400/30 bg-emerald-950/80 text-emerald-200"
                : "border-rose-400/30 bg-rose-950/80 text-rose-200"
            }`}
          >
            {t.kind === "ok" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <span className="leading-relaxed">{t.text}</span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
