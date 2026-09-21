// Pure display helpers shared by server-rendered pages and browser scripts.
// Keep this module free of storage imports so Astro frontmatter can use it.
export type ShowingPhase = 'upcoming' | 'showing-now' | 'expired';
export function localDay(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
}
export function showingStatus(show: {start: string; end: string}, today?: string): ShowingPhase {
  const day = today && /^\d{4}-\d{2}-\d{2}$/.test(today) ? today : localDay();
  return day < show.start ? 'upcoming' : day > show.end ? 'expired' : 'showing-now';
}
export function dates(show: {start: string; end: string}) {
  const label = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'});
  return `${label(show.start)}–${label(show.end)}`;
}
export function datesLine(show: {start: string; end: string}, today?: string) {
  return `${showingStatus(show, today) === 'upcoming' ? 'Coming soon' : 'Showing now'} · ${dates(show)}`;
}
export function venueSlug(name: string) {
  return name.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
export function venueProfileUrl(id: string) {
  return id === 'venue-leos-brewpub' ? '/prototype/venues/leos-brewpub-and-grill/' : `/prototype/venues/profile/?venue=${encodeURIComponent(id)}`;
}
// Today's date in the community's own time zone (the server clock is UTC).
export function regionDay(timeZone = 'America/Los_Angeles', now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {timeZone, year: 'numeric', month: '2-digit', day: '2-digit'}).format(now);
}
