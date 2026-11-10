# Agent-native ChristOnline (ideas)

Two ideas from Kinzey (2026-10-15), articulated so we can judge them and pick the first slice. Status: ideas — nothing decided or built.

## 1. The do-it-with-you agent

The pitch: church software is complex, so instead of more tutorials, an assistant inside ChristOnline can **do the task for you, visibly**. You describe what you want ("set up a check-in list for the 9am service"), and the product shows the agent working: a cursor moves through the real interface, clicks the right tabs, fills the forms, and completes the task while you watch. You learn the interface by seeing it used; you always see what happened.

Why we think it can work: the agent does not need to hack the computer — ChristOnline exposes its own small set of front-end commands (like "move the pointer to this element", "click this button", "type into this field"). The agent uses those primitives, constrained to the real UI and to **your own account and permissions**. There is no back door: the agent can only reach data you can reach.

What this would need, eventually:

- Front-end primitives the agent can call (pointer, focus, click, fill, navigate).
- The same server-side [role policy](../technical/rbac-tenancy-design.md) as a human, with confirmation for destructive or money-like actions and a visible "agent is working" state that the user can interrupt.

## 2. Views as documents

The inspiration is TanStack Charts' editor-first, primitives-that-compose interface. The idea: make our screens and charts **composable from data**, not hardcoded. A chart on a dashboard is really a document — "these series, this grouping, this look" — that describes how the primitives should render. Then the chat agent can *build views*: you ask for "weekly attendance by service, last term", the agent writes the document, and the reactive chart appears — because the document is the API. You can tweak it in words; it saves like any other record.

This is how we'd articulate the idea: **the interface is rendered from documents; the agent (or you) authors documents.** It also fits the brand: simplicity comes from composing a small set of primitives rather than shipping a control panel for every need.

What this would need: chart/dashboard primitives that take their shape from stored documents, and contracts for what a view document may contain.

## First slice candidates

Small enough to prototype, in order of evidence we'd get for the effort:

1. One agent-answered chat panel over church data, reading with a real role (proves the agent layer).
2. One dashboard chart that renders from a stored view document (proves views-as-documents).
3. In-app agent driving a two-step flow with the pointer primitives (proves do-it-with-you).