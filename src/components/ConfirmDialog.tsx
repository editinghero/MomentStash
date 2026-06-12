import React from "react";
import { WashiTape } from "@/components/WashiTape";

interface ConfirmDialogProps {
  dialog: { title: string; message: string; onConfirm: () => void } | null;
  onClose: () => void;
}

export function ConfirmDialog({ dialog, onClose }: ConfirmDialogProps) {
  if (!dialog) return null;

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 animate-fade-in">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />
      <div className="relative w-full max-w-md paper-card rounded-[24px] border-2 border-ink p-6 md:p-8 shadow-[var(--shadow-lift)] bg-paper animate-wobble-in flex flex-col z-50">
        <WashiTape
          color="pink"
          rotate={-2}
          width="5rem"
          className="absolute -top-3.5 left-12 pointer-events-none"
        />
        <h4 className="font-display text-2xl text-ink font-bold mb-3">
          {dialog.title}
        </h4>
        <p className="font-hand text-xl text-ink-soft mb-5 leading-relaxed">
          {dialog.message}
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="font-hand text-lg border-2 border-ink/40 px-5 py-1.5 rounded-full bg-paper text-ink-soft hover:bg-accent/30 cursor-pointer transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={dialog.onConfirm}
            className="font-hand text-lg border-2 border-ink bg-primary px-6 py-1.5 rounded-full text-paper shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
