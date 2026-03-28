# Event ticket booking

Single-page seat selection and checkout UI for events. Data is loaded from a mock API; booking state (selections, holds, simulated competition for seats) lives in the client.

## Stack

| Area | Choice |
|------|--------|
| Runtime | React 19, TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`) |
| Server state | TanStack Query (seat list fetch + cache) |
| Icons | Lucide React |

## Requirements

- Node.js 20+ (LTS recommended)
- npm (or compatible client)

## Scripts

```bash
npm install    # dependencies
npm run dev    # dev server + HMR
npm run build  # typecheck + production bundle
npm run lint   # ESLint
npm run preview # serve ./dist locally
```

## Project layout

```
src/
├── app/                 # App shell, providers, query client
├── pages/HomePage.tsx   # Booking flow orchestration
├── features/booking/    # Seat grid, panel, modals, pricing helpers
└── main.tsx
```

Path alias: `@/` → `src/`.

## Behaviour (summary)

- **Seat map:** VIP (rows A–B) and General (C–J), built in `buildSeats.ts` and exposed as `Seat[]` via `fetchSeatList` (~300ms delay).
- **Selection:** Multi-select with cart-style panel; pricing uses subtotal, convenience fee, and GST via `computeCartTotals`.
- **Hold timer:** Five-minute countdown from first selection; expiry clears the cart.
- **Simulation:** Periodic client-side updates mark random available seats as taken (excluding current picks and already-booked IDs) to model contention.
- **Checkout:** Confirms booking in-app, shows a summary modal, and marks seats unavailable for the rest of the session.

## Constraints

- No real payments or backend persistence; refresh resets session state except what React Query caches for the mock list.
- Seat “reserved for you” is not stored on the server model—only `pickedIds` and merged display state.

## Browser support

Targets modern evergreen browsers (flex, grid, `dvh`, CSS `scrollbar-*` / `::-webkit-scrollbar` where used). Test on the browsers you ship to.
