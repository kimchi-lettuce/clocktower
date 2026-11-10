# Brand

One page on what ChristOnline feels like and how it looks, written so Daniel and the agents can act on it from the same words. **Status: draft — Daniel confirms the principles and voice below.**

## Brand in one paragraph

ChristOnline is one trusted place for church life: recommended resources, welcoming, and Sunday attendance, with privacy governed by the people who serve and lead. It replaces separate tools, so it must feel settled and dependable — a calm place where church work gets done, not a busy control panel.

## Principles (draft)

1. **Calm and trustworthy.** The product handles names, attendance, and private notes. Quiet surfaces, generous space, and restrained color say "your data is safe here."
2. **Welcoming.** Welcoming people on Sunday is the heart of the product. Buttons, greetings, and flows read warmly and plainly; a visitor should never need training.
3. **Privacy made visible.** Role-scoped access is a feature people must see working. Where access is limited, say so plainly on the screen rather than silently returning nothing.
4. **Plain words.** Common terms from the [glossary](../product/glossary.md), short sentences, no untranslated church jargon or software jargon.

## Voice

- Short sentences, direct verbs, no exclamation marks.
- Speak to the person doing the work: the welcomer, the warden, the member.
- Where a term has one meaning, use it exactly; add new meanings through the glossary, not in passing.

## How look and feel are applied

- Colors, type, spacing, and shape live in one token file: `packages/design/src/tokens.css`, named `--brand-*`.
- The app turns those tokens into Tailwind utilities (`bg-accent`, `text-ink`, `rounded-md`); the marketing site uses the same variables directly, so both keep in step.
- The default Tailwind color palette is switched off in the app. Anything not using brand tokens shows up plainly in review instead of accumulating quietly.
- Screens and stepwise flows belong in [flows.md](flows.md); quick look-and-feel questions and their outcomes belong on this page; durable look decisions go into [product/decisions.md](../product/decisions.md).
