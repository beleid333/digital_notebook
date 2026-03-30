/**
 * BinderContext — Global State Management
 * Design: Tactile Realism Brutalist Skeuomorphism
 *
 * Manages all binder state: notebooks, sections, pages.
 * Persists to localStorage so notes survive page refresh.
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
  activeNotebook: Notebook;
  activeSections: Section[];
  activeSection: Section;
  activePage: Page;
}

const BinderContext = createContext<BinderContextValue | null>(null);

function loadState(): BinderState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BinderState;
  } catch {
    return null;
  }
}

function saveState(state: BinderState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // quota exceeded or private mode — silently ignore
  }
}

const DEFAULT_STATE: BinderState = {
  notebooks: NOTEBOOKS,
  sections: SECTIONS,
  pages: INITIAL_PAGES,
  activeNotebookId: NOTEBOOKS[0].id,
  activeSectionId: SECTIONS[0].id,
};

export function BinderProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BinderState>(() => {
    const saved = loadState();
    return saved ?? DEFAULT_STATE;
  });

  // Persist on every state change
  useEffect(() => {
    saveState(state);
  }, [state]);

  // ── Derived values ───────────────────────────────────────────────────────
  const activeNotebook =
    state.notebooks.find((n) => n.id === state.activeNotebookId) ??
    state.notebooks[0];

  const activeSections = state.sections.filter(
    (s) => s.notebookId === state.activeNotebookId
  );

  const activeSection =
    activeSections.find((s) => s.id === state.activeSectionId) ??
    activeSections[0];

  const activePage =
    state.pages[activeSection?.id] ?? {
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
      const firstSection = prev.sections.find((s) => s.notebookId === id);
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
    const colorEntry =
      TAB_COLORS[Math.floor(Math.random() * TAB_COLORS.length)];

    const newNotebook: Notebook = {
      id,
      title,
      color,
      spineAccent: color,
      emoji: "📓",
    };

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
      notebooks: [...prev.notebooks, newNotebook],
      sections: [...prev.sections, newSection],
      pages: { ...prev.pages, [sectionId]: newPage },
      activeNotebookId: id,
      activeSectionId: sectionId,
    }));
  }, []);

  const addSection = useCallback(
    (title: string) => {
      const sectionId = `sec-${nanoid(6)}`;
      const colorIdx = activeSections.length % TAB_COLORS.length;
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
        sections: [...prev.sections, newSection],
        pages: { ...prev.pages, [sectionId]: newPage },
        activeSectionId: sectionId,
      }));
    },
    [state.activeNotebookId, activeSections.length]
  );

  const deleteSection = useCallback(
    (id: string) => {
      setState((prev) => {
        const remaining = prev.sections.filter((s) => s.id !== id);
        const newPages = { ...prev.pages };
        delete newPages[id];

        // If we deleted the active section, switch to first available in notebook
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
    },
    []
  );

  const updatePage = useCallback((page: Page) => {
    setState((prev) => ({
      ...prev,
      pages: { ...prev.pages, [page.sectionId]: page },
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
