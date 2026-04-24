# AGENTS.md — AI Assistant Guide for Velo Notes

Last Updated: April 2026  
Project: Velo Notes — Digital Ring Binder  
Version: 1.1

## 1\. Purpose of this document

This file tells AI assistants how Velo Notes works and how to make safe, on-style changes.  
If you propose code, you must follow the architecture, design rules, and coding conventions described here.

## 2\. High-level overview

**What Velo Notes is**

* Full-stack digital notebook with a leather-bound journal aesthetic.
* Notebook → sections (tabs) → pages hierarchy, with cross-device sync via MongoDB Atlas.
* Authenticated, single-user per account; offline-friendly using `localStorage` fallback.

**Live endpoints**

* Live app: `https://velonotes.com`
* Backend API: `https://digital-notebook-ypfo.onrender.com`

**Core goals (do not regress)**

* Cross-device sync across desktop and mobile.
* Offline-first notes, with backend as source of truth and `localStorage` as fallback.
* Tactile, skeuomorphic design.
* Fast perceived performance.
* Secure auth with JWT and bcrypt.
* Free tier-friendly hosting and infrastructure.

## 3\. Tech stack and structure

**Stack**

* Frontend: React 18 + TypeScript, Vite 7, wouter, Tailwind CSS + custom CSS, Lucide React icons.
* Backend: Node.js + Express + TypeScript.
* Database: MongoDB Atlas.
* Auth: JWT + bcrypt.
* Deployment: Cloudflare Pages + Render.
* Package manager: pnpm.

**Repository layout**

```text
velo-notes/
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React Context (Auth, Binder)
│   │   ├── pages/          # Route pages (Home, LandingPage)
│   │   ├── data/           # Static data \& types
│   │   ├── index.css       # Global skeuomorphic styles
│   │   └── main.tsx        # Frontend entry point
│   ├── index.html
│   └── package.json
├── server/                 # Backend (Express + TypeScript)
│   ├── index.ts            # Main server file \& routes
│   ├── models/             # Database models (User.ts)
│   └── package.json
├── .env                    # Backend env vars (DO NOT COMMIT)
├── .gitignore
└── package.json            # Root config
```

## 4\. Design system (non-negotiable)

**Visual style**

* Theme: Tactile Realism / Brutalist Skeuomorphism.
* Metaphor: leather-bound journal on a wooden desk.
* Colors: warm browns, ambers, cream paper tones; avoid cold blues and greys for core UI chrome.
* Typography:

  * Caveat — handwriting accents and user-content feel.
  * Libre Baskerville — serif reading and heading feel.
  * Courier Prime — typed/utility feel.

**Key design files**

* `client/src/index.css` — global skeuomorphic styles.
* `client/src/components/Sidebar.tsx` — bookshelf-style notebook list.
* `client/src/components/Canvas.tsx` — paper-like note editing surface.
* `client/src/pages/LandingPage.tsx` — leather journal auth screen.

**Design principles**

* Everything should feel tactile: leather, paper, tabs, depth, and subtle texture.
* Keep the palette warm and analog.
* Preserve handwritten character where appropriate.
* Use subtle motion only.
* Maintain mobile-first responsiveness down to 320px width.

**Design Do / Don't**

* Do extend existing skeuomorphic patterns from `index.css` and current components.
* Do make interactions feel tactile and intentional.
* Do preserve the notebook metaphor.
* Don't flatten the UI into generic SaaS styling.
* Don't introduce cold color schemes for primary surfaces.
* Don't add flashy animations that break the tactile tone.

## 5\. Auth and data model

### 5.1 Authentication

**Flow**

`Register → JWT issued → stored in localStorage → used on protected routes → synced to MongoDB`

**Key files**

* `client/src/contexts/AuthContext.tsx` — auth state and token handling.
* `server/index.ts` — auth and protected routes.
* `server/models/User.ts` — user model and bcrypt password hashing.

**Token storage (current contract)**

* Key: `auth\_token`
* Location: `localStorage`
* Expiry expectation: 30 days
* Header format: `Authorization: Bearer <token>`

**Protected routes**

* All `/api/user/\*` and `/api/notes/notebook/\*` routes require a valid JWT.

**AI rule**

Do not silently change token storage or auth behavior without updating both frontend and backend and preserving compatibility.

### 5.2 Binder data model

```ts
interface BinderData {
  notebooks: Notebook\[];
  sections: Section\[];
  pages: Record<string, Page>;
  activeNotebookId: string;
  activeSectionId: string;
}

interface Notebook {
  id: string;
  title: string;
  color: string;
  spineAccent: string;
  emoji: string;
}

interface Section {
  id: string;
  title: string;
  notebookId: string;
  tabColor: string;
  tabColorDark: string;
  tabTextColor: string;
}

interface Page {
  id: string;
  sectionId: string;
  title: string;
  content: string;
  stickyNotes: any\[];
  tapedImages: any\[];
}
```

**Sync strategy**

* Optimistic UI updates local state immediately.
* Debounced save syncs to backend after about 1 second.
* `localStorage` is the fallback if backend is unavailable.
* Backend is the source of truth if both exist.

