# Roles and tenancy — design proposal

A draft design for who can do what, written before any role code exists. Grounded in the lessons of the Church Welcoming App (attendance.crosscheck.au) and the privacy work in [data-governance.md](data-governance.md). Status: proposal — Daniel confirms before implementation.

## The four roles

Top-down by authority. Named in [glossary.md](../product/glossary.md); definitions are "to confirm".

| Role | Who | Scope | Data posture |
|---|---|---|---|
| **Developer** | Kinzey and Daniel building the platform | All orgs, but platform operations only | Does **not** imply seeing member data; any support access requires warden approval and logging |
| **Admin** | Church staff running the system | Everything inside their one church | Sees all ministries, including membership and governance decisions |
| **Manager** | Heads of ministry teams | One ministry inside a church | Sees and manages their ministry's records and Helpers |
| **Helper** | Volunteers serving on a team | Rosters and check-in needs for their team | Minimal PII: names and what the task requires; no pastoral notes, no full member records |

The crucial difference from the welcoming app's tier ladder: every role except Developer is **scoped**, not global. "Admin" no longer means "global admin" — it means admin of one church.

## Tenancy

The welcoming app was effectively single-church with global staff roles. Before features depend on it, ChristOnline should make tenancy explicit. Two options:

- **Option A — one deployment, explicitly scoped:** a first-class "church" record; every domain table carries the church id; the policy layer enforces the scope on every read and write.
- **Option B — one deployment per church:** hard isolation at the infrastructure boundary.

**Recommendation: Option A.** It costs one id column and one policy habit, keeps us on one deployment for a two-person team, and leaves room to serve multiple churches later. Option B stays the fallback if a church demands physical isolation. Either way, role grants must be stored as *(person, role, scope)* rows checked server-side — never inferred from client state.

## What we keep from the welcoming app

- **Privacy approvals by a human.** Wardens approved access there; the same governance should exist here — Admin or Warden approves sensitive access, and "privacy made visible" remains a brand principle ([brand.md](../design/brand.md)).
- **Role tiers that volunteers can understand.** Helper really must see less, and the UI should say so.

## What we fix for ChristOnline

1. **Centralized policy, not per-screen checks.** One policies layer in the backend (see [convex-backend-standard.md](convex-backend-standard.md)) decides every role question; screens render, they do not authorize.
2. **Deny by default.** Every domain read starts closed and is opened by a grant. The welcoming app grew screens with implicit access; this time access is a data decision, not a code decision.
3. **Role-shaped projections.** Helper-facing endpoints receive a PII-reduced read model (names as needed only), rather than full records filtered in the UI.
4. **Agents inherit the same policy.** When the [agent-native ideas](../product/agent-native.md) land, an agent acts with the acting person's role — it never has its own superpowers.

## Open decisions for Daniel

- Confirm the four names, or whether "Warden" survives as a distinct governance role.
- One deployment (Option A) vs one deployment per church (Option B).
- Children's attendance: which roles may record and see it, and does a tighter rule apply?
- Export and deletion on request: who may trigger it?