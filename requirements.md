# Flashcard — Requirements Contract v1

## Must do (only these)
1. Manually add a card: enter front/back text, click Add, card appears in the list.
2. Delete a card: each card has a Delete button.
3. Flip: clicking a card toggles between front and back.
4. Local persistence: use localStorage; data survives page refresh.
5. Mobile usable: readable font size, tappable buttons, no overlap on iPhone Safari.

## Must NOT do (write no code for these)
- Import/export (CSV, JSON, Anki, etc.)
- Spaced repetition (SRS), review queue, rating/scheduling
- Accounts, cloud sync, multi-device sync
- Native app, App Store packaging
- Animations, gestures, drag-and-drop sorting, keyboard shortcuts
- Bulk editing, decks/groups

## Technical constraints
- Pure static: index.html + style.css + app.js. No framework, no build step.
- localStorage key: `flashcard_v1`; value is a JSON array.
- On read, handle empty data and JSON.parse failure; never white-screen.
- If any feature falls outside this contract, stop and ask me first. Do not write it directly.
