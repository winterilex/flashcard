# Flashcard — Requirements Contract v1

## Must do (only these)
1. Add card: Front/Back textareas + Add button; card appears in list.
2. Delete card: Delete button on each card.
3. Flip card: clicking toggles front/back.
4. Local persistence: cards survive page refresh via localStorage.
5. Mobile usable: readable fonts, tappable buttons, no overlap on iPhone Safari.
6. Shuffle: reorder cards; order persists across refresh.
7. Add view / List view: toggle between add form and card list. Add view is the default view on load.
8. Single Word View: one card at a time; Next Word, Shuffle, Add, List buttons.
9. Batch navigation (List view): Up/Down buttons paginate cards; replace current batch (non-cumulative); disable at boundaries; reset to first on add/delete/shuffle.
10. Start-side control: Random toggle + Front First/Back First. Random: random start side per render, user flips NOT preserved, side selector hidden. Off: selected start side, user flips preserved, side selector shown.

## Invariants (not inferable from code)
11. Navigation: "Word List" button always returns to List view (never Add view); "Add" button always returns to Add view.
12. localStorage keys: `flashcard_v1` (cards), `flashcard_v1_start` (start-side state).
13. Never white-screen: try/catch on all localStorage reads/writes.
14. Defaults: empty card array, random=false, side=front on missing or invalid data.
15. Pure static: index.html + style.css + app.js; no framework, no build step.

## Must NOT do (write no code for these)
- Import/export (CSV, JSON, Anki, etc.)
- Spaced repetition (SRS), review queue, rating/scheduling
- Accounts, cloud sync, multi-device sync
- Native app, App Store packaging
- Animations, gestures, drag-and-drop sorting, keyboard shortcuts
- Bulk editing, decks/groups
