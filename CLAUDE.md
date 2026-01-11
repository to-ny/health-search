# CLAUDE.md

## Project

Next.js 16 App Router application for searching Belgium's SAM v2 medication database. REST API routes proxy SOAP services to the frontend.

## Commands

```bash
bun install          # Install dependencies
bun dev              # Dev server at localhost:3000
bun run build        # Production build
bun lint && bun typecheck && bun run test  # Quality check (run before committing)
```

## Domain

### Medication Hierarchy
- **VTM** (Virtual Therapeutic Moiety): Active substance
- **VMP** (Virtual Medicinal Product): Generic definition (VTM + strength + form)
- **AMP** (Actual Medicinal Product): Branded product from a company
- **AMPP**: Package presentation (e.g., 30 tablets vs 100 tablets)
- **CNK code**: 7-digit Belgian medication identifier (on AMPP level)
- **ATC code**: WHO therapeutic classification for categorizing medications

### Reimbursement
- **Categories**: A (100%), B (75%), C (50%), Cs/Cx (special conditions), Fa/Fb (lump-sum)
- **Chapter IV**: Restricted drugs requiring prior authorization
- **Patient status**: Standard vs preferential - affects out-of-pocket cost

### Ingredients
- **Active ingredients**: Therapeutic substances (linked to VTM)
- **Excipients**: Inactive ingredients (fillers, binders, coatings)
- **Allergens to flag**: lactose, gluten, colorants, aspartame

## Testing

Run all tests: `bun run test` (required before committing)

### Unit Tests (Vitest)
- Location: `tests/unit/*.test.ts`
- Mock SOAP responses using fixtures from `tests/fixtures/soap/`
- Add tests for: services, utils, XML parsing logic

### E2E Tests (Playwright)
- Location: `tests/e2e/*.spec.ts`
- Tests run against production build
- Add tests for: user flows, UI behavior, accessibility
