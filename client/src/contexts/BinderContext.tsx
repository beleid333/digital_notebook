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
import { useAuth } from "./AuthContext";

// ── API Configuration ──
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3002/api";
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
  renameSection: (id: string, newTitle: string) => void;
  updatePage: (page: Page) => void;
  renameNotebook: (notebookId: string, newName: string) => Promise<void>;
  deleteNotebook: (notebookId: string) => Promise<void>;
  activeNotebook: Notebook;
  activeSections: Section[];
  activeSection: Section;
  activePage: Page;
  isInitialized: boolean;
}

const BinderContext = createContext<BinderContextValue | null>(null);

// ── Default State ──
const DEFAULT_STATE: BinderState = {
  notebooks: NOTEBOOKS,
  sections: SECTIONS,
  pages: INITIAL_PAGES,
  activeNotebookId: NOTEBOOKS[0].id,
  activeSectionId: SECTIONS[0].id,
};

// ── Data Validation ──
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

// ── LocalStorage Fallback ──
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

// ── Provider Component ──
export function BinderProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  
  const [state, setState] = useState<BinderState>(DEFAULT_STATE);
  const [isInitialized, setIsInitialized] = useState(false);

  // ── Fetch user's binder data from server ──
  const fetchUserBinderData = useCallback(async (): Promise<BinderState | null> => {
    if (!token) return null;
    
    try {
      const response = await fetch(`${API_URL}/user/data`, {
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });
      
      if (!response.ok) {
        console.warn("⚠️ Failed to fetch user data:", response.status);
        return null;
      }
      
      const data = await response.json();
      
      if (data.binderData && isValidState(data.binderData)) {
        console.log("📦 Loaded from server (user-specific)");
        return data.binderData;
      }
      
      return null;
    } catch (error) {
      console.warn("⚠️ Server fetch failed:", error);
      return null;
    }
  }, [token]);

  // ── Save user's binder data to server ──
  const saveToServer = useCallback(async (newState: BinderState) => {
    if (!token) return;
    
    try {
      await fetch(`${API_URL}/user/data`, {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ binderData: newState }),
      });
    } catch (error) {
      console.warn("⚠️ Server save failed:", error);
    }
  }, [token]);

  // ── Initialize: Load data when auth state changes ──
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      setIsInitialized(false);
      
      if (isAuthenticated && token) {
        const serverData = await fetchUserBinderData();
        
        if (mounted && serverData) {
          setState(serverData);
          saveToLocalStorage(serverData);
          setIsInitialized(true);
          return;
        }
      }
      
      const localData = loadFromLocalStorage();
      if (mounted && localData) {
        console.log("📦 Loaded from localStorage (fallback)");
        setState(localData);
      }
      
      if (mounted) setIsInitialized(true);
    };

    initialize();
    return () => { mounted = false; };
  }, [isAuthenticated, token, fetchUserBinderData, saveToServer]);

  // ── Auto-sync to server when state changes (debounced) ──
  useEffect(() => {
    if (!isInitialized || !isAuthenticated) return;

    const timer = setTimeout(() => {
      saveToServer(state);
      saveToLocalStorage(state);
    }, 1000);

    return () => clearTimeout(timer);
  }, [state, isInitialized, isAuthenticated, saveToServer]);

  // ── Derived values ──
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

  // ── Actions ──
  const selectNotebook = useCallback((id: string) => {
    setState((prev) => {
      const firstSection = prev.sections?.find((s) => s.notebookId === id);
      return {
        ...prev,
        activeNotebookId: id,
        activeSectionId: firstSection?.id ?? prev.activeSectionId ?? "",
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

    const newNotebook: Notebook = { id, title, color, spineAccent: color, emoji: "📖" };

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

  const renameSection = useCallback((id: string, newTitle: string) => {
    setState((prev) => ({
      ...prev,
      sections: (prev.sections ?? []).map((s) =>
        s.id === id ? { ...s, title: newTitle.trim() } : s
      ),
    }));
  }, []);

  const renameNotebook = async (notebookId: string, newName: string) => {
    setState(prev => ({
      ...prev,
      notebooks: prev.notebooks.map(nb =>
        nb.id === notebookId
          ? { ...nb, title: newName.trim(), updatedAt: new Date().toISOString() }
          : nb
      ),
    }));
  };

  const deleteNotebook = async (notebookId: string) => {
    setState(prev => {
      const sectionIdsToDelete = prev.sections
        .filter(s => s.notebookId === notebookId)
        .map(s => s.id);
      
      return {
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
      };
    });
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
    renameSection,
    updatePage,
    renameNotebook,
    deleteNotebook,
    isInitialized,
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