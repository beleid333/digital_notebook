/**
 * DVelo Notes — Core Data Model
 * Design: Tactile Realism Brutalist Skeuomorphism
 *
 * Notebooks → Sections (Tabs) → Pages (Canvas content)
 */

export interface Notebook {
  id: string;
  title: string;
  color: string;       // spine color
  spineAccent: string; // darker accent for spine depth
  emoji: string;
}

export interface Section {
  id: string;
  title: string;
  notebookId: string;
  tabColor: string;       // pastel tab color
  tabColorDark: string;   // darker shade for tab depth
  tabTextColor: string;
}

export interface StickyNote {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  color: string;
  rotation: number;
}

export interface TapedImage {
  id: string;
  x: number;
  y: number;
  src: string;
  rotation: number;
  width: number;
}

export interface Page {
  id: string;
  sectionId: string;
  title: string;
  content: string;       // main body text
  stickyNotes: StickyNote[];
  tapedImages: TapedImage[];
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

export const NOTEBOOKS: Notebook[] = [
  {
    id: "nb-1",
    title: "Projects",
    color: "#2563EB",
    spineAccent: "#1D4ED8",
    emoji: "🚀",
  },
  {
    id: "nb-2",
    title: "Personal",
    color: "#16A34A",
    spineAccent: "#15803D",
    emoji: "🌿",
  },
  {
    id: "nb-3",
    title: "Ideas",
    color: "#DC2626",
    spineAccent: "#B91C1C",
    emoji: "💡",
  },
  {
    id: "nb-4",
    title: "Research",
    color: "#7C3AED",
    spineAccent: "#6D28D9",
    emoji: "🔬",
  },
  {
    id: "nb-5",
    title: "Archive",
    color: "#92400E",
    spineAccent: "#78350F",
    emoji: "📦",
  },
];

export const SECTIONS: Section[] = [
  // Projects
  { id: "sec-1", title: "Overview",    notebookId: "nb-1", tabColor: "#FEF08A", tabColorDark: "#EAB308", tabTextColor: "#713F12" },
  { id: "sec-2", title: "Tasks",       notebookId: "nb-1", tabColor: "#BAE6FD", tabColorDark: "#0EA5E9", tabTextColor: "#0C4A6E" },
  { id: "sec-3", title: "Meetings",    notebookId: "nb-1", tabColor: "#FBCFE8", tabColorDark: "#EC4899", tabTextColor: "#831843" },
  { id: "sec-4", title: "Resources",   notebookId: "nb-1", tabColor: "#BBF7D0", tabColorDark: "#22C55E", tabTextColor: "#14532D" },
  // Personal
  { id: "sec-5", title: "Journal",     notebookId: "nb-2", tabColor: "#FEF08A", tabColorDark: "#EAB308", tabTextColor: "#713F12" },
  { id: "sec-6", title: "Goals",       notebookId: "nb-2", tabColor: "#BAE6FD", tabColorDark: "#0EA5E9", tabTextColor: "#0C4A6E" },
  { id: "sec-7", title: "Health",      notebookId: "nb-2", tabColor: "#FBCFE8", tabColorDark: "#EC4899", tabTextColor: "#831843" },
  // Ideas
  { id: "sec-8", title: "Concepts",    notebookId: "nb-3", tabColor: "#FEF08A", tabColorDark: "#EAB308", tabTextColor: "#713F12" },
  { id: "sec-9", title: "Sketches",    notebookId: "nb-3", tabColor: "#BAE6FD", tabColorDark: "#0EA5E9", tabTextColor: "#0C4A6E" },
  { id: "sec-10", title: "Wishlist",   notebookId: "nb-3", tabColor: "#FBCFE8", tabColorDark: "#EC4899", tabTextColor: "#831843" },
  // Research
  { id: "sec-11", title: "Articles",   notebookId: "nb-4", tabColor: "#FEF08A", tabColorDark: "#EAB308", tabTextColor: "#713F12" },
  { id: "sec-12", title: "Notes",      notebookId: "nb-4", tabColor: "#BAE6FD", tabColorDark: "#0EA5E9", tabTextColor: "#0C4A6E" },
  // Archive
  { id: "sec-13", title: "2024",       notebookId: "nb-5", tabColor: "#FEF08A", tabColorDark: "#EAB308", tabTextColor: "#713F12" },
  { id: "sec-14", title: "2023",       notebookId: "nb-5", tabColor: "#BAE6FD", tabColorDark: "#0EA5E9", tabTextColor: "#0C4A6E" },
];

export const INITIAL_PAGES: Record<string, Page> = {
  "sec-1": {
    id: "page-sec-1",
    sectionId: "sec-1",
    title: "Project Overview",
    content: `Welcome to the Velo Notes!\n\nThis is your Projects notebook. Use the tabs above to navigate between sections.\n\nClick anywhere on the paper to add a sticky note, or use the toolbar to add images and text.`,
    stickyNotes: [
      {
        id: "sn-1",
        x: 420,
        y: 180,
        width: 200,
        height: 140,
        content: "Remember to review the Q2 roadmap with the team!",
        color: "#FEF08A",
        rotation: 2.5,
      },
      {
        id: "sn-2",
        x: 520,
        y: 340,
        width: 180,
        height: 120,
        content: "Design sprint starts Monday 🎨",
        color: "#FBCFE8",
        rotation: -1.8,
      },
    ],
    tapedImages: [],
  },
  "sec-2": {
    id: "page-sec-2",
    sectionId: "sec-2",
    title: "Task List",
    content: `Active Tasks:\n\n☐ Finalize wireframes\n☐ Review pull requests\n☐ Update documentation\n☑ Set up project repo\n☑ Initial planning meeting`,
    stickyNotes: [],
    tapedImages: [],
  },
  "sec-3": {
    id: "page-sec-3",
    sectionId: "sec-3",
    title: "Meeting Notes",
    content: `Standup — March 28\n\nAttendees: Alex, Jordan, Sam\n\nDiscussed:\n- Sprint progress update\n- Blocker: API integration delay\n- Next steps: unblock by EOD`,
    stickyNotes: [
      {
        id: "sn-3",
        x: 460,
        y: 200,
        width: 190,
        height: 110,
        content: "Follow up with Jordan about the API keys!",
        color: "#BBF7D0",
        rotation: -2.1,
      },
    ],
    tapedImages: [],
  },
  "sec-4": {
    id: "page-sec-4",
    sectionId: "sec-4",
    title: "Resources",
    content: `Useful Links & References:\n\nDesign System: figma.com/team/...\nRepo: github.com/org/project\nDocs: notion.so/workspace/...\nSlack: #project-general`,
    stickyNotes: [],
    tapedImages: [],
  },
  "sec-5": {
    id: "page-sec-5",
    sectionId: "sec-5",
    title: "Daily Journal",
    content: `March 28, 2026\n\nToday was productive. Finished the morning routine early and got into deep work by 9am. The weather was overcast but that somehow made it easier to focus.\n\nGrateful for: good coffee, a quiet workspace, and making progress on things that matter.`,
    stickyNotes: [
      {
        id: "sn-4",
        x: 440,
        y: 220,
        width: 175,
        height: 130,
        content: "Call Mom this weekend! 📞",
        color: "#FEF08A",
        rotation: 3.0,
      },
    ],
    tapedImages: [],
  },
  "sec-6": {
    id: "page-sec-6",
    sectionId: "sec-6",
    title: "2026 Goals",
    content: `Annual Goals:\n\n1. Ship two side projects\n2. Read 24 books\n3. Exercise 4x per week\n4. Learn a new language\n5. Travel to 3 new countries`,
    stickyNotes: [],
    tapedImages: [],
  },
  "sec-7": {
    id: "page-sec-7",
    sectionId: "sec-7",
    title: "Health Tracker",
    content: `Weekly Check-in:\n\nSleep avg: 7.2 hrs\nExercise: 3/4 sessions\nWater intake: Good\nStress level: Moderate\n\nNotes: Need to reduce screen time before bed.`,
    stickyNotes: [],
    tapedImages: [],
  },
  "sec-8": {
    id: "page-sec-8",
    sectionId: "sec-8",
    title: "New Concepts",
    content: `Idea Dump:\n\n- An app that turns handwritten notes into structured tasks\n- A browser extension for saving "read later" with context\n- Subscription box for analog productivity tools\n- Community platform for indie makers`,
    stickyNotes: [
      {
        id: "sn-5",
        x: 430,
        y: 160,
        width: 200,
        height: 150,
        content: "The handwritten notes app idea is GOLD. Research existing solutions first.",
        color: "#BAE6FD",
        rotation: -1.5,
      },
    ],
    tapedImages: [],
  },
  "sec-9": {
    id: "page-sec-9",
    sectionId: "sec-9",
    title: "Sketches & Doodles",
    content: `Visual Ideas:\n\nRough layout sketches for the dashboard redesign. Three-column layout with activity feed on the right. Navigation stays persistent on left.\n\nColor exploration: warm neutrals with one bold accent.`,
    stickyNotes: [],
    tapedImages: [],
  },
  "sec-10": {
    id: "page-sec-10",
    sectionId: "sec-10",
    title: "Wishlist",
    content: `Things I Want to Try:\n\n☐ Mechanical keyboard (Keychron Q1)\n☐ Standing desk converter\n☐ Noise-cancelling headphones\n☐ Lamy Safari fountain pen\n☐ Hobonichi Techo planner`,
    stickyNotes: [],
    tapedImages: [],
  },
  "sec-11": {
    id: "page-sec-11",
    sectionId: "sec-11",
    title: "Articles to Read",
    content: `Reading Queue:\n\n1. "The Psychology of Flow" — Csikszentmihalyi\n2. "How to Take Smart Notes" — Ahrens\n3. "Deep Work" — Cal Newport\n4. "The Design of Everyday Things" — Norman\n5. "Thinking, Fast and Slow" — Kahneman`,
    stickyNotes: [],
    tapedImages: [],
  },
  "sec-12": {
    id: "page-sec-12",
    sectionId: "sec-12",
    title: "Research Notes",
    content: `Topic: Skeuomorphic Design Revival\n\nKey findings:\n- Users respond positively to tactile metaphors in digital interfaces\n- Skeuomorphism aids discoverability for non-technical users\n- Modern "neo-skeuomorphism" (neumorphism) is a softer evolution\n- Apple's iOS 7 flat design shift was controversial but commercially successful`,
    stickyNotes: [
      {
        id: "sn-6",
        x: 450,
        y: 240,
        width: 185,
        height: 120,
        content: "Find the Nielsen Norman study on this!",
        color: "#FBCFE8",
        rotation: 2.2,
      },
    ],
    tapedImages: [],
  },
  "sec-13": {
    id: "page-sec-13",
    sectionId: "sec-13",
    title: "Archive — 2024",
    content: `2024 Highlights:\n\nQ1: Launched v1.0 of the side project\nQ2: Promoted to senior role\nQ3: Moved to new apartment\nQ4: Completed online course in ML\n\nOverall: A year of significant personal and professional growth.`,
    stickyNotes: [],
    tapedImages: [],
  },
  "sec-14": {
    id: "page-sec-14",
    sectionId: "sec-14",
    title: "Archive — 2023",
    content: `2023 Highlights:\n\nBegan journaling consistently\nRead 18 books (target was 20)\nStarted learning Spanish\nFirst solo trip abroad\n\nLessons learned: consistency beats intensity. Small daily actions compound.`,
    stickyNotes: [],
    tapedImages: [],
  },
};
