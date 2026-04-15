/**
 * BinderContext — Global State Management with MongoDB Sync
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { nanoid } from "nanoid";
import {
  NOTEBOOKS,
  SECTIONS,
  INITIAL_PAGES,
  type Notebook,
  type Section,
  type Page,
} from "@/data/binderData";
import { TAB_COLORS } from "@/components/TabBar";

// 🔗 API Configuration
const API_URL = import.meta.env.VITE_API_URL || "https://digital-notebook-ypfo.onrender.com/api";
const STORAGE_KEY = "digital-ring-binder-v1";

interface BinderState {
  notebooks: Notebook[];
  sections: Section[];
  pages: Record<string, Page>;
  activeNotebookId: string;
  activeSectionId: string;
}

interface BinderContextValue extends BinderState {
  selectNotebook: (id: string) => void;
  selectSection: (id: string) => void;
  addNotebook: (title: string, color: string) => void;
  addSection: (title: string) => void;
  deleteSection: (id: string) => void;
  updatePage: (page: Page) => void;

renameNotebook: (notebookId: string, newName: string) => Promise<void>;
deleteNotebook: (notebookId: string) => Promise<void>;


  activeNotebook: Notebook;
  activeSections: Section[];
  activeSection: Section;
  activePage: Page;
}

const BinderContext = createContext<BinderContextValue | null>(null);

// ── Default State ──────────────────────────────────────────────────────
const DEFAULT_STATE: BinderState = {
  notebooks: NOTEBOOKS,
  sections: SECTIONS,
  pages: INITIAL_PAGES,
  activeNotebookId: NOTEBOOKS[0].id,
  activeSectionId: SECTIONS[0].id,
};

// ── Data Validation ──────────────────────────────────────────────────────
function isValidState(data: any): data is BinderState {
  return (
    data &&
    Array.isArray(data.notebooks) &&
    Array.isArray(data.sections) &&
    typeof data.pages === "object" &&
    typeof data.activeNotebookId === "string" &&
    typeof data.activeSectionId === "string"
  );
}

// ── API Functions ───────────────────────────────────────────────────────

async function fetchFromBackend(): Promise<BinderState | null> {
  try {
    const response = await fetch(`${API_URL}/notes`);
    if (!response.ok) throw new Error("Failed to fetch");
    const data = await response.json();
    
    // Backend returns array, get first item
    const item = Array.isArray(data) && data.length > 0 ? data[0] : data;
    
    // Validate structure
    if (isValidState(item)) {
      return item;
    }
    console.warn("⚠️ Backend data invalid, using defaults");
    return null;
  } catch (error) {
    console.warn("⚠️ Backend fetch failed:", error);
    return null;
  }
}

async function saveToBackend(state: BinderState): Promise<void> {
  try {
    await fetch(`${API_URL}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });
    console.log("✅ Synced to backend");
  } catch (error) {
    console.warn("⚠️ Backend save failed:", error);
  }
}

// ── LocalStorage Fallback ──────────────────────────────────────────────

function loadFromLocalStorage(): BinderState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isValidState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function saveToLocalStorage(state: BinderState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.warn("⚠️ localStorage error");
  }
}

// ── Provider Component ─────────────────────────────────────────────────

export function BinderProvider({ children }: { children: ReactNode }) {
  // Start with defaults to avoid undefined errors
  const [state, setState] = useState<BinderState>(DEFAULT_STATE);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load state on mount
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      // Try backend first
      const backendData = await fetchFromBackend();
      
      if (mounted) {
        if (backendData && isValidState(backendData)) {
          console.log("📦 Loaded from backend");
          setState(backendData);
          saveToLocalStorage(backendData);
        } else {
          // Fallback to localStorage
          const localData = loadFromLocalStorage();
          if (localData && isValidState(localData)) {
            console.log("📦 Loaded from localStorage");
            setState(localData);
          }
          // If both fail, we keep DEFAULT_STATE
        }
        setIsInitialized(true);
      }
    };

    initialize();
    return () => { mounted = false; };
  }, []);

  // Auto-sync to backend when state changes (debounced)
  useEffect(() => {
    if (!isInitialized) return;

    const timer = setTimeout(() => {
      saveToBackend(state);
      saveToLocalStorage(state);
    }, 1000);

    return () => clearTimeout(timer);
  }, [state, isInitialized]);

  // ── Derived values (with safety checks) ───────────────────────────────
  const activeNotebook =
    state.notebooks?.find((n) => n.id === state.activeNotebookId) ??
    state.notebooks?.[0] ??
    DEFAULT_STATE.notebooks[0];

  const activeSections = (state.sections ?? []).filter(
    (s) => s.notebookId === state.activeNotebookId
  );

  const activeSection =
    activeSections.find((s) => s.id === state.activeSectionId) ??
    activeSections[0] ??
    DEFAULT_STATE.sections[0];

  const activePage =
    state.pages?.[activeSection?.id] ?? {
      id: `page-${activeSection?.id}`,
      sectionId: activeSection?.id,
      title: activeSection?.title ?? "New Page",
      content: "",
      stickyNotes: [],
      tapedImages: [],
    };

  // ── Actions ──────────────────────────────────────────────────────────────

  const selectNotebook = useCallback((id: string) => {
    setState((prev) => {
      const firstSection = prev.sections?.find((s) => s.notebookId === id);
      return {
        ...prev,
        activeNotebookId: id,
        activeSectionId: firstSection?.id ?? prev.activeSectionId,
      };
    });
  }, []);

  const selectSection = useCallback((id: string) => {
    setState((prev) => ({ ...prev, activeSectionId: id }));
  }, []);

  const addNotebook = useCallback((title: string, color: string) => {
    const id = `nb-${nanoid(6)}`;
    const sectionId = `sec-${nanoid(6)}`;
    const colorEntry = TAB_COLORS[Math.floor(Math.random() * TAB_COLORS.length)];

    const newNotebook: Notebook = { id, title, color, spineAccent: color, emoji: "📓" };

    const newSection: Section = {
      id: sectionId,
      title: "Notes",
      notebookId: id,
      tabColor: colorEntry.tabColor,
      tabColorDark: colorEntry.tabColorDark,
      tabTextColor: colorEntry.tabTextColor,
    };

    const newPage: Page = {
      id: `page-${sectionId}`,
      sectionId,
      title: `${title} — Notes`,
      content: "",
      stickyNotes: [],
      tapedImages: [],
    };

    setState((prev) => ({
      ...prev,
      notebooks: [...(prev.notebooks ?? []), newNotebook],
      sections: [...(prev.sections ?? []), newSection],
      pages: { ...(prev.pages ?? {}), [sectionId]: newPage },
      activeNotebookId: id,
      activeSectionId: sectionId,
    }));
  }, []);

  const addSection = useCallback(
    (title: string) => {
      const sectionId = `sec-${nanoid(6)}`;
      const colorIdx = (state.sections?.length ?? 0) % TAB_COLORS.length;
      const colorEntry = TAB_COLORS[colorIdx];

      const newSection: Section = {
        id: sectionId,
        title,
        notebookId: state.activeNotebookId,
        tabColor: colorEntry.tabColor,
        tabColorDark: colorEntry.tabColorDark,
        tabTextColor: colorEntry.tabTextColor,
      };

      const newPage: Page = {
        id: `page-${sectionId}`,
        sectionId,
        title,
        content: "",
        stickyNotes: [],
        tapedImages: [],
      };

      setState((prev) => ({
        ...prev,
        sections: [...(prev.sections ?? []), newSection],
        pages: { ...(prev.pages ?? {}), [sectionId]: newPage },
        activeSectionId: sectionId,
      }));
    },
    [state.activeNotebookId, state.sections?.length]
  );

  const deleteSection = useCallback((id: string) => {
    setState((prev) => {
      const remaining = (prev.sections ?? []).filter((s) => s.id !== id);
      const newPages = { ...(prev.pages ?? {}) };
      delete newPages[id];

      let newActiveSectionId = prev.activeSectionId;
      if (prev.activeSectionId === id) {
        const notebookSections = remaining.filter(
          (s) => s.notebookId === prev.activeNotebookId
        );
        newActiveSectionId = notebookSections[0]?.id ?? prev.activeSectionId;
      }

      return {
        ...prev,
        sections: remaining,
        pages: newPages,
        activeSectionId: newActiveSectionId,
      };
    });
  }, []);

  // ✅ Rename a notebook
const renameNotebook = async (notebookId: string, newName: string) => {
  setState(prev => ({
    ...prev,
    notebooks: prev.notebooks.map(nb =>
      nb.id === notebookId
        ? { ...nb, title: newName.trim(), updatedAt: new Date().toISOString() }  // ✅ Use 'title' not 'name'
        : nb
    ),
  }));
  
};

// ✅ Delete a notebook (and all its sections/pages)
const deleteNotebook = async (notebookId: string) => {
  const notebookToDelete = state.notebooks.find(nb => nb.id === notebookId);
  if (!notebookToDelete) return;
  
  // Find all sections that belong to this notebook
  const sectionIdsToDelete = state.sections
    .filter(s => s.notebookId === notebookId)
    .map(s => s.id);
  
  setState(prev => ({
    ...prev,
    notebooks: prev.notebooks.filter(nb => nb.id !== notebookId),
    sections: prev.sections.filter(s => !sectionIdsToDelete.includes(s.id)),
    pages: Object.fromEntries(
      Object.entries(prev.pages).filter(
        ([sectionId]) => !sectionIdsToDelete.includes(sectionId)
      )
    ),
    activeNotebookId: prev.activeNotebookId === notebookId ? '' : prev.activeNotebookId,
    activeSectionId: sectionIdsToDelete.includes(prev.activeSectionId) ? '' : prev.activeSectionId,
  }));
  };


  const updatePage = useCallback((page: Page) => {
    setState((prev) => ({
      ...prev,
      pages: { ...(prev.pages ?? {}), [page.sectionId]: page },
    }));
  }, []);

  const value: BinderContextValue = {
    ...state,
    activeNotebook,
    activeSections,
    activeSection,
    activePage,
    selectNotebook,
    selectSection,
    addNotebook,
    addSection,
    deleteSection,
    updatePage,
    renameNotebook,
  deleteNotebook,
  
  };

  return (
    <BinderContext.Provider value={value}>{children}</BinderContext.Provider>
  );
}

export function useBinder() {
  const ctx = useContext(BinderContext);
  if (!ctx) throw new Error("useBinder must be used inside BinderProvider");
  return ctx;
}