# PrintQuote frontend

PrintQuote makes draft quotations for an offset printing press. The person quoting picks a product template, fills in the job details, and the backend prices the job from the configured rate tables. The cost sheet it shows has the same layout as the press's Excel sheets.

This repository is the single-page app: React 19, TypeScript (strict), Vite, `react-router-dom` and `@tanstack/react-query`. Styling is plain CSS with design tokens; there is no UI kit or CSS framework.

All prices come from the API (`POST /api/costing/calculate`). The frontend does no costing of its own. The product has no AI or LLM features.

The API contract, screens and printing terms are defined in [`../printquote-backend/docs/technical-design.md`](../printquote-backend/docs/technical-design.md) (sections 4.4, 6 and 7 for the frontend).

## Prerequisites

- Node 22 or later, npm 10 or later
- The PrintQuote API (`printquote-backend`) running on `http://localhost:5080`. See section 9 of the technical design.

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

The dev server proxies `/api` to `http://localhost:5080`, so start the backend first. Without it the pages load but show "Cannot reach the server".

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server on port 5173 with the `/api` proxy |
| `npm run build` | Type check (`tsc -b`) and production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint (typescript-eslint, react-hooks, react-refresh) |

## Routes

| Route | Screen |
|---|---|
| `/` | Dashboard: status counts, template shortcuts, quotation list |
| `/quotations` | Quotation list with status filter, search and paging |
| `/quotations/new?template={id}` | Quote builder with the live cost sheet |
| `/quotations/{id}` | Quotation detail: internal cost sheet / customer quotation, breaks, versions, status, print |
| `/quotations/{id}/edit` | Quote builder loaded from the current version; saving adds a version |
| `/settings/papers` | Papers, with a price-per-kg to price-per-rim helper |
| `/settings/presses` | Presses with print rate slabs and a "try it" box |
| `/settings/finishing` | Finishing operations, binding types, profit rules, settings |
| `/settings/templates` | Product templates and their components, fields and extras |
| `/settings/customers`, `/settings/companies` | Customers and letterheads |

## Folder structure

```
src/
├── api/          types.ts (mirrors the API contract), client.ts (fetch + ProblemDetails errors),
│                 crud.ts, masterData.ts, costing.ts, quotations.ts (React Query hooks)
├── components/   Layout, PageHeader, CrudSection, ProblemBanner, StatusChip,
│   ├── form/     shared form controls (labelled inputs, selects, checkboxes)
│   └── costsheet/ cost sheet table, summary, breaks, trace, internal / customer documents
├── lib/          format.ts (en-IN numbers), quoteDraft.ts (template -> JobSpec), rates.ts, labels.ts
├── pages/        Dashboard, quote builder, quotation detail, settings pages
└── styles/       tokens.css (design tokens), global.css, print.css
```

Conventions (from the technical design): API types live only in `src/api/types.ts`; server state goes through React Query and is copied into local state only for form drafts. Money displays in Indian grouping with two decimals (`4,09,467.85`).

## Printing

The quotation detail page has a Print button. The print stylesheet hides the navigation and side panels, so only the selected document (internal cost sheet or customer quotation) is printed.

## Docker image

```bash
docker build -t printquote-web .
```

The image builds the app with Node 22 and serves `dist/` from nginx (unprivileged, port 8080). nginx also proxies `/api/*` to `API_UPSTREAM` (default `http://api:8080`) and falls back to `index.html` for client-side routes. The config is in `nginx/default.conf.template`. The full stack and the deployment steps are in the backend repo: `printquote-backend/deploy/README.md`.
