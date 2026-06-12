import re

with open("src/routes/_app/timeline.tsx", "r") as f:
    content = f.read()

# Define the components to be added at the bottom
new_components = """
function MemoryDetailModal({
  activeEntry,
  setActiveEntry,
  setImagePreview,
}: {
  activeEntry: Entry;
  setActiveEntry: (entry: Entry | null) => void;
  setImagePreview: (preview: { src: string; title: string } | null) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={() => setActiveEntry(null)}
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-fade-in"
      />
      <div className="relative w-full max-w-2xl paper-card rounded-[32px] border-2 border-ink p-6 md:p-8 shadow-[var(--shadow-lift)] max-h-[85vh] flex flex-col animate-wobble-in">
        <WashiTape
          color={activeEntry.tape}
          rotate={-3}
          width="6rem"
          className="absolute -top-3 left-10 pointer-events-none"
        />
        <button
          onClick={() => setActiveEntry(null)}
          className="absolute top-4 right-4 h-8 w-8 grid place-items-center rounded-full border-2 border-ink bg-paper text-ink hover:bg-accent cursor-pointer transition-colors font-hand text-xl z-20"
        >
          ✕
        </button>

        <div className="flex-1 overflow-y-auto subtle-scroll pr-2 space-y-6 mt-2 pt-2 px-1 -mx-1">
          <div className="flex items-start gap-4">
            <span className="text-4xl leading-none shrink-0">
              {activeEntry.mood}
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-2xl md:text-3xl text-ink font-bold leading-tight">
                {activeEntry.title}
              </h3>
              <p className="font-accent text-xs md:text-sm uppercase tracking-wider text-ink-soft mt-1.5 flex items-center gap-1.5 flex-wrap">
                <span>{activeEntry.collection || "Unsorted"}</span>
                <span>·</span>
                <span className="font-hand text-xl lowercase">
                  {prettyDate(activeEntry.date)} ({activeEntry.date})
                </span>
                {activeEntry.place && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-0.5">
                      <MapPin className="h-3.5 w-3.5" /> {activeEntry.place}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          {activeEntry.photos && activeEntry.photos.length > 0 && (
            <Collage
              photos={activeEntry.photos}
              onPhotoClick={(idx) =>
                setImagePreview({
                  src: activeEntry.photos![idx],
                  title: activeEntry.title,
                })
              }
            />
          )}

          <div>
            <p className="font-body text-ink-soft text-lg leading-relaxed whitespace-pre-wrap">
              {activeEntry.note}
            </p>
          </div>

          {activeEntry.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {activeEntry.tags.map((t) => (
                <span
                  key={t}
                  className="font-hand text-lg text-ink bg-accent/70 px-3.5 py-1 rounded-full border border-ink/40 shadow-xs"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TimelineContextMenu({
  contextMenu,
  setContextMenu,
  handleDeleteEntry,
  handleMoveEntry,
  shelves,
  isNearRight,
  menuY,
  menuX,
}: {
  contextMenu: { x: number; y: number; targetId: string };
  setContextMenu: (menu: null) => void;
  handleDeleteEntry: (id: string) => void;
  handleMoveEntry: (id: string, shelf: string) => void;
  shelves: string[];
  isNearRight: boolean;
  menuY: number;
  menuX: number;
}) {
  return (
    <div
      className="fixed z-[110] bg-paper border-2 border-ink p-2 rounded-xl shadow-[var(--shadow-paper)] flex flex-col min-w-[170px] animate-fade-in"
      style={{ top: menuY, left: menuX }}
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
          window.location.href = `/create?edit=${contextMenu.targetId}`;
          setContextMenu(null);
        }}
        className="text-left font-hand text-lg hover:bg-accent/40 text-ink px-3 py-1.5 rounded-lg transition-colors cursor-pointer w-full flex items-center gap-1.5"
      >
        <span>✏️</span> Edit Fold
      </button>

      <button
        onClick={() => {
          handleDeleteEntry(contextMenu.targetId);
          setContextMenu(null);
        }}
        className="text-left font-hand text-lg hover:bg-accent/40 text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer w-full flex items-center gap-1.5"
      >
        <span>🗑</span> Delete Fold
      </button>

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
              handleMoveEntry(contextMenu.targetId, "");
              setContextMenu(null);
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
                handleMoveEntry(contextMenu.targetId, s);
                setContextMenu(null);
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

function ConfirmDialogModal({
  dialog,
  setDialog,
}: {
  dialog: ConfirmDialog;
  setDialog: (dialog: null) => void;
}) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 animate-fade-in">
      <div
        onClick={() => setDialog(null)}
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
            onClick={() => setDialog(null)}
            className="font-hand text-lg border-2 border-ink/40 px-5 py-1.5 rounded-full bg-paper text-ink-soft hover:bg-accent/30 cursor-pointer transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={dialog.onConfirm}
            className="font-hand text-lg border-2 border-ink px-6 py-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/80 cursor-pointer shadow-[2px_2px_0_var(--color-ink)] active:translate-y-0.5 transition-all font-bold"
          >
            Yes, do it
          </button>
        </div>
      </div>
    </div>
  );
}

function ImageZoomModal({
  imagePreview,
  setImagePreview,
}: {
  imagePreview: { src: string; title: string };
  setImagePreview: (preview: null) => void;
}) {
  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
      <button
        type="button"
        onClick={() => setImagePreview(null)}
        className="absolute inset-0 cursor-zoom-out"
        aria-label="Close enlarged image"
      />
      <div className="relative max-h-[90vh] w-full max-w-5xl">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="truncate font-display text-2xl text-paper">
            {imagePreview.title}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <a
              href={imagePreview.src}
              download={`${imagePreview.title || "momentstash-image"}.jpg`}
              className="inline-flex h-10 items-center gap-2 rounded-full border-2 border-paper bg-paper px-4 font-hand text-lg text-ink shadow-[2px_2px_0_var(--color-ink)]"
            >
              <Download className="h-4 w-4" /> Download
            </a>
            <button
              type="button"
              onClick={() => setImagePreview(null)}
              className="grid h-10 w-10 place-items-center rounded-full border-2 border-paper bg-paper font-hand text-xl text-ink cursor-pointer"
              aria-label="Close enlarged image"
            >
              ✕
            </button>
          </div>
        </div>
        <img
          src={imagePreview.src}
          alt=""
          className="mx-auto max-h-[calc(90vh-4rem)] max-w-full rounded-2xl border-2 border-paper object-contain shadow-[var(--shadow-lift)]"
        />
      </div>
    </div>
  );
}

function prettyDate(iso: string) {"""

