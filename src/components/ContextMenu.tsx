import React from "react";
import { WashiTape } from "@/components/WashiTape";

interface ContextMenuProps {
  contextMenu: { x: number; y: number; targetId: string } | null;
  shelves: string[];
  isNearRight: boolean;
  menuX: number;
  menuY: number;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, shelf: string) => void;
  onClose: () => void;
}

export function ContextMenu({
  contextMenu,
  shelves,
  isNearRight,
  menuX,
  menuY,
  onEdit,
  onDelete,
  onMove,
  onClose,
}: ContextMenuProps) {
  if (!contextMenu) return null;

  return (
    <div
      className="fixed z-[150] bg-paper border-2 border-ink p-2 rounded-xl shadow-[var(--shadow-paper)] flex flex-col min-w-[170px] animate-fade-in"
      style={{
        top: menuY,
        left: menuX,
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <WashiTape
        color="yellow"
        rotate={-2}
        width="3.5rem"
        className="absolute -top-2.5 left-4 pointer-events-none"
      />

      <button
        onClick={() => {
          onEdit(contextMenu.targetId);
          onClose();
        }}
        className="text-left font-hand text-lg hover:bg-accent/40 text-ink px-3 py-1.5 rounded-lg transition-colors cursor-pointer w-full flex items-center gap-1.5"
      >
        <span>✏️</span> Edit Fold
      </button>

      <button
        onClick={() => {
          onDelete(contextMenu.targetId);
          onClose();
        }}
        className="text-left font-hand text-lg hover:bg-accent/40 text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer w-full flex items-center gap-1.5"
      >
        <span>🗑</span> Delete Fold
      </button>

      {/* Submenu for moving to shelf */}
      <div className="relative group/shelf">
        <button className="text-left font-hand text-lg hover:bg-accent/40 text-ink px-3 py-1.5 rounded-lg transition-colors cursor-pointer w-full flex items-center justify-between gap-2">
          <span>📁 Move to Shelf</span>
          <span className="text-xs">➜</span>
        </button>

        <div
          className={[
            "absolute top-0 bg-paper border-2 border-ink p-2 rounded-xl shadow-[var(--shadow-paper)] flex flex-col min-w-[150px] hidden group-hover/shelf:block animate-fade-in",
            isNearRight ? "right-full mr-1" : "left-full ml-1",
          ].join(" ")}
        >
          <button
            onClick={() => {
              onMove(contextMenu.targetId, "");
              onClose();
            }}
            className="text-left font-hand text-base hover:bg-accent/40 text-ink-soft hover:text-ink px-3 py-1 rounded-lg transition-colors cursor-pointer w-full"
          >
            ✿ Unsorted
          </button>

          {shelves.length > 0 && (
            <div className="border-t border-dashed border-ink/20 my-1" />
          )}

          {shelves.map((s) => (
            <button
              key={s}
              onClick={() => {
                onMove(contextMenu.targetId, s);
                onClose();
              }}
              className="text-left font-hand text-base hover:bg-accent/40 text-ink-soft hover:text-ink px-3 py-1 rounded-lg transition-colors cursor-pointer w-full truncate"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
