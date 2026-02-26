# 🦅 KESTREL – Frontend

**Biodiversity Monitoring & Ecological Reporting Platform**

Next.js web application for KESTREL, providing a complete interface for biodiversity reporting, geospatial mapping, analytics dashboards, community forums, and admin management.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS + Custom Design System |
| HTTP Client | Axios (with JWT interceptors) |
| Maps | Leaflet + react-leaflet |
| Charts | Chart.js + react-chartjs-2 |
| Forms | React Hook Form |
| Notifications | react-toastify |
| Auth State | React Context API |

---

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout (Inter font, AuthProvider, ToastContainer)
│   ├── page.tsx                  # Root redirect → /login or /dashboard
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── forgot-password/page.tsx
│   ├── reset-password/page.tsx   # Token-based, reads ?token= from URL
│   ├── dashboard/page.tsx        # Overview: stats, map, charts, alerts
│   ├── report/page.tsx           # 3-tab reporting: Field Survey, Community, Bulk CSV
│   ├── analytics/page.tsx        # Charts: species, trends, conservation, regions
│   ├── admin/page.tsx            # 4-tab admin panel
│   ├── forum/page.tsx            # Community forum with posts & comments
│   └── profile/page.tsx         # Edit profile, avatar, researcher upgrade
├── components/
│   ├── Sidebar.tsx               # Role-filtered navigation + contribution score
│   ├── ProtectedRoute.tsx        # Auth guard + role guard with loading state
│   ├── Modal.tsx                 # Portal modal (ESC + backdrop dismiss)
│   ├── MapPicker.tsx             # Leaflet click-to-place marker (SSR-safe)
│   ├── ChartWidget.tsx           # Chart.js wrapper (Bar / Line / Doughnut)
│   └── DataTable.tsx             # Generic typed table with custom cell renderers
├── context/
│   └── AuthContext.tsx           # Global auth state, login/register/logout
├── hooks/
│   └── useAuthForm.ts            # Login and register form hooks
├── lib/
│   ├── api.ts                    # Axios instance with JWT injection + 401 redirect
│   └── auth.ts                   # SSR-safe localStorage token helpers
└── types/
    └── index.ts                  # Full TypeScript interfaces for all entities
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- KESTREL Backend running on `http://localhost:3001`

### Installation

```bash
git clone https://github.com/Kestrel-Biodiversity-Monitor/Kestrel-Frontend.git
cd kestrel-frontend
npm install
```

### Environment Setup

```bash
cp .env.example .env.local
```

`.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Running

```bash
# Development
npm run dev        # → http://localhost:3000

# Production build
npm run build
npm start

# TypeScript check
npx tsc --noEmit
```

---

## Pages

| Route | Access | Description |
|-------|:------:|-------------|
| `/login` | Public | Email + password sign-in |
| `/register` | Public | Account creation with organisation field |
| `/forgot-password` | Public | Email reset request |
| `/reset-password` | Public | Token-based new password form |
| `/dashboard` | ✅ Auth | Stat cards, observation map, charts, active alerts, recent reports |
| `/report` | ✅ Auth | Field Survey (map picker + image), Community Report, Bulk CSV upload |
| `/analytics` | ✅ Auth | Species distribution, monthly trends, conservation breakdown, region summary |
| `/admin` | ✅ Admin | Report review, user management, role requests, species CRUD |
| `/forum` | ✅ Auth | Community posts with categories, comments, and upvoting |
| `/profile` | ✅ Auth | Edit profile, avatar upload, researcher role request, account stats |

---

## Key Components

### `Sidebar`
Role-aware navigation. Admin-only links (`/admin`) are hidden for `user` and `researcher` roles. Displays the user's contribution score and a sign-out button.

### `ProtectedRoute`
Wraps any page that requires authentication. Redirects unauthenticated users to `/login`. Accepts an optional `requiredRole` prop to restrict access to `admin` or `researcher`. Shows a loading spinner while the auth state hydrates.

```tsx
<ProtectedRoute requiredRole="admin">
  <AdminPanel />
</ProtectedRoute>
```

### `MapPicker`
SSR-safe Leaflet map. Click anywhere to drop a pin. Emits `(lat, lng)` via `onLocationSelect` callback. Uses CartoDB light tile layer.

```tsx
<MapPicker onLocationSelect={(lat, lng) => console.log(lat, lng)} />
```

### `ChartWidget`
Thin wrapper around Chart.js. Supports `bar`, `line`, and `doughnut` chart types. Uses the platform's earth-tone colour palette automatically.

```tsx
<ChartWidget
  type="line"
  labels={["Jan", "Feb", "Mar"]}
  datasets={[{ label: "Reports", data: [12, 34, 28] }]}
/>
```

### `DataTable`
Generic fully-typed table. Accepts a `columns` array with optional `render` callbacks for custom cell content.

```tsx
<DataTable
  data={reports}
  columns={[
    { key: "speciesName", label: "Species" },
    { key: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> },
  ]}
/>
```

### `Modal`
Portal-based modal with ESC key dismiss and backdrop click to close. Supports `sm`, `md` (default), and `lg` sizes.

---

## Dashboard Overview

The `/dashboard` page fetches and displays:

- **4 stat cards** — Total reports, Approved, Pending, Species tracked
- **Monthly trend line chart** — Approved vs. Pending submissions across the year
- **Top reported species bar chart** — Top 15 species by report count
- **Observation map** — All approved reports rendered as colour-coded circle markers by risk level (green → low, orange → high, red → critical)
- **Active alerts panel** — Info / Warning / Critical styled alert banners
- **Recent reports table** — Last 5 submissions with status badges

---

## Auth Flow

1. `AuthProvider` checks `localStorage` for a saved JWT on mount
2. If found, it calls `GET /api/auth/me` to verify the token and hydrate the user state
3. On 401 responses, the Axios interceptor clears the token and redirects to `/login`
4. All state is managed through `useAuth()` hook

```tsx
const { user, login, logout, isLoading } = useAuth();
```

---

## Design System

The platform uses a handcrafted CSS design system in `globals.css` — no Tailwind utility classes at the component level.

**Colour Palette**

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-forest` | `#1a4731` | Primary brand, sidebar, buttons |
| `--color-forest-light` | `#2d7a55` | Hover states, accents |
| `--color-forest-pale` | `#d1eadc` | Highlighted backgrounds |
| `--color-slate` | `#0f1e2d` | Sidebar background |
| `--color-sand` | `#f0ebe3` | Warm neutral surface |
| `--surface-bg` | `#f5f7f5` | Page background |
| `--surface-card` | `#ffffff` | Card surface |

**Component classes** — `.card`, `.btn`, `.form-input`, `.badge`, `.data-table`, `.modal-overlay`, `.stat-card`, `.nav-item`, `.auth-card`, `.tabs`, `.alert-banner`

---

## Role-Based Access

| Feature | User | Researcher | Admin |
|---------|:----:|:----------:|:-----:|
| View reports & analytics | ✅ | ✅ | ✅ |
| Submit field reports | ✅ | ✅ | ✅ |
| Create species entries | ❌ | ✅ | ✅ |
| Access Admin Panel | ❌ | ❌ | ✅ |
| Approve / reject reports | ❌ | ❌ | ✅ |
| Manage users & roles | ❌ | ❌ | ✅ |

---

## Environment Variables

| Variable | Required | Description |
|----------|:--------:|-------------|
| `NEXT_PUBLIC_API_URL` | ✅ | Backend API base URL (e.g. `http://localhost:3001/api`) |

---

## License

MIT
