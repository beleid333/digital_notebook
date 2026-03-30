/**
 * Canvas — The Notebook Paper
 * Design: Tactile Realism Brutalist Skeuomorphism
 *
 * The main writing surface. Features:
 * - Lined paper with blue rule lines and red margin
 * - Dark binding strip on the left with metallic binder rings
 * - Editable page title in Caveat handwriting font
 * - Editable main content area
 * - Draggable sticky notes (click to place, drag to move)
 * - Taped photo images
 * - Toolbar for adding sticky notes and images
 */

import { useRef, useState, useCallback, useEffect } from "react";
import {
  StickyNote as StickyNoteIcon,
  Image as ImageIcon,
  Trash2,
  RotateCcw,
  Download,
} from "lucide-react";
import { nanoid } from "nanoid";
import type { Page, StickyNote, TapedImage } from "@/data/binderData";

const STICKY_COLORS = [
  "#FEF08A", // yellow
  "#FBCFE8", // pink
  "#BAE6FD", // blue
  "#BBF7D0", // green
  "#FED7AA", // orange
  "#E9D5FF", // purple
];

const RING_POSITIONS = [80, 200, 320, 440, 560, 680];

interface CanvasProps {
  page: Page;
  onUpdatePage: (updated: Page) => void;
  sectionColor: string;
}

export default function Canvas({ page, onUpdatePage, sectionColor }: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<{
    id: string;
    type: "sticky" | "image";
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);
  const [placingSticky, setPlacingSticky] = useState(false);
  const [selectedStickyColor, setSelectedStickyColor] = useState(STICKY_COLORS[0]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const animatedNotes = useRef<Set<string>>(new Set());

  // ── Title update ─────────────────────────────────────────────────────────
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdatePage({ ...page, title: e.target.value });
  };

  // ── Content update ───────────────────────────────────────────────────────
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdatePage({ ...page, content: e.target.value });
  };

  // ── Place sticky note on canvas click ────────────────────────────────────
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!placingSticky) return;
      if ((e.target as HTMLElement).closest(".sticky-note")) return;
      if ((e.target as HTMLElement).closest(".taped-image")) return;

      const rect = canvasRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left - 100;
      const y = e.clientY - rect.top - 60;

      const newNote: StickyNote = {
        id: nanoid(),
        x: Math.max(70, Math.min(x, rect.width - 220)),
        y: Math.max(10, Math.min(y, rect.height - 150)),
        width: 200,
        height: 140,
        content: "",
        color: selectedStickyColor,
        rotation: (Math.random() - 0.5) * 6,
      };

      onUpdatePage({
        ...page,
        stickyNotes: [...page.stickyNotes, newNote],
      });
      setEditingNoteId(newNote.id);
      setPlacingSticky(false);
    },
    [placingSticky, page, onUpdatePage, selectedStickyColor]
  );

  // ── Drag sticky notes ────────────────────────────────────────────────────
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, id: string, type: "sticky" | "image") => {
      if (editingNoteId === id) return;
      e.preventDefault();
      const item =
        type === "sticky"
          ? page.stickyNotes.find((n) => n.id === id)
          : page.tapedImages.find((i) => i.id === id);
      if (!item) return;

      setDragging({
        id,
        type,
        startX: e.clientX,
        startY: e.clientY,
        origX: item.x,
        origY: item.y,
      });
    },
    [page, editingNoteId]
  );

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragging.startX;
      const dy = e.clientY - dragging.startY;

      if (dragging.type === "sticky") {
        onUpdatePage({
          ...page,
          stickyNotes: page.stickyNotes.map((n) =>
            n.id === dragging.id
              ? { ...n, x: dragging.origX + dx, y: dragging.origY + dy }
              : n
          ),
        });
      } else {
        onUpdatePage({
          ...page,
          tapedImages: page.tapedImages.map((i) =>
            i.id === dragging.id
              ? { ...i, x: dragging.origX + dx, y: dragging.origY + dy }
              : i
          ),
        });
      }
    };

    const handleMouseUp = () => setDragging(null);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, page, onUpdatePage]);

  // ── Delete sticky note ───────────────────────────────────────────────────
  const deleteNote = (id: string) => {
    onUpdatePage({
      ...page,
      stickyNotes: page.stickyNotes.filter((n) => n.id !== id),
    });
    if (editingNoteId === id) setEditingNoteId(null);
  };

  const deleteImage = (id: string) => {
    onUpdatePage({
      ...page,
      tapedImages: page.tapedImages.filter((i) => i.id !== id),
    });
  };

  // ── Update sticky note content ───────────────────────────────────────────
  const updateNoteContent = (id: string, content: string) => {
    onUpdatePage({
      ...page,
      stickyNotes: page.stickyNotes.map((n) =>
        n.id === id ? { ...n, content } : n
      ),
    });
  };

  // ── Add taped image ──────────────────────────────────────────────────────
  const handleAddImage = () => {
    if (!imageUrl.trim()) return;
    const newImage: TapedImage = {
      id: nanoid(),
      x: 120 + Math.random() * 80,
      y: 100 + Math.random() * 80,
      src: imageUrl.trim(),
      rotation: (Math.random() - 0.5) * 8,
      width: 200,
    };
    onUpdatePage({
      ...page,
      tapedImages: [...page.tapedImages, newImage],
    });
    setImageUrl("");
    setShowImageModal(false);
  };

  // ── Clear all notes ──────────────────────────────────────────────────────
  const clearAllNotes = () => {
    onUpdatePage({ ...page, stickyNotes: [], tapedImages: [] });
    setEditingNoteId(null);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
      }}
    >
      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 16px",
          background: "linear-gradient(180deg, #F0E8D8 0%, #E8DCC8 100%)",
          borderBottom: "1px solid #C0A880",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          flexShrink: 0,
          flexWrap: "wrap",
        }}
      >
        {/* Sticky note color picker */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {STICKY_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedStickyColor(c)}
              title={`Sticky: ${c}`}
              style={{
                width: 16,
                height: 16,
                borderRadius: 2,
                background: c,
                border:
                  selectedStickyColor === c
                    ? "2px solid #3A2010"
                    : "1px solid rgba(0,0,0,0.2)",
                cursor: "pointer",
                transform: selectedStickyColor === c ? "scale(1.25)" : "scale(1)",
                transition: "transform 0.1s ease",
                boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
              }}
            />
          ))}
        </div>

        <div
          style={{
            width: 1,
            height: 20,
            background: "#C0A880",
            margin: "0 2px",
          }}
        />

        <button
          className="toolbar-btn"
          onClick={() => setPlacingSticky((v) => !v)}
          style={{
            background: placingSticky
              ? `linear-gradient(180deg, ${selectedStickyColor} 0%, ${selectedStickyColor}CC 100%)`
              : undefined,
            borderColor: placingSticky ? "#A08040" : undefined,
          }}
        >
          <StickyNoteIcon size={12} />
          {placingSticky ? "Click to place..." : "Add Note"}
        </button>

        <button
          className="toolbar-btn"
          onClick={() => setShowImageModal(true)}
        >
          <ImageIcon size={12} />
          Tape Photo
        </button>

        <div style={{ flex: 1 }} />

        <button
          className="toolbar-btn"
          onClick={clearAllNotes}
          title="Clear all sticky notes and images"
          style={{ color: "#8B2020" }}
        >
          <RotateCcw size={12} />
          Clear Notes
        </button>

        <div className="page-number">
          pg. {page.sectionId.replace("sec-", "")}
        </div>
      </div>

      {/* ── Paper + Binding ──────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Binding strip */}
        <div className="binding-strip" style={{ flexShrink: 0 }}>
          {RING_POSITIONS.map((pos) => (
            <div
              key={pos}
              className="binder-ring"
              style={{
                position: "absolute",
                top: pos,
                left: "50%",
                transform: "translateX(-50%)",
              }}
            />
          ))}
        </div>

        {/* Paper */}
        <div
          ref={canvasRef}
          className={`notebook-paper paper-scroll paper-fade-in ${
            placingSticky ? "cursor-crosshair" : ""
          }`}
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            position: "relative",
            padding: "24px 32px 80px 72px",
            cursor: placingSticky ? "crosshair" : "default",
          }}
          onClick={handleCanvasClick}
        >
          {/* Hole punch shadows on left */}
          {RING_POSITIONS.map((pos) => (
            <div
              key={pos}
              style={{
                position: "absolute",
                left: 8,
                top: pos + 4,
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(0,0,0,0.15) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
          ))}

          {/* Page title */}
          <div
            style={{
              marginBottom: 4,
              paddingBottom: 4,
              borderBottom: `2px solid ${sectionColor}40`,
            }}
          >
            <input
              className="page-title-input"
              value={page.title}
              onChange={handleTitleChange}
              placeholder="Page Title..."
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Main content */}
          <textarea
            className="page-content-textarea"
            value={page.content}
            onChange={handleContentChange}
            placeholder="Start writing... or click anywhere to add a sticky note."
            style={{
              minHeight: 400,
              display: "block",
            }}
            onClick={(e) => e.stopPropagation()}
          />

          {/* Sticky notes */}
          {page.stickyNotes.map((note) => (
            <StickyNoteComponent
              key={note.id}
              note={note}
              isEditing={editingNoteId === note.id}
              onMouseDown={(e) => handleMouseDown(e, note.id, "sticky")}
              onDoubleClick={() => setEditingNoteId(note.id)}
              onBlur={() => setEditingNoteId(null)}
              onContentChange={(content) => updateNoteContent(note.id, content)}
              onDelete={() => deleteNote(note.id)}
              isNew={!animatedNotes.current.has(note.id)}
              onAnimated={() => animatedNotes.current.add(note.id)}
            />
          ))}

          {/* Taped images */}
          {page.tapedImages.map((img) => (
            <TapedImageComponent
              key={img.id}
              image={img}
              onMouseDown={(e) => handleMouseDown(e, img.id, "image")}
              onDelete={() => deleteImage(img.id)}
            />
          ))}

          {/* Placing hint */}
          {placingSticky && (
            <div
              style={{
                position: "fixed",
                bottom: 24,
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(40,20,0,0.85)",
                color: "white",
                padding: "8px 18px",
                borderRadius: 20,
                fontFamily: "'Libre Baskerville', serif",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.04em",
                pointerEvents: "none",
                zIndex: 500,
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              }}
            >
              Click anywhere on the paper to place your note
            </div>
          )}
        </div>
      </div>

      {/* ── Add Image Modal ──────────────────────────────────────────────── */}
      {showImageModal && (
        <div className="modal-overlay" onClick={() => setShowImageModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3
              style={{
                fontFamily: "'Libre Baskerville', serif",
                fontSize: 16,
                fontWeight: 700,
                color: "#3A2010",
                marginBottom: 14,
              }}
            >
              Tape a Photo
            </h3>

            <label
              style={{
                display: "block",
                fontFamily: "'Libre Baskerville', serif",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#7A4F2E",
                marginBottom: 6,
              }}
            >
              Image URL
            </label>
            <input
              autoFocus
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddImage()}
              placeholder="https://example.com/photo.jpg"
              style={{
                width: "100%",
                padding: "8px 10px",
                fontFamily: "'Courier Prime', monospace",
                fontSize: 13,
                background: "rgba(255,255,255,0.6)",
                border: "1px solid #C0A880",
                borderRadius: 4,
                outline: "none",
                color: "#2A2A2A",
                marginBottom: 8,
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
              }}
            />
            <p
              style={{
                fontFamily: "'Libre Baskerville', serif",
                fontSize: 11,
                color: "#9A7A5A",
                marginBottom: 16,
                fontStyle: "italic",
              }}
            >
              Tip: Use any publicly accessible image URL. The photo will appear
              taped to the paper with a slight rotation.
            </p>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                className="toolbar-btn"
                onClick={() => setShowImageModal(false)}
              >
                Cancel
              </button>
              <button
                onClick={handleAddImage}
                disabled={!imageUrl.trim()}
                style={{
                  padding: "6px 16px",
                  background: imageUrl.trim()
                    ? "linear-gradient(180deg, #5C3A1ECC 0%, #3A2010 100%)"
                    : "#C0A880",
                  border: "1px solid rgba(0,0,0,0.2)",
                  borderRadius: 4,
                  color: "white",
                  fontFamily: "'Libre Baskerville', serif",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: imageUrl.trim() ? "pointer" : "not-allowed",
                  boxShadow:
                    "0 1px 3px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)",
                }}
              >
                Tape It!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sticky Note Sub-component ────────────────────────────────────────────────

interface StickyNoteProps {
  note: StickyNote;
  isEditing: boolean;
  isNew: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  onBlur: () => void;
  onContentChange: (content: string) => void;
  onDelete: () => void;
  onAnimated: () => void;
}

function StickyNoteComponent({
  note,
  isEditing,
  isNew,
  onMouseDown,
  onDoubleClick,
  onBlur,
  onContentChange,
  onDelete,
  onAnimated,
}: StickyNoteProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div
      className={`sticky-note ${isNew ? "sticky-drop" : ""}`}
      style={{
        left: note.x,
        top: note.y,
        width: note.width,
        height: note.height,
        backgroundColor: note.color,
        transform: `rotate(${note.rotation}deg)`,
        ["--rotation" as string]: `${note.rotation}deg`,
        color: "#2A2A2A",
        zIndex: isEditing ? 150 : undefined,
      }}
      onMouseDown={isEditing ? undefined : onMouseDown}
      onDoubleClick={onDoubleClick}
      onAnimationEnd={onAnimated}
    >
      {/* Delete button */}
      <button
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        style={{
          position: "absolute",
          top: 3,
          right: 4,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.15)",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "rgba(0,0,0,0.5)",
          padding: 0,
          opacity: 0,
          transition: "opacity 0.1s ease",
        }}
        className="note-delete-btn"
      >
        <Trash2 size={8} />
      </button>

      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={note.content}
          onChange={(e) => onContentChange(e.target.value)}
          onBlur={onBlur}
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            resize: "none",
            width: "100%",
            height: "calc(100% - 8px)",
            fontFamily: "'Caveat', cursive",
            fontSize: 16,
            lineHeight: 1.5,
            color: "#2A2A2A",
            cursor: "text",
            padding: 0,
          }}
          placeholder="Write your note..."
        />
      ) : (
        <div
          style={{
            fontFamily: "'Caveat', cursive",
            fontSize: 16,
            lineHeight: 1.5,
            color: "#2A2A2A",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            height: "100%",
            overflow: "hidden",
          }}
          title="Double-click to edit"
        >
          {note.content || (
            <span style={{ color: "rgba(0,0,0,0.3)", fontStyle: "italic" }}>
              Double-click to edit...
            </span>
          )}
        </div>
      )}

      <style>{`
        .sticky-note:hover .note-delete-btn {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}

// ─── Taped Image Sub-component ────────────────────────────────────────────────

interface TapedImageProps {
  image: TapedImage;
  onMouseDown: (e: React.MouseEvent) => void;
  onDelete: () => void;
}

function TapedImageComponent({ image, onMouseDown, onDelete }: TapedImageProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="taped-image"
      style={{
        left: image.x,
        top: image.y,
        transform: `rotate(${image.rotation}deg)`,
        width: image.width + 16,
      }}
      onMouseDown={onMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && (
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          style={{
            position: "absolute",
            top: -8,
            right: -8,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#DC2626",
            border: "2px solid white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "white",
            padding: 0,
            zIndex: 10,
            boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
          }}
        >
          <Trash2 size={10} />
        </button>
      )}
      <img
        src={image.src}
        alt="Taped photo"
        style={{
          width: "100%",
          display: "block",
          objectFit: "cover",
          userSelect: "none",
          pointerEvents: "none",
        }}
        draggable={false}
      />
    </div>
  );
}
