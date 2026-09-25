// The Showings panel in an artist's workspace: where, when, and which pieces,
// on one screen, with a preview of the card visitors will see on Showing Now.
import {isStudio,readShowings,writeShowing,removeShowing,type Showing} from './prototype-showings';
import {imageUrl,isShown,memberUrl,type MemberArtist,type MemberWork} from './member-artists';
import {openTellPeople, openInviteVenue} from './tell-people';
import {showingStatus,shortDates,showingTag,needsCheckIn,checkInLapsed,localDay} from './showing-display';

type Place = {id: string; name: string; address: string; city: string; website: string; regionId?: string};
export interface ShowingsContext {
  id: string;
  approved: boolean;
  termsOk: () => boolean;
  artist: () => MemberArtist;
  save: (next: MemberArtist) => boolean;
  changed: () => void;
}
const $ = <T extends Element = HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const make = (tag: string, text = '', className = '') => { const node = document.createElement(tag); node.textContent = text; if (className) node.className = className; return node; };
const button = (text: string, onClick: () => void, className = '') => { const node = make('button', text, className) as HTMLButtonElement; node.type = 'button'; node.addEventListener('click', onClick); return node; };
const longDate = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString('en-US', {month: 'short', day: 'numeric'});

function normalizeWebsite(value: string) {
  if (!value) return '';
  try { const url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`); return ['http:', 'https:'].includes(url.protocol) && url.hostname.includes('.') ? url.href : null; } catch { return null; }
}

// Approved venues come from the public directory; the artist's own earlier places are added too.
let placesCache: Place[] | null = null;
async function loadPlaces(artistId: string): Promise<Place[]> {
  if (!placesCache) {
    placesCache = [];
    try {
      const response = await fetch('/api/community/public/state', {cache: 'no-store'});
      const body = await response.json() as {records?: {collection: string; payload: Record<string, unknown> | null}[]};
      placesCache = (body.records ?? []).filter((record) => record.collection === 'venues' && record.payload).map((record) => {
        const venue = record.payload!;
        return {id: String(venue.id), name: String(venue.name), address: String(venue.address ?? ''), city: String(venue.city ?? ''), website: String(venue.website ?? ''), regionId: String(venue.regionId ?? '')};
      });
    } catch {}
  }
  const own = readShowings().filter((show) => show.artistId === artistId && !placesCache!.some((place) => place.id === show.venueId))
    .map((show) => ({id: show.venueId, name: show.venue, address: show.address, city: show.city, website: show.website, regionId: show.regionId}));
  const unique = new Map([...placesCache, ...own].map((place) => [place.id, place]));
  return [...unique.values()];
}

export function initShowingsPanel(ctx: ShowingsContext) {
  const form = $<HTMLFormElement>('[data-showing-form]'), message = $('[data-showing-message]');
  const field = (name: string) => form.elements.namedItem(name) as HTMLInputElement;
  let editing: Showing | null = null, place: Place | null = null, newPlace = false, places: Place[] = [];
  let chosen: string[] = [], featured = '';
  const mine = () => readShowings().filter((show) => show.artistId === ctx.id);

  function stateOf(show: Showing) {
    const artist = ctx.artist();
    if (show.status === 'draft') return 'Draft. Only you can see it.';
    if (isStudio(show) && !ctx.artist().works.some(isShown)) return 'Hidden until your page has a piece on view.';
    if (!ctx.approved) return 'Waiting for your approval before it goes public.';
    if (!artist.published) return 'Hidden while your page is offline.';
    if (checkInLapsed(show)) return 'Hidden until you confirm it’s still up.';
    const phase = showingStatus(show);
    if (isStudio(show)) return phase === 'expired' ? 'Closed.' : 'On Showing Now under Studios by appointment.';
    return phase === 'expired' ? 'Ended.' : phase === 'upcoming' ? `On Showing Now under Artists to come. Opens ${longDate(show.start)}.` : 'On Showing Now.';
  }
  function renderList() {
    const list = $('[data-showings-list]');
    list.replaceChildren();
    const shows = mine().sort((a, b) => b.start.localeCompare(a.start));
    $('[data-showings-intro]').textContent = shows.length ? 'Your showings, newest first.' : 'List each place your work is hanging, so people can go see it in person.';
    for (const show of shows) {
      const card = make('article');
      card.append(make('h4', show.venue), make('p', `${show.city} · ${show.ongoing ? shortDates(show) : `${longDate(show.start)}–${longDate(show.end)}`}`), make('p', stateOf(show), 'showing-state'));
      const hidden = ctx.artist().works.filter((work) => work.hiddenByAdmin && show.artworkIds.includes(work.id));
      if (hidden.length) {
        const left = show.artworkIds.some((id) => ctx.artist().works.some((work) => work.id === id && isShown(work)));
        const names = hidden.map((work) => `“${work.title}”`).join(' and ');
        card.append(make('p', left ? `${names} ${hidden.length === 1 ? 'was' : 'were'} hidden by Artists Are Jerks, so ${hidden.length === 1 ? 'it’s' : 'they’re'} left out of this showing.${hidden.some((work) => work.id === show.featuredArtworkId) ? ' Your next piece is featured instead.' : ''}` : `${names} ${hidden.length === 1 ? 'was' : 'were'} hidden by Artists Are Jerks, and nothing else is left in this showing, so it’s off Showing Now. Edit it to add another piece.`, 'hidden-note'));
      }
      if (show.status === 'published' && needsCheckIn(show)) {
        const check = make('div', '', 'check-in');
        check.append(make('p', isStudio(show) ? 'Is your studio still open for visits?' : `Is your work still up at ${show.venue}?`));
        const actions = make('div', '', 'actions');
        actions.append(
          button(isStudio(show) ? 'Yes, still open' : 'Yes, still there', () => { writeShowing({...show, confirmedAt: localDay()}); refresh(); }),
          button(isStudio(show) ? 'No, it’s closed' : 'No, it came down', () => { const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1); writeShowing({...show, ongoing: false, end: localDay(yesterday) < show.start ? show.start : localDay(yesterday)}); refresh(); }),
        );
        check.append(actions);
        card.append(check);
      }
      const actions = make('div', '', 'actions');
      if (show.status === 'published' && showingStatus(show) !== 'expired') actions.append(button('Tell people', () => tell(show)));
      // A place that isn't on the site yet: the artist can send the owner an invitation.
      // Places the artist typed in themselves get a `new-` id until a venue joins.
      if (show.venueId.startsWith('new-') && showingStatus(show) !== 'expired') {
        card.append(make('p', `${show.venue} isn’t on Artists Are Jerks yet. Invite them, and they can list their hours and directions.`, 'hint'));
        actions.append(button('Invite this place', () => openInviteVenue(show, ctx.artist().name, `${location.origin}/for-venues/`)));
      }
      actions.append(button('Edit', () => void (isStudio(show) ? openStudio(show) : open(show))), button('Remove', () => { if (confirm(`Remove the showing at ${show.venue}?`)) { removeShowing(show.id); refresh(); } }));
      card.append(actions);
      list.append(card);
    }
  }
  function refresh() { renderList(); ctx.changed(); syncStudioButton(); }
  const tell = (show: Showing) => openTellPeople(show, ctx.artist().name, `${location.origin}${memberUrl(ctx.id)}`);

  // 1. Where?
  function showPlace() {
    $('[data-place-picker]').hidden = Boolean(place) || newPlace;
    $('[data-place-chosen]').hidden = !place;
    $('[data-new-place]').hidden = !newPlace;
    if (place) $('[data-place-label]').textContent = `${place.name} · ${place.city}`;
    renderPreview();
  }
  function renderPlaces() {
    const query = $<HTMLInputElement>('[data-place-search]').value.trim().toLowerCase();
    const results = $('[data-place-results]');
    results.replaceChildren();
    const matches = places.filter((item) => !query || `${item.name} ${item.city}`.toLowerCase().includes(query)).slice(0, 6);
    for (const item of matches) results.append(button(`${item.name} · ${item.city}`, () => { place = item; newPlace = false; showPlace(); }));
    if (!matches.length) results.append(make('p', query ? 'No match yet. Choose “It’s somewhere new” below.' : 'No places listed yet. Choose “It’s somewhere new” below.', 'hint'));
  }
  $('[data-place-search]').addEventListener('input', renderPlaces);
  $('[data-place-new]').addEventListener('click', () => { place = null; newPlace = true; showPlace(); field('venue').focus(); });
  $('[data-place-change]').addEventListener('click', () => { place = null; newPlace = false; showPlace(); renderPlaces(); });

  // 2. When?
  const when = () => String(new FormData(form).get('when') || 'dates');
  function showWhen() { const ongoing = when() === 'ongoing'; $('[data-date-fields]').hidden = ongoing; $('[data-ongoing-note]').hidden = !ongoing; renderPreview(); }
  form.querySelectorAll('input[name="when"]').forEach((radio) => radio.addEventListener('change', showWhen));
  ['start', 'end', 'venue', 'city'].forEach((name) => field(name).addEventListener('input', renderPreview));

  // 3. Which pieces? The first one chosen is featured until the artist stars another.
  const publicWorks = () => ctx.artist().works.filter(isShown);
  async function renderPieces() {
    const picker = $('[data-piece-picker]');
    picker.replaceChildren();
    const works = publicWorks();
    if (!works.length) { picker.append(make('p', 'Add a piece that shows on your page first, in the Artwork tab.', 'hint')); return; }
    for (const work of works) picker.append(await pieceTile(work));
  }
  async function pieceTile(work: MemberWork) {
    const tile = make('div', '', 'piece');
    const selected = chosen.includes(work.id);
    const toggle = make('button', '', 'piece-toggle') as HTMLButtonElement;
    toggle.type = 'button'; toggle.setAttribute('aria-pressed', String(selected));
    const image = document.createElement('img'); image.alt = ''; image.src = await imageUrl(work).catch(() => '');
    toggle.append(image, make('span', work.title));
    toggle.addEventListener('click', () => {
      chosen = chosen.includes(work.id) ? chosen.filter((id) => id !== work.id) : [...chosen, work.id];
      if (!chosen.includes(featured)) featured = chosen[0] ?? '';
      void renderPieces(); renderPreview();
    });
    const star = button('★', () => { if (!chosen.includes(work.id)) chosen = [...chosen, work.id]; featured = work.id; void renderPieces(); renderPreview(); }, 'star');
    star.setAttribute('aria-pressed', String(featured === work.id));
    star.setAttribute('aria-label', `Feature ${work.title} on Showing Now`);
    if (selected) tile.dataset.selected = '';
    tile.append(toggle, star);
    return tile;
  }

  // The live preview uses the same card markup and styles as Showing Now.
  function draft(): Showing | null {
    const ongoing = when() === 'ongoing';
    const venue = place?.name ?? field('venue').value.trim(), city = place?.city ?? field('city').value.trim();
    const start = ongoing ? (editing?.start || localDay()) : field('start').value, end = ongoing ? '' : field('end').value;
    if (!venue || !start || !featured) return null;
    return {
      id: editing?.id ?? crypto.randomUUID(), artistId: ctx.id,
      venueId: place?.id ?? editing?.venueId ?? '', venue, city,
      address: place?.address ?? field('address').value.trim(), website: place?.website ?? (normalizeWebsite(field('website').value.trim()) || ''),
      regionId: place?.regionId || ctx.artist().regionId || 'region-rogue-valley',
      start, end, ongoing, confirmedAt: ongoing ? (editing?.ongoing ? editing.confirmedAt : localDay()) : undefined,
      artworkIds: [...chosen], featuredArtworkId: featured, status: editing?.status ?? 'draft',
    };
  }
  async function renderPreview() {
    const show = draft(), box = $('[data-showing-preview]');
    box.hidden = !show;
    if (!show) return;
    const work = ctx.artist().works.find((item) => item.id === show.featuredArtworkId);
    const card = make('article', '', `showing-card${show.ongoing ? ' ongoing-card' : ''}`);
    const frame = make('div', '', 'artwork-frame'), image = document.createElement('img');
    image.alt = work?.title ?? ''; if (work) image.src = await imageUrl(work).catch(() => '');
    frame.append(image);
    const copy = make('div', '', 'copy'), tag = show.end || show.ongoing ? showingTag(show) : null;
    if (tag) copy.append(make('span', tag.label, `showing-tag tag-${tag.kind}`));
    copy.append(make('h3', ctx.artist().name), make('p', `${show.venue}${show.city ? ` · ${show.city}` : ''}`, 'venue-line'), make('p', show.end || show.ongoing ? shortDates(show) : '', 'dates'));
    card.append(frame, copy);
    $('[data-preview-card]').replaceChildren(card);
  }

  function publishNote() {
    const artist = ctx.artist();
    $('[data-showing-rights]').hidden = Boolean(artist.rightsConfirmedAt) || artist.published;
    $('[data-publish-note]').textContent = !ctx.approved ? 'You can publish now; it goes public once you’re approved.' : artist.published ? '' : 'Publishing this also puts your page online.';
  }
  async function open(show: Showing | null) {
    editing = show; form.reset(); message.textContent = '';
    places = await loadPlaces(ctx.id);
    place = show ? places.find((item) => item.id === show.venueId) ?? {id: show.venueId, name: show.venue, address: show.address, city: show.city, website: show.website, regionId: show.regionId} : null;
    newPlace = false;
    // Pieces the site has hidden drop out of the picker; the next chosen piece takes the star.
    const onView = new Set(publicWorks().map((work) => work.id));
    chosen = show ? show.artworkIds.filter((id) => onView.has(id)) : []; featured = show && onView.has(show.featuredArtworkId) ? show.featuredArtworkId : chosen[0] ?? '';
    form.querySelectorAll<HTMLInputElement>('input[name="when"]').forEach((radio) => radio.checked = radio.value === (show?.ongoing ? 'ongoing' : 'dates'));
    if (show && !show.ongoing) { field('start').value = show.start; field('end').value = show.end; }
    $('[data-showing-form-title]').textContent = show ? `Edit: ${show.venue}` : 'Add a showing';
    form.hidden = false; $('[data-new-showing]').hidden = true; studioForm.hidden = true; syncStudioButton();
    publishNote(); showPlace(); renderPlaces(); showWhen(); await renderPieces(); renderPreview();
    form.scrollIntoView({behavior: 'smooth', block: 'start'});
  }
  function close() { form.hidden = true; editing = null; $('[data-new-showing]').hidden = false; syncStudioButton(); }
  $('[data-new-showing]').addEventListener('click', () => void open(null));
  $('[data-cancel-showing]').addEventListener('click', close);

  function check(show: Showing | null): show is Showing {
    if (!place && !newPlace) { message.textContent = 'Choose the place, or pick “It’s somewhere new.”'; return false; }
    if (newPlace && (!field('venue').value.trim() || !field('address').value.trim() || !field('city').value.trim())) { message.textContent = 'Add the place’s name, street address, and city.'; return false; }
    if (newPlace && normalizeWebsite(field('website').value.trim()) === null) { message.textContent = 'That website address doesn’t look right.'; return false; }
    if (when() === 'dates' && (!field('start').value || !field('end').value)) { message.textContent = 'Add the first and last day, or choose “Ongoing.”'; return false; }
    if (when() === 'dates' && field('end').value < field('start').value) { message.textContent = 'The last day comes before the first day.'; return false; }
    if (!chosen.length || !show) { message.textContent = 'Tap at least one piece that’s hanging there.'; return false; }
    return true;
  }
  function save(status: 'draft' | 'published') {
    const show = draft();
    if (!check(show)) return;
    if (!show.venueId) show.venueId = `new-${show.id}`;
    const artist = ctx.artist();
    const firstPublished = status === 'published' && !mine().some((item) => item.status === 'published');
    let next = artist;
    if (status === 'published' && ctx.approved && !artist.published) {
      if (!ctx.termsOk()) { message.textContent = 'Your page isn’t public yet. Publish it from the “Your page” tab first, where you’ll agree to the Artist Terms.'; return; }
      const confirmed = artist.rightsConfirmedAt || (field('rights').checked ? new Date().toISOString() : '');
      if (!confirmed) { message.textContent = 'Please confirm that you made this work.'; return; }
      next = {...artist, published: true, rightsConfirmedAt: confirmed};
    }
    const saved: Showing = {...show, status};
    try { writeShowing(saved); } catch { message.textContent = 'That didn’t save. Check your connection and try again.'; return; }
    if (next !== artist && !ctx.save(next)) return;
    close(); refresh();
    message.textContent = '';
    $('[data-showings-intro]').textContent = status === 'draft' ? 'Draft saved. Only you can see it.' : !ctx.approved ? 'Saved. It goes public once you’re approved.' : next.published ? 'Published. It’s on Showing Now.' : 'Saved.';
    if (status === 'published') tell(saved);
    if (firstPublished && ctx.artist().venueOpportunities === undefined) $('[data-opportunities]').hidden = false;
  }
  form.addEventListener('submit', (event) => { event.preventDefault(); save('published'); });
  $('[data-save-showing-draft]').addEventListener('click', () => save('draft'));
  document.querySelectorAll<HTMLButtonElement>('[data-opportunities-answer]').forEach((answer) => answer.addEventListener('click', () => {
    if (ctx.save({...ctx.artist(), venueOpportunities: answer.dataset.opportunitiesAnswer === 'yes'})) {
      $('[data-opportunities]').hidden = true;
      $('[data-showings-intro]').textContent = answer.dataset.opportunitiesAnswer === 'yes' ? 'Got it. We’ll let you know when venues are looking.' : 'No problem. You can change that in Profile anytime.';
    }
  }));

  // Studio by appointment: one per artist, the whole portfolio, the artist's own contacts.
  const studioForm = $<HTMLFormElement>('[data-studio-form]'), studioMessage = $('[data-studio-message]');
  const studioField = (name: string) => studioForm.elements.namedItem(name) as HTMLInputElement;
  const newStudio = $<HTMLButtonElement>('[data-new-studio]');
  let editingStudio: Showing | null = null;
  const myStudio = () => mine().find(isStudio);
  const syncStudioButton = () => { newStudio.hidden = Boolean(myStudio()) || !studioForm.hidden || !form.hidden; };
  function openStudio(show: Showing | null) {
    editingStudio = show;
    const artist = ctx.artist();
    studioField('studioName').value = show?.venue ?? `${artist.name}’s studio`;
    studioField('studioCity').value = show?.city ?? artist.city ?? '';
    studioField('studioAddress').value = show?.address ?? '';
    studioField('showAddress').checked = show?.showAddress === true;
    studioField('contactPhone').value = show?.contactPhone ?? '';
    studioField('contactEmail').value = show?.contactEmail ?? '';
    studioField('bookingUrl').value = show?.bookingUrl ?? '';
    $('[data-studio-form-title]').textContent = show ? 'Edit your studio listing' : 'List your studio';
    studioMessage.textContent = '';
    studioForm.hidden = false; form.hidden = true; $('[data-new-showing]').hidden = true; syncStudioButton();
    studioForm.scrollIntoView({behavior: 'smooth', block: 'start'});
  }
  function closeStudio() { studioForm.hidden = true; editingStudio = null; $('[data-new-showing]').hidden = false; syncStudioButton(); }
  newStudio.addEventListener('click', () => openStudio(null));
  $('[data-studio-cancel]').addEventListener('click', closeStudio);
  studioForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = (name: string) => studioField(name).value.trim();
    const onView = ctx.artist().works.filter(isShown);
    let booking = value('bookingUrl');
    if (booking && !/^https?:\/\//i.test(booking)) booking = `https://${booking}`;
    if (!value('studioCity')) { studioMessage.textContent = 'Add the city your studio is in.'; return; }
    if (!value('contactPhone') && !value('contactEmail') && !booking) { studioMessage.textContent = 'Add at least one way to reach you: a phone, an email, or a booking link.'; return; }
    if (value('contactEmail') && !/^\S+@\S+\.\S+$/.test(value('contactEmail'))) { studioMessage.textContent = 'That email address doesn’t look right.'; return; }
    if (booking && !/^https?:\/\/[^\s.]+\.[^\s]+$/i.test(booking)) { studioMessage.textContent = 'That booking link doesn’t look right. Paste the whole web address.'; return; }
    if (studioField('showAddress').checked && !value('studioAddress')) { studioMessage.textContent = 'Add your street address, or uncheck “Show my full address.”'; return; }
    if (!onView.length) { studioMessage.textContent = 'Put at least one piece on your page first, in the Artwork tab. Your studio listing shows your work.'; return; }
    const id = editingStudio?.id ?? `studio-${crypto.randomUUID()}`, today = localDay();
    const studio: Showing = {
      id, artistId: ctx.id, kind: 'studio', venueId: id, venue: value('studioName') || `${ctx.artist().name}’s studio`,
      address: value('studioAddress'), city: value('studioCity'), website: '', regionId: ctx.artist().regionId || 'region-rogue-valley',
      start: editingStudio?.start ?? today, end: '', ongoing: true, confirmedAt: today, showAddress: studioField('showAddress').checked,
      contactPhone: value('contactPhone'), contactEmail: value('contactEmail'), bookingUrl: booking,
      artworkIds: onView.map((work) => work.id), featuredArtworkId: onView[0].id, status: 'published',
    };
    try { writeShowing(studio); } catch { studioMessage.textContent = 'That didn’t save. Check your connection and try again.'; return; }
    closeStudio(); refresh();
    $('[data-showings-intro]').textContent = !ctx.approved ? 'Studio saved. It goes public once you’re approved.' : !ctx.artist().published ? 'Studio saved. It shows up once your page is public; publish it from the “Your page” tab.' : 'Your studio is on Showing Now, under Studios by appointment.';
  });
  syncStudioButton();

  return {render() { renderList(); publishNote(); syncStudioButton(); }, needsAttention: () => mine().some((show) => show.status === 'published' && needsCheckIn(show))};
}
