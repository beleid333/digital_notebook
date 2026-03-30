/**
 * TabBar — The Section Dividers
 * Design: Tactile Realism Brutalist Skeuomorphism
 *
 * Renders plastic-looking tabs that protrude above the paper.
 * Active tab is flush with the paper surface; inactive tabs are pushed down.
 * Each tab has a pastel color with a gloss highlight on top.
 */

import { useState } from "react";
import { Plus, X } from "lucide-react";
import type { Section, Notebook } from "@/data/binderData";

interface TabBarProps {
  sections: Section[];
  activeSectionId: string;
  activeNotebook: Notebook;
  onSelectSection: (id: string) => void;
  onAddSection: (title: string) => void;
  onDeleteSection: (id: string) => void;
}

const TAB_COLORS = [
  { tabColor: "#FEF08A", tabColorDark: "#EAB308", tabTextColor: "#713F12" },
  { tabColor: "#BAE6FD", tabColorDark: "#0EA5E9", tabTextColor: "#0C4A6E" },
  { tabColor: "#FBCFE8", tabColorDark: "#EC4899", tabTextColor: "#831843" },
  { tabColor: "#BBF7D0", tabColorDark: "#22C55E", tabTextColor: "#14532D" },
  { tabColor: "#FED7AA", tabColorDark: "#F97316", tabTextColor: "#7C2D12" },
  { tabColor: "#E9D5FF", tabColorDark: "#A855F7", tabTextColor: "#581C87" },
];

export default function TabBar({
  sections,
  activeSectionId,
  activeNotebook,
  onSelectSection,
  onAddSection,
  onDeleteSection,
}: TabBarProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleAdd = () => {
    if (newTitle.trim()) {
      onAddSection(newTitle.trim());
      setNewTitle("");
      setShowAddModal(false);
    }
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 3,
          padding: "0 16px",
          minHeight: 38,
          position: "relative",
          zIndex: 5,
        }}
      >
        {sections.map((section) => {
          const isActive = section.id === activeSectionId;
          const isHovered = hoveredId === section.id;

          return (
            <div
              key={section.id}
              style={{ position: "relative", display: "flex", alignItems: "flex-end" }}
              onMouseEnter={() => setHoveredId(section.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <button
                className={`section-tab ${isActive ? "active" : ""}`}
                onClick={() => onSelectSection(section.id)}
                style={{
                  backgroundColor: section.tabColor,
                  color: section.tabTextColor,
                  borderColor: `${section.tabColorDark}40`,
                  paddingRight: isHovered && !isActive && sections.length > 1 ? "28px" : "16px",
                  transition: "all 0.12s ease",
                }}
              >
                {section.title}
              </button>

              {/* Delete button — only shown on hover, not for active tab if it's the only one */}
              {isHovered && !isActive && sections.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSection(section.id);
                  }}
                  style={{
                    position: "absolute",
                    right: 5,
                    bottom: 8,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "rgba(0,0,0,0.25)",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: section.tabTextColor,
                    zIndex: 20,
                    padding: 0,
                  }}
                >
                  <X size={9} />
                </button>
              )}
            </div>
          );
        })}

        {/* Add Section button */}
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            padding: "5px 10px 7px",
            borderRadius: "8px 8px 0 0",
            background: "rgba(255,255,255,0.25)",
            border: "1px dashed rgba(0,0,0,0.2)",
            borderBottom: "none",
            color: "rgba(60,40,20,0.5)",
            fontFamily: "'Libre Baskerville', serif",
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
            transform: "translateY(3px)",
            transition: "all 0.12s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.4)";
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(60,40,20,0.8)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.25)";
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(60,40,20,0.5)";
          }}
        >
          <Plus size={11} />
          Tab
        </button>
      </div>

      {/* Add Section Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
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
              Add Section to "{activeNotebook.title}"
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
              Tab Name
            </label>
            <input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="e.g. Meeting Notes..."
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
                marginBottom: 16,
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
              }}
            />

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                className="toolbar-btn"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!newTitle.trim()}
                style={{
                  padding: "6px 16px",
                  background: newTitle.trim()
                    ? `linear-gradient(180deg, ${activeNotebook.color}CC 0%, ${activeNotebook.spineAccent} 100%)`
                    : "#C0A880",
                  border: "1px solid rgba(0,0,0,0.2)",
                  borderRadius: 4,
                  color: "white",
                  fontFamily: "'Libre Baskerville', serif",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: newTitle.trim() ? "pointer" : "not-allowed",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)",
                }}
              >
                Add Tab
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export { TAB_COLORS };
