/**
 * Home — The Velo Notes
 * Design: Tactile Realism Brutalist Skeuomorphism
 */

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useBinder } from "@/contexts/BinderContext"; // ✅ Already imported
import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";
import Canvas from "@/components/Canvas";
import BinderHeader from "@/components/BinderHeader";
import { LogOut } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  
  // ✅ ADD THIS: Get binder data from context
  const {
    notebooks,
    activeNotebookId,
    activeSections,
    activeSectionId,
    activeNotebook,
    activeSection,
    activePage,
    selectNotebook,
    selectSection,
    addNotebook,
    addSection,
    deleteSection,
    updatePage,
  } = useBinder();
  
  // ✅ Mobile detection (optional, for future use)
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div
      className="desk-surface"
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 24px",
        overflow: "hidden",
      }}
    >
      {/* ── Binder container ──────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          maxWidth: 1400,
          maxHeight: 900,
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow:
            "0 30px 80px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        <Sidebar
          notebooks={notebooks}
          activeNotebookId={activeNotebookId}
          onSelectNotebook={selectNotebook}
          onAddNotebook={addNotebook}
        />

        {/* ── Binder body ─────────────────────────────────────────────── */}
        <div
          className="binder-body"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          {/* Notebook header */}
          <BinderHeader
            notebook={activeNotebook}
            sections={activeSections}
            activeSection={activeSection}
          />

          {/* Tab bar area */}
          <div
            style={{
              paddingTop: 8,
              background: `linear-gradient(180deg, ${activeNotebook.color}0C 0%, #E8E0D0 100%)`,
              flexShrink: 0,
            }}
          >
            <TabBar
              sections={activeSections}
              activeSectionId={activeSectionId}
              activeNotebook={activeNotebook}
              onSelectSection={selectSection}
              onAddSection={addSection}
              onDeleteSection={deleteSection}
            />
          </div>

          {/* Paper canvas — fills remaining space */}
          <div
            style={{
              flex: 1,
              overflow: "hidden",
              borderTop: "2px solid #C0A880",
              boxShadow: "inset 0 2px 6px rgba(0,0,0,0.08)",
            }}
          >
            <Canvas
              key={activeSectionId}
              page={activePage}
              onUpdatePage={updatePage}
              sectionColor={activeSection?.tabColorDark ?? "#2563EB"}
            />
          </div>
        </div>
      </div>

      {/* ── Desk label ────────────────────────────────────────────────── */}
      <div
        style={{
          position: "fixed",
          bottom: 8,
          right: 16,
          fontFamily: "'Courier Prime', monospace",
          fontSize: 10,
          color: "rgba(255,255,255,0.25)",
          letterSpacing: "0.08em",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        Velo Notes v1.0
      </div>

      {/* ── Close Notebook / back to cover ──────────────────────────────── */}
      {/* ⚠️ This inline style for @media won't work in React - remove or use CSS class */}
      {/* ✅ REMOVED: Close Notebook button - now only in sidebar bottom */}
      {/*<button
        onClick={() => setLocation("/")}
        title="Close Notebook — return to cover"
        style={{
          position: "fixed",
          top: 12,
          left: 12,
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 12px",
          background: "rgba(40,20,5,0.55)",
          border: "1px solid rgba(200,160,80,0.3)",
          borderRadius: 4,
          color: "rgba(220,190,110,0.8)",
          fontFamily: "'Courier Prime', monospace",
          fontSize: 11,
          letterSpacing: "0.06em",
          cursor: "pointer",
          backdropFilter: "blur(4px)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          transition: "all 0.15s ease",
          zIndex: 50,
          // ✅ Hide on mobile using inline style check
          display: isMobile ? "none" : "flex", // ✅ This works!
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = "rgba(60,30,8,0.75)";
          (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,220,130,1)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = "rgba(40,20,5,0.55)";
          (e.currentTarget as HTMLButtonElement).style.color = "rgba(220,190,110,0.8)";
        }}
      >
        <LogOut size={12} />
        Close Notebook
      </button>
      */}
    </div>
  );
}