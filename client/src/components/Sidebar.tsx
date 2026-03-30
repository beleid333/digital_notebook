/**
 * Sidebar — The Bookshelf
 * Design: Tactile Realism Brutalist Skeuomorphism
 *
 * Renders a wooden bookshelf with 3D notebook spines.
 * Each spine uses layered box-shadows and gradients to simulate depth.
 * Active notebook is "pulled off the shelf" via translateX.
 */

import { useState } from "react";
import { Plus, BookOpen } from "lucide-react";
import type { Notebook } from "@/data/binderData";

interface SidebarProps {
  notebooks: Notebook[];
  activeNotebookId: string;
  onSelectNotebook: (id: string) => void;
  onAddNotebook: (title: string, color: string) => void;
}

const SPINE_COLORS = [
  { color: "#2563EB", spineAccent: "#1D4ED8", label: "Blue" },
  { color: "#16A34A", spineAccent: "#15803D", label: "Green" },
  { color: "#DC2626", spineAccent: "#B91C1C", label: "Red" },
  { color: "#7C3AED", spineAccent: "#6D28D9", label: "Purple" },
  { color: "#92400E", spineAccent: "#78350F", label: "Brown" },
  { color: "#0E7490", spineAccent: "#0C6080", label: "Teal" },
  { color: "#B45309", spineAccent: "#92400E", label: "Amber" },
  { color: "#BE185D", spineAccent: "#9D174D", label: "Pink" },
];

export default function Sidebar({
  notebooks,
  activeNotebookId,
  onSelectNotebook,
  onAddNotebook,
}: SidebarProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState(SPINE_COLORS[0]);

  const handleAdd = () => {
    if (newTitle.trim()) {
      onAddNotebook(newTitle.trim(), selectedColor.color);
      setNewTitle("");
      setSelectedColor(SPINE_COLORS[0]);
      setShowAddModal(false);
    }
  };

  return (
    <>
      <aside
        className="bookshelf shelf-scroll flex flex-col"
        style={{
          width: 180,
          minWidth: 180,
          height: "100%",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {/* Header label */}
        <div className="shelf-label" style={{ paddingTop: 16 }}>
          Notebooks
        </div>

        {/* Decorative shelf edge at top */}
        <div
          style={{
            height: 6,
            margin: "4px 8px 12px",
            background: "linear-gradient(180deg, #8B6040 0%, #5C3A1E 100%)",
            borderRadius: 2,
            boxShadow: "0 2px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        />

        {/* Notebook spines */}
        <div
          className="flex flex-col gap-2"
          style={{ padding: "0 10px", flex: 1 }}
        >
          {notebooks.map((nb) => (
            <NotebookSpine
              key={nb.id}
              notebook={nb}
              isActive={nb.id === activeNotebookId}
              onClick={() => onSelectNotebook(nb.id)}
            />
          ))}
        </div>

        {/* Decorative shelf edge at bottom of books */}
        <div
          style={{
            height: 8,
            margin: "12px 8px 8px",
            background: "linear-gradient(180deg, #8B6040 0%, #5C3A1E 100%)",
            borderRadius: 2,
            boxShadow: "0 2px 6px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        />

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Add Notebook button */}
        <div style={{ padding: "8px 10px 16px" }}>
          <button
            className="add-notebook-btn"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={12} />
            New Notebook
          </button>
        </div>
      </aside>

      {/* Add Notebook Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 16,
              }}
            >
              <BookOpen size={18} style={{ color: "#7A4F2E" }} />
              <h3
                style={{
                  fontFamily: "'Libre Baskerville', serif",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#3A2010",
                }}
              >
                New Notebook
              </h3>
            </div>

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
              Title
            </label>
            <input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="e.g. Work Notes..."
              style={{
                width: "100%",
                padding: "8px 10px",
                fontFamily: "'Caveat', cursive",
                fontSize: 18,
                background: "rgba(255,255,255,0.6)",
                border: "1px solid #C0A880",
                borderRadius: 4,
                outline: "none",
                color: "#2A2A2A",
                marginBottom: 14,
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
              }}
            />

            <label
              style={{
                display: "block",
                fontFamily: "'Libre Baskerville', serif",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#7A4F2E",
                marginBottom: 8,
              }}
            >
              Spine Color
            </label>
            <div
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                marginBottom: 18,
              }}
            >
              {SPINE_COLORS.map((c) => (
                <button
                  key={c.color}
                  onClick={() => setSelectedColor(c)}
                  title={c.label}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 4,
                    background: c.color,
                    border:
                      selectedColor.color === c.color
                        ? "2px solid #2A2A2A"
                        : "2px solid transparent",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                    cursor: "pointer",
                    transition: "transform 0.1s ease",
                    transform:
                      selectedColor.color === c.color
                        ? "scale(1.2)"
                        : "scale(1)",
                  }}
                />
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                className="toolbar-btn"
                onClick={() => setShowAddModal(false)}
                style={{ fontSize: 12 }}
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!newTitle.trim()}
                style={{
                  padding: "6px 16px",
                  background: newTitle.trim()
                    ? `linear-gradient(180deg, ${selectedColor.color}CC 0%, ${selectedColor.spineAccent} 100%)`
                    : "#C0A880",
                  border: "1px solid rgba(0,0,0,0.2)",
                  borderRadius: 4,
                  color: "white",
                  fontFamily: "'Libre Baskerville', serif",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  cursor: newTitle.trim() ? "pointer" : "not-allowed",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)",
                  transition: "all 0.1s ease",
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Notebook Spine Sub-component ─────────────────────────────────────────────

interface NotebookSpineProps {
  notebook: Notebook;
  isActive: boolean;
  onClick: () => void;
}

function NotebookSpine({ notebook, isActive, onClick }: NotebookSpineProps) {
  return (
    <button
      className={`notebook-spine ${isActive ? "active" : ""}`}
      onClick={onClick}
      style={{
        background: `linear-gradient(
          90deg,
          ${notebook.spineAccent} 0%,
          ${notebook.color} 30%,
          ${notebook.color}EE 70%,
          ${notebook.spineAccent} 100%
        )`,
        height: 52,
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "0 10px 0 14px",
        border: "none",
        color: "white",
        textAlign: "left",
      }}
    >
      <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>
        {notebook.emoji}
      </span>
      <span
        style={{
          fontFamily: "'Libre Baskerville', serif",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.02em",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          textShadow: "0 1px 2px rgba(0,0,0,0.4)",
          flex: 1,
        }}
      >
        {notebook.title}
      </span>
      {isActive && (
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.9)",
            boxShadow: "0 0 4px rgba(255,255,255,0.8)",
            flexShrink: 0,
          }}
        />
      )}
    </button>
  );
}
