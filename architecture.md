# Component Architecture

KESTREL Frontend is built using **Next.js 16 (App Router)** and **TypeScript**, emphasizing maintainability, type safety, and a component-based architecture.

## 1. Directory Structure

```plaintext
src/
├── app/                  # Next.js 16 File-System Routing (Pages, Layouts, API Routes)
├── components/           # Reusable UI Elements (Buttons, Charts, Modals, Forms)
├── context/              # Global State Management (AuthContext, ThemeContext)
├── hooks/                # Custom React Hooks (useAuth, useFetch, useMap)
├── lib/                  # Core Utilities & API Integrations
│   ├── api.ts            # Axios instances with JWT interceptors
│   ├── utils.ts          # Helper functions (formatting, validation)
│   └── leaflet.ts        # Map configuration constants
├── styles/               # Global CSS & Custom Design System Tokens
└── types/                # TypeScript Interfaces & Types
```

## 2. Core Modules & Their Responsibilities

### `app/` (Routing Layer)
We utilize the Next.js **App Router** (`app/` directory).
- **Layouts (`layout.tsx`)**: Responsible for consistent UI wrappers (Sidebars, Navbars, global Providers like Auth/Toasts).
- **Pages (`page.tsx`)**: Responsible for fetching page-specific data and composing components.
  - *Note*: We isolate fetch logic to Server Components where possible for improved performance and SEO, passing serialized data down to Client Components.

### `components/` (Presentation Layer)
- UI components are built using native HTML/CSS and heavily lean into our **Custom Design System**.
- **`ChartWidget.tsx`**: A standardized wrapper around `react-chartjs-2`, accepting generic datasets for line, bar, and doughnut charts.
- **`DataTable.tsx`**: A highly reusable, generic data grid that accepts column configurations and custom render props.
- **`MapPicker.tsx` / `HeatmapMap.tsx`**: Encapsulates `react-leaflet` logic. Dynamically imported (SSR disabled) to prevent `window is not defined` errors.

### `lib/api.ts` (Data Access Layer)
- Centralized `Axios` instance.
- Handles authorization natively via request interceptors (injecting Bearer tokens).
- Response interceptors catch `401 Unauthorized` globally, automatically redirecting users to `/login`.

### `context/AuthContext.tsx` (State Management)
- Manages the user's authentication session, role (`admin`, `officer`, `user`), and JWT storage.
- Wrapped around the root application within `app/layout.tsx`.

## 3. Data Flow Diagram

1. **User Action**: The user interacts with a component (e.g., clicks "Submit Report" in `ReportForm`).
2. **Hook/Context**: The form invokes a custom hook or directly uses `api.ts` to perform an HTTP request.
3. **API Interceptor**: `lib/api.ts` intercepts the request, appending the `Authorization` header containing the JWT from `localStorage`.
4. **Backend Processing**: Request is sent to the Express.js backend.
5. **UI Update**: The React component handles the response, updating local state, dispatching a success notification (`react-toastify`), or catching errors.

## 4. Design System & Styling

We do not use generalized utility-first frameworks like Tailwind. Instead, we use a custom, semantic CSS architecture defined in Vanilla CSS (`src/styles/globals.css`).

- **CSS Variables for Design Tokens**: We expose themes, colors, spacing, and typography via CSS variables (`--color-forest`, `--surface-card`).
- **Semantic Classes**: We use specific `.btn`, `.card`, `.badge` classes for reliable UI consistency without bloating the DOM with utilities.

## 5. Third-Party Integrations
- **Charting**: `Chart.js` via `react-chartjs-2`.
- **Mapping**: `Leaflet` + `react-leaflet`. Heatmaps specifically utilize `leaflet.heat`.
- **Toasts**: `react-toastify` for transient, non-blocking user feedback.
