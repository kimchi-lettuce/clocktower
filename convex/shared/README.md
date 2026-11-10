# Shared helpers

This directory holds pure helpers that do not import Convex server context or frontend code.

- Use it only when two or more domains need the same helper.
- Keep helpers small and deterministic.
- Prefer domain-local logic when only one domain needs it.
