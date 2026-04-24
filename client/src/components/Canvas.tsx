/**
 * Canvas — The Notebook Paper (Mobile Fixed)
 */

import { useRef, useState, useCallback, useEffect } from "react";
import {
  StickyNote as StickyNoteIcon,
  Image as ImageIcon,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { nanoid } from "nanoid";
import type { Page, StickyNote, TapedImage } from "@/data/binderData";

const STICKY_COLORS = [
  "#FEF08A",
  "#FBCFE8",
  "#BAE6FD",
  "#BBF7D0",
  "#FED7AA",
  "#E9D5FF",
];

const RING_POSITIONS = [80, 200, 320, 440, 560, 680];

interface CanvasProps {
  page: Page;
  onUpdatePage: (updated: Page) => void;
  sectionColor: string;
}

function getEventCoords(e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) {
  if ('touches' in e && e.touches.length > 0) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  if ('changedTouches' in e && e.changedTouches.length > 0) {
    return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
  }
  if ('clientX' in e) {
    return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY };
  }
  return { x: 0, y: 0 };
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
  
  // Refs to prevent drag tearing on mobile
  const pageRef = useRef(page);
  const onUpdatePageRef = useRef(onUpdatePage);
  
  useEffect(() => {
    pageRef.current = page;
    onUpdatePageRef.current = onUpdatePage;
  }, [page, onUpdatePage]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdatePage({ ...page, title: e.target.value });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdatePage({ ...page, content: e.target.value });
  };

  const handleCanvasInteraction = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
      if (!placingSticky) return;
      e.preventDefault();
      e.stopPropagation();
      
      const target = e.target as HTMLElement;
      if (target.closest(".sticky-note")) return;
      if (target.closest(".taped-image")) return;

      const rect = canvasRef.current!.getBoundingClientRect();
      const coords = getEventCoords(e);
      
      let x = coords.x - rect.left - 100;
      let y = coords.y - rect.top - 60;

      x = Math.max(10, Math.min(x, rect.width - 150));
      y = Math.max(10, Math.min(y, rect.height - 150));

      const newNote: StickyNote = {
        id: nanoid(),
        x: x,
        y: y,
        width: Math.min(200, rect.width - 40),
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

  const handleDragStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent, id: string, type: "sticky" | "image") => {
      if (editingNoteId === id) return;
      e.preventDefault();
      e.stopPropagation();
      
      const item =
        type === "sticky"
          ? page.stickyNotes.find((n) => n.id === id)
          : page.tapedImages.find((i) => i.id === id);
      if (!item) return;

      const coords = getEventCoords(e);
      setDragging({
        id,
        type,
        startX: coords.x,
        startY: coords.y,
        origX: item.x,
        origY: item.y,
      });
    },
    [page, editingNoteId]
  );

  useEffect(() => {
    if (!dragging) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const coords = getEventCoords(e);
      const dx = coords.x - dragging.startX;
      const dy = coords.y - dragging.startY;

      if (dragging.type === "sticky") {
        onUpdatePageRef.current({
          ...pageRef.current,
          stickyNotes: pageRef.current.stickyNotes.map((n) =>
            n.id === dragging.id
              ? { ...n, x: dragging.origX + dx, y: dragging.origY + dy }
              : n
          ),
        });
      } else {
        onUpdatePageRef.current({
          ...pageRef.current,
          tapedImages: pageRef.current.tapedImages.map((i) =>
            i.id === dragging.id
              ? { ...i, x: dragging.origX + dx, y: dragging.origY + dy }
              : i
          ),
        });
      }
    };

    const handleEnd = () => setDragging(null);

    window.addEventListener("mousemove", handleMove, { passive: false });
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleEnd);
    window.addEventListener("touchcancel", handleEnd);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
      window.removeEventListener("touchcancel", handleEnd);
    };
  }, [dragging]);

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

  const updateNoteContent = (id: string, content: string) => {
    onUpdatePage({
      ...page,
      stickyNotes: page.stickyNotes.map((n) =>
        n.id === id ? { ...n, content } : n
      ),
    });
  };

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

  const clearAllNotes = () => {
    onUpdatePage({ ...page, stickyNotes: [], tapedImages: [] });
    setEditingNoteId(null);
  };

  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const isMobile = viewportWidth < 768;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: isMobile ? 4 : 6,
          padding: isMobile ? "4px 8px" : "6px 16px",
          background: "linear-gradient(180deg, #F0E8D8 0%, #E8DCC8 100%)",
          borderBottom: "1px solid #C0A880",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          flexShrink: 0,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 2 : 4 }}>
          {STICKY_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedStickyColor(c)}
              style={{
                width: isMobile ? 14 : 16,
                height: isMobile ? 14 : 16,
                borderRadius: 2,
                background: c,
                border: selectedStickyColor === c ? "2px solid #3A2010" : "1px solid rgba(0,0,0,0.2)",
                cursor: "pointer",
                transform: selectedStickyColor === c ? "scale(1.25)" : "scale(1)",
                transition: "transform 0.1s ease",
                boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
              }}
            />
          ))}
        </div>

        <div style={{ width: 1, height: 20, background: "#C0A880", margin: "0 2px" }} />

        <button
          className="toolbar-btn"
          onClick={() => setPlacingSticky((v) => !v)}
          style={{
            background: placingSticky ? `linear-gradient(180deg, ${selectedStickyColor} 0%, ${selectedStickyColor}CC 100%)` : undefined,
            borderColor: placingSticky ? "#A08040" : undefined,
            fontSize: isMobile ? 10 : 12,
          }}
        >
          <StickyNoteIcon size={isMobile ? 10 : 12} />
          {isMobile ? (placingSticky ? "Tap..." : "Note") : (placingSticky ? "Click to place..." : "Add Note")}
        </button>

        <button className="toolbar-btn" onClick={() => setShowImageModal(true)} style={{ fontSize: isMobile ? 10 : 12 }}>
          <ImageIcon size={isMobile ? 10 : 12} />
          {isMobile ? "Photo" : "Tape Photo"}
        </button>

        <div style={{ flex: 1 }} />

        <button className="toolbar-btn" onClick={clearAllNotes} title="Clear all" style={{ color: "#8B2020", fontSize: isMobile ? 10 : 12 }}>
          <RotateCcw size={isMobile ? 10 : 12} />
          {isMobile ? "Clear" : "Clear Notes"}
        </button>

        <div className="page-number">pg. {page.sectionId.replace("sec-", "")}</div>
      </div>

      {/* Paper + Binding */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
        {!isMobile && (
          <div className="binding-strip" style={{ flexShrink: 0 }}>
            {RING_POSITIONS.map((pos) => (
              <div key={pos} className="binder-ring" style={{ position: "absolute", top: pos, left: "50%", transform: "translateX(-50%)" }} />
            ))}
          </div>
        )}

        <div
          ref={canvasRef}
          className={`notebook-paper paper-scroll paper-fade-in ${placingSticky ? "cursor-crosshair" : ""}`}
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            position: "relative",
            padding: isMobile ? "16px 12px 80px 12px" : "24px 32px 80px 72px",
            cursor: placingSticky ? "crosshair" : "default",
            touchAction: placingSticky ? "none" : "pan-y",
          }}
          onClick={handleCanvasInteraction}
          onTouchStart={handleCanvasInteraction}
        >
          {!isMobile && RING_POSITIONS.map((pos) => (
            <div key={pos} style={{ position: "absolute", left: 8, top: pos + 4, width: 20, height: 20, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,0,0,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
          ))}

          <div style={{ marginBottom: 4, paddingBottom: 4, borderBottom: `2px solid ${sectionColor}40` }}>
            <input className="page-title-input" value={page.title} onChange={handleTitleChange} placeholder="Page Title..." onClick={(e) => e.stopPropagation()} />
          </div>

          <textarea
            className="page-content-textarea"
            value={page.content}
            onChange={handleContentChange}
            placeholder="Start writing... or tap anywhere to add a sticky note."
            style={{ minHeight: isMobile ? 200 : 400, display: "block" }}
            onClick={(e) => e.stopPropagation()}
          />

          {page.stickyNotes.map((note) => (
            <StickyNoteComponent
              key={note.id}
              note={note}
              isEditing={editingNoteId === note.id}
              onMouseDown={(e) => handleDragStart(e, note.id, "sticky")}
              onTouchStart={(e) => handleDragStart(e, note.id, "sticky")}
              onDoubleClick={() => setEditingNoteId(note.id)}
              onBlur={() => setEditingNoteId(null)}
              onContentChange={(content) => updateNoteContent(note.id, content)}
              onDelete={() => deleteNote(note.id)}
              isNew={!animatedNotes.current.has(note.id)}
              onAnimated={() => animatedNotes.current.add(note.id)}
              isMobile={isMobile}
            />
          ))}

          {page.tapedImages.map((img) => (
            <TapedImageComponent
              key={img.id}
              image={img}
              onMouseDown={(e) => handleDragStart(e, img.id, "image")}
              onTouchStart={(e) => handleDragStart(e, img.id, "image")}
              onDelete={() => deleteImage(img.id)}
              isMobile={isMobile}
            />
          ))}

          {placingSticky && (
            <div style={{
              position: "fixed",
              bottom: isMobile ? 60 : 24,
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(40,20,0,0.9)",
              color: "white",
              padding: isMobile ? "10px 20px" : "8px 18px",
              borderRadius: 20,
              fontFamily: "'Libre Baskerville', serif",
              fontSize: isMobile ? 14 : 12,
              fontWeight: 700,
              letterSpacing: "0.04em",
              pointerEvents: "none",
              zIndex: 500,
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              maxWidth: "90vw",
              textAlign: "center",
            }}>
              {isMobile ? "Tap anywhere on the paper to place your note" : "Click anywhere on the paper to place your note"}
            </div>
          )}
        </div>
      </div>

      {showImageModal && (
        <div className="modal-overlay" onClick={() => setShowImageModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, fontWeight: 700, color: "#3A2010", marginBottom: 14 }}>Tape a Photo</h3>
            <label style={{ display: "block", fontFamily: "'Libre Baskerville', serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7A4F2E", marginBottom: 6 }}>Image URL</label>
            <input autoFocus value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddImage()} placeholder="https://example.com/photo.jpg" style={{ width: "100%", padding: "8px 10px", fontFamily: "'Courier Prime', monospace", fontSize: 13, background: "rgba(255,255,255,0.6)", border: "1px solid #C0A880", borderRadius: 4, outline: "none", color: "#2A2A2A", marginBottom: 8, boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)" }} />
            <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 11, color: "#9A7A5A", marginBottom: 16, fontStyle: "italic" }}>Tip: Use any publicly accessible image URL.</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="toolbar-btn" onClick={() => setShowImageModal(false)}>Cancel</button>
              <button onClick={handleAddImage} disabled={!imageUrl.trim()} style={{ padding: "6px 16px", background: imageUrl.trim() ? "linear-gradient(180deg, #5C3A1ECC 0%, #3A2010 100%)" : "#C0A880", border: "1px solid rgba(0,0,0,0.2)", borderRadius: 4, color: "white", fontFamily: "'Libre Baskerville', serif", fontSize: 12, fontWeight: 700, cursor: imageUrl.trim() ? "pointer" : "not-allowed", boxShadow: "0 1px 3px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)" }}>Tape It!</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sticky Note Sub-component
interface StickyNoteProps {
  note: StickyNote;
  isEditing: boolean;
  isNew: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onDoubleClick: () => void;
  onBlur: () => void;
  onContentChange: (content: string) => void;
  onDelete: () => void;
  onAnimated: () => void;
  isMobile: boolean;
}

function StickyNoteComponent({ note, isEditing, isNew, onMouseDown, onTouchStart, onDoubleClick, onBlur, onContentChange, onDelete, onAnimated, isMobile }: StickyNoteProps) {
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
        width: isMobile ? Math.min(note.width, 160) : note.width,
        height: isMobile ? Math.min(note.height, 120) : note.height,
        backgroundColor: note.color,
        transform: `rotate(${note.rotation}deg)`,
        ["--rotation" as string]: `${note.rotation}deg`,
        color: "#2A2A2A",
        zIndex: isEditing ? 150 : undefined,
        WebkitUserSelect: isEditing ? "text" : "none",
        userSelect: isEditing ? "text" : "none",
      }}
      onMouseDown={isEditing ? undefined : onMouseDown}
      onTouchStart={isEditing ? undefined : onTouchStart}
      onClick={(e) => { if (!isEditing) e.stopPropagation(); }}
      onDoubleClick={onDoubleClick}
      onAnimationEnd={onAnimated}
    >
      <button
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        style={{ position: "absolute", top: 3, right: 4, width: isMobile ? 20 : 16, height: isMobile ? 20 : 16, borderRadius: "50%", background: "rgba(0,0,0,0.15)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(0,0,0,0.5)", padding: 0, opacity: isMobile ? 0.8 : 0, transition: "opacity 0.1s ease", zIndex: 10 }}
        className="note-delete-btn"
      >
        <Trash2 size={isMobile ? 10 : 8} />
      </button>

      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={note.content}
          onChange={(e) => onContentChange(e.target.value)}
          onBlur={onBlur}
          style={{ background: "transparent", border: "none", outline: "none", resize: "none", width: "100%", height: "calc(100% - 8px)", fontFamily: "'Caveat', cursive", fontSize: isMobile ? 14 : 16, lineHeight: 1.4, color: "#2A2A2A", cursor: "text", padding: "4px" }}
          placeholder="Write your note..."
        />
      ) : (
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: isMobile ? 14 : 16, lineHeight: 1.4, color: "#2A2A2A", whiteSpace: "pre-wrap", wordBreak: "break-word", height: "100%", overflow: "hidden", padding: "4px" }} title="Double-tap to edit">
          {note.content || <span style={{ color: "rgba(0,0,0,0.3)", fontStyle: "italic" }}>Double-tap to edit...</span>}
        </div>
      )}
    </div>
  );
}

// Taped Image Sub-component
interface TapedImageProps {
  image: TapedImage;
  onMouseDown: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onDelete: () => void;
  isMobile: boolean;
}

function TapedImageComponent({ image, onMouseDown, onTouchStart, onDelete, isMobile }: TapedImageProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="taped-image"
      style={{ left: image.x, top: image.y, transform: `rotate(${image.rotation}deg)`, width: (isMobile ? Math.min(image.width, 150) : image.width) + 16, WebkitUserSelect: "none", userSelect: "none" }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {(hovered || isMobile) && (
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          style={{ position: "absolute", top: -8, right: -8, width: isMobile ? 24 : 20, height: isMobile ? 24 : 20, borderRadius: "50%", background: "#DC2626", border: "2px solid white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", padding: 0, zIndex: 10, boxShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
        >
          <Trash2 size={isMobile ? 12 : 10} />
        </button>
      )}
      <img src={image.src} alt="Taped photo" style={{ width: "100%", display: "block", objectFit: "cover", userSelect: "none", pointerEvents: "none", WebkitUserDrag: "none" } as React.CSSProperties} draggable={false} />
    </div>
  );
}