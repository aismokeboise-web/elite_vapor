# Frontend (Next.js) – Elite Admin Panel

This `frontend` app is a standalone **Next.js + TypeScript** project that provides
an admin/subadmin console UI for the `backend` API.

It does **not** depend on the existing `client` / `server` folders.

## Getting started

From the repository root:

```bash
cd frontend
npm install
npm run dev
```

By default the app runs at `http://localhost:3000`.

You should have the `backend` API running (by default `http://localhost:5000`),
as the login page talks to its auth endpoints.

### Environment variables

Create a `.env.local` file in `frontend/` if you want to override defaults:

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
```

- If `NEXT_PUBLIC_BACKEND_URL` is not set, the frontend defaults to `http://localhost:5000`.
- `GOOGLE_GENERATIVE_AI_API_KEY` is required for the `/chat` page (store assistant). Get a key from [Google AI Studio](https://aistudio.google.com/apikey).

## Auth integration

The frontend uses a lightweight auth context:

- `components/AuthProvider.tsx` wraps the app (in `app/layout.tsx`).
- Auth state contains:
  - `token` – JWT returned by backend.
  - `role` – `"admin"` or `"subadmin"`.
- The state is persisted in `localStorage` under the key `elite-admin-auth`,
  so a refresh keeps the user logged in.

Login is performed via the backend:

- Admin login: `POST /api/admin/login`
- Subadmin login: `POST /api/subadmin/login`

The returned `{ token }` is stored along with the selected role, and every
request you make manually from the frontend should include:

```http
Authorization: Bearer <token>
```

## Key pages and components

- `app/layout.tsx`
  - Global layout: wraps all pages with `AuthProvider` and `NavBar`.
- `app/page.tsx`
  - Home/dashboard shell.
  - Shows different messaging based on whether a user is logged in and what
    their role is (admin vs subadmin).
- `app/login/page.tsx`
  - Login page with:
    - **Role toggle** (Admin vs Subadmin).
    - `username` and `password` fields.
    - Error handling and loading state.
  - Calls the correct backend endpoint based on the selected role.
- `components/AuthProvider.tsx`
  - React context storing `token`, `role`, and `loading` state.
  - Exposes `login({ token, role })` and `logout()`.
- `components/NavBar.tsx`
  - Top navigation bar that:
    - Shows `Home` and `Login` when logged out.
    - When logged in:
      - Always shows `Home` and `Models`.
      - Shows `Manage Subadmins` for admins.
    - Displays the current role and a **Logout** button.
  - Fully responsive:
    - Desktop: horizontal nav with brand, links, and user role.
    - Mobile: compact brand row + `Menu` button that opens a vertical menu.
- `components/RequireAuth.tsx`
  - Utility wrapper for future protected pages.
  - Redirects unauthenticated users to `/login?next=/original/path`.

## Styling & responsiveness

Global styles live in `app/globals.css`. The design uses:

- A dark, glassy background with subtle gradients.
- A centered login card on larger screens and full-width on mobile.
- A sticky, responsive navigation bar:
  - On small screens it collapses into a `Menu` toggle and a slide-down list.
  - On larger screens it shows links inline.

You can extend or replace the styling as desired (e.g. integrate Tailwind or a
component library), but the current setup is intentionally lightweight and
framework-agnostic.

