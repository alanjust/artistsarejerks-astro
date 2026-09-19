# Artists Are Jerks Community Prototype Review

This low-fidelity prototype turns the current community brief into three linked screens. It uses the pilot data in `src/data/community-pilot.json` and does not connect to a database, publish content, send notices, or process sales.

## Review routes

- `/prototype/` — visitor discovery led by Showing Now
- `/prototype/artists/alan-just/` — current-show artist page
- `/prototype/artists/lana-yost/` — upcoming-show artist page
- `/prototype/onboarding/artwork/` — artist's first artwork upload

## Questions the prototype is meant to answer

1. Does a visitor immediately understand that Showing Now means art they can physically see today?
2. Are the city choices prominent enough for people who will travel within one Rogue Valley city but not another?
3. Does the artwork remain primary while the venue still supplies the practical information needed to visit?
4. Does an artist page clearly distinguish work at a current show from other public work?
5. Is the first upload short enough for an artist who has only an image ready?
6. Are private draft, public artwork, sale presentation, and physical-show assignment understood as separate choices?
7. Does the success screen give the artist a useful next step without making the first upload longer?

## Deliberate prototype behavior

- A blank title becomes `Untitled`.
- Medium, year, size, and description are optional during the first upload.
- New work begins as a private draft.
- The artist can make artwork public without assigning it to a show.
- Show assignment happens after the artwork is saved.
- The artist creates the venue association. Venue confirmation is not required.
- The artist contact form demonstrates private forwarding and never reveals an email address.
- The upload form stores a tiny demonstration record in that browser's local storage only.
- All prototype routes use `noindex, nofollow`.

## Decisions to carry into Figma after review

- Exact amount and prominence of the Featured Artist sidebar
- Whether upcoming shows belong on the Showing Now landing page
- Whether city filtering should use buttons, a map, or both
- Whether `Untitled` should be assigned silently or shown for acknowledgement
- Whether the sale choice belongs in the first upload or the next edit screen
- What taking an artist page offline does to a still-active public show
