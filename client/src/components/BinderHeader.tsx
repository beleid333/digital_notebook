/**
 * BinderHeader — Top chrome of the binder body
 * Design: Tactile Realism Brutalist Skeuomorphism
 *
 * Shows the active notebook title, section count, and date.
 */

import { BookOpen, Calendar } from "lucide-react";
import type { Notebook, Section } from "@/data/binderData";

interface BinderHeaderProps {
  notebook: Notebook;
  sections: Section[];
  activeSection: Section;
}

export default function BinderHeader({
  notebook,
  sections,
  activeSection,
}: BinderHeaderProps) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      style={{
        padding: "8px 20px 0",
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexShrink: 0,
        background: `linear-gradient(180deg, ${notebook.color}14 0%, transparent 100%)`,
        borderBottom: `1.5px solid ${notebook.color}28`,
      }}
    >
      {/* Notebook identity */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 20 }}>{notebook.emoji}</span>
        <div>
          <div
            style={{
              fontFamily: "'Libre Baskerville', serif",
              fontSize: 13,
              fontWeight: 700,
              color: notebook.color,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              lineHeight: 1.2,
            }}
          >
            {notebook.title}
          </div>
          <div
            style={{
              fontFamily: "'Courier Prime', monospace",
              fontSize: 10,
              color: "#9A7A5A",
              letterSpacing: "0.04em",
            }}
          >
            {sections.length} section{sections.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          width: 1,
          height: 28,
          background: `${notebook.color}30`,
          margin: "0 4px",
        }}
      />

      {/* Active section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: activeSection?.tabColorDark ?? notebook.color,
            boxShadow: `0 0 4px ${activeSection?.tabColorDark ?? notebook.color}80`,
          }}
        />
        <span
          style={{
            fontFamily: "'Libre Baskerville', serif",
            fontSize: 12,
            color: "#5C3A1E",
            fontStyle: "italic",
          }}
        >
          {activeSection?.title}
        </span>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Date */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          fontFamily: "'Courier Prime', monospace",
          fontSize: 11,
          color: "#9A7A5A",
          letterSpacing: "0.02em",
        }}
      >
        <Calendar size={11} />
        {today}
      </div>
    </div>
  );
}