**AI rule**

When changing binder-related features, update types first and preserve the backend-first sync model.

## 6\. Deployment and environment

**Frontend**

* Build command: `pnpm build`
* Output directory: `client/dist`
* Env var: `VITE\_API\_URL=https://digital-notebook-ypfo.onrender.com/api`

**Backend**

* Start command: `pnpm tsx server/index.ts`
* Env vars:

  * `MONGODB\_URI=mongodb+srv://...`
  * `JWT\_SECRET=your-super-secret-key-change-in-production`
  * `PORT=3002`
  * `NODE\_ENV=production`

**Database**

* MongoDB Atlas free tier (M0)
* Database: `digital\_binder`
* Collections: `users`, `notes`

## 7\. Coding conventions

### TypeScript

* Use strict mode.
* Define interfaces for shared data structures.
* Use `interface` for objects and `type` for unions.
* Avoid `any`; prefer `unknown` or precise types.

### React

* Use functional components with hooks.
* Use `useCallback` for passed event handlers where helpful.
* Use cleanup functions in `useEffect` when needed.
* Use Context for global state like auth and binder data.

### Naming

|Thing|Convention|Example|
|-|-|-|
|Components|PascalCase|`NotebookSpine.tsx`|
|Component files|PascalCase|`Sidebar.tsx`|
|Utils|camelCase|`authUtils.ts`|
|Variables|camelCase|`activeNotebookId`|
|Constants|UPPER\_SNAKE\_CASE|`API\_URL`, `STORAGE\_KEY`|
|CSS classes|kebab-case|`.notebook-spine-wrapper`|

## 8\. API routes and contracts

**Pattern**

`/api/:resource/:action/:id` where appropriate.

**Current routes**

* `GET /api/notes` — list notes
* `POST /api/notes` — create note
* `PUT /api/notes/notebook/:id` — rename notebook
* `DELETE /api/notes/notebook/:id` — delete notebook
* `POST /api/auth/register` — register
* `POST /api/auth/login` — login
* `GET /api/user/data` — get user data (protected)
* `POST /api/user/data` — save user data (protected)

**AI rule**

Implement backend routes before wiring frontend calls, and preserve existing route style.

## 9\. Common issues and debugging

* TypeScript binder data errors: add explicit type assertions where needed.
* Mobile login failures: check CORS in `server/index.ts`.
* Render cold starts: expect first request delays of 30–60 seconds.
* Sync conflicts: backend wins; `localStorage` is fallback only.

**Debugging workflow**

* Check browser console first.
* Check Network tab for API requests.
* Verify MongoDB Atlas writes.
* Test on desktop and mobile.
* Check Render and Cloudflare logs for deployment/runtime issues.

## 10\. Testing checklist

Before deploying, verify:

* Login/register works on desktop and mobile.
* Notes sync across devices.
* Notebook rename/delete works.
* Section delete works safely.
* Auth persists after refresh.
* Mobile sidebar works.
* No production console errors.

## 11\. AI assistant rules of engagement

### When suggesting code

* Match existing patterns by checking similar files first.
* Use TypeScript with real types.
* Consider mobile behavior.
* Preserve the skeuomorphic design system.
* Add error handling for async flows.
* Update both frontend and backend when changing shared behavior.

### When adding features

* Update types first.
* Build backend support before frontend integration.
* Use existing Context providers when global state is needed.
* Test locally before suggesting deployment.
* Consider Render cold starts, MongoDB limits, and offline behavior.

## 12\. Environment variables

**Backend `.env`**

```env
MONGODB\_URI=mongodb+srv://username:password@cluster.mongodb.net/digital\_binder
JWT\_SECRET=your-super-secret-key-change-in-production
PORT=3002
NODE\_ENV=production
```

**Frontend `client/.env.production`**

```env
VITE\_API\_URL=https://digital-notebook-ypfo.onrender.com/api
```

## 13\. Known limitations and roadmap

**Current limitations**

* Render backend sleeps after inactivity.
* MongoDB Atlas M0 has a 512 MB limit.
* No real-time collaboration.
* Images are stored as base64, so they should remain small.

**Possible future enhancements**

* Export notes as PDF.
* Dark mode toggle that still respects the tactile aesthetic.
* Note sharing.
* Full-text search.
* Version history / undo.
* Rich text editor.
* Drag-and-drop sections.
* Notebook templates.

## 14\. Safe change checklist for AI

Before making non-trivial changes:

* Identify the source-of-truth files involved.
* Check whether the change affects frontend, backend, database, or all three.
* Preserve auth behavior and binder hierarchy.
* Preserve mobile responsiveness.
* Preserve tactile design patterns.
* Test the happy path and at least one failure path.

For any non-trivial change, explain which files should be edited and how data flows from frontend to backend to database.



\## Coding Conventions



\- All component props must be explicitly destructured

\- Never use CustomEvent for parent-child communication - use direct callback props instead

\- Event handlers follow the pattern: on\[Action]Notebook