content = content.replace("function prettyDate(iso: string) {", new_components)

import sys
def get_replacement():
    return """
      {/* Immersive Memory Detail Popup Modal — Joint Scrollable */}
      {activeEntry && (
        <MemoryDetailModal
          activeEntry={activeEntry}
          setActiveEntry={setActiveEntry}
          setImagePreview={setImagePreview}
        />
      )}

      {/* Floating Scrapbook Custom Context Menu */}
      {contextMenu && (
        <TimelineContextMenu
          contextMenu={contextMenu}
          setContextMenu={setContextMenu}
          handleDeleteEntry={handleDeleteEntry}
          handleMoveEntry={handleMoveEntry}
          shelves={shelves}
          isNearRight={isNearRight}
          menuY={menuY}
          menuX={menuX}
        />
      )}

      {/* ── Custom Scrapbook Confirm Dialog ── */}
      {dialog && (
        <ConfirmDialogModal
          dialog={dialog}
          setDialog={setDialog}
        />
      )}

      {/* Immersive Image Zoom Modal Overlay */}
      {imagePreview && (
        <ImageZoomModal
          imagePreview={imagePreview}
          setImagePreview={setImagePreview}
        />
      )}
    </main>
  );
}
"""

start_str = """      {/* Immersive Memory Detail Popup Modal — Joint Scrollable */}"""
end_str = """    </main>
  );
}"""

start_idx = content.find(start_str)
end_idx = content.find(end_str) + len(end_str)

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + get_replacement() + content[end_idx:]
else:
    print("Could not find blocks to replace!")
    sys.exit(1)

with open("src/routes/_app/timeline.tsx", "w") as f:
    f.write(content)
