// Show pages and the pieces of the artist page that point to them. Every current
// showing has its own page: where and when, the pieces on that wall, the artist's
// other shows, and then the rest of the artist's work.
import pilot from '../data/community-pilot.json';
import {storageReady} from './community-storage';
import {getMemberArtist, imageUrl, memberUrl} from './member-artists';
import {publicShowings, showUrl, type Showing} from './prototype-showings';
import {readVenues} from './prototype-venues';
import {dates, shortDates, showingStatus, showingTag} from './showing-display';

export type ShowWork = {id: string; title: string; detail: string; image: string};
type ArtistInfo = {id: string; name: string; practice: string; city: string; bio: string; href: string; member: boolean};

const make = (tag: string, text = '', className = '') => { const node = document.createElement(tag); node.textContent = text; if (className) node.className = className; return node; };
const link = (text: string, href: string, className = '') => { const node = make('a', text, className) as HTMLAnchorElement; node.href = href; return node; };
const saleLabels: Record<string, string> = {'contact': 'Contact the artist for price', 'contact-for-price': 'Contact the artist for price', 'private': 'Price shared privately', 'private-price': 'Price shared privately', 'not-for-sale': 'Not for sale', 'sold': 'Sold'};
const priceLabel = (sale: string, price: unknown) => (sale === 'price' || sale === 'public-price') && price ? `$${Number(typeof price === 'object' ? (price as {amount: number}).amount : price).toLocaleString('en-US')}` : saleLabels[sale] ?? '';

export function artistInfo(artistId: string): ArtistInfo | null {
  const fixture = pilot.artists.find((artist) => artist.id === artistId);
  if (fixture) return {id: fixture.id, name: fixture.name, practice: fixture.practice.join(' · '), city: fixture.homeCity, bio: fixture.bio, href: `/prototype/artists/${fixture.slug}/`, member: false};
  const member = getMemberArtist(artistId);
  return member ? {id: member.id, name: member.name, practice: member.practice, city: member.city, bio: member.bio, href: memberUrl(member.id), member: true} : null;
}

// Every public piece by an artist, in the order the artist page shows them.
export async function artistWorks(artistId: string): Promise<ShowWork[]> {
  const member = getMemberArtist(artistId);
  if (member && !pilot.artists.some((artist) => artist.id === artistId)) {
    const works: ShowWork[] = [];
    for (const work of member.works.filter((item) => item.public)) {
      works.push({id: work.id, title: work.title, detail: [work.medium, priceLabel(work.sale, work.price)].filter(Boolean).join(' · '), image: await imageUrl(work).catch(() => '')});
    }
    return works;
  }
  // Sample (pilot) artists, used in local development only.
  return pilot.artworks.filter((work) => work.artistId === artistId && work.profileVisibility === 'public' && work.archiveStatus === 'active')
    .map((work) => ({id: work.id, title: work.title, detail: [work.medium, priceLabel(work.salePresentation, work.publicPrice)].filter(Boolean).join(' · '), image: work.image}));
}

export const artistShows = (artistId: string) => publicShowings().filter((show) => show.artistId === artistId).sort((a, b) => a.start.localeCompare(b.start));

// "Where to see it now" on an artist page: one slim row per show, each opening its show page.
export async function renderArtistShows(root: HTMLElement, artistId: string) {
  await storageReady;
  const shows = artistShows(artistId), works = await artistWorks(artistId);
  root.replaceChildren();
  root.className = 'browser-showings artist-shows';
  root.append(make('h2', 'Where to see it now'));
  if (!shows.length) root.append(make('p', 'Nothing on a wall right now. Sign up below, and you’ll hear when there is.', 'artist-shows-empty'));
  for (const show of shows) {
    const row = link('', showUrl(show.id), 'artist-show-row') as HTMLAnchorElement;
    const tag = showingTag(show);
    if (tag) row.append(make('span', tag.label, `showing-tag tag-${tag.kind}`));
    row.append(make('span', `${show.venue} →`, 'artist-show-venue'), make('span', `${show.city} · ${shortDates(show)}`, 'artist-show-when'));
    const strip = make('span', '', 'artist-show-thumbs');
    for (const id of show.artworkIds.slice(0, 5)) {
      const work = works.find((item) => item.id === id);
      if (!work?.image) continue;
      const image = document.createElement('img'); image.src = work.image; image.alt = ''; image.loading = 'lazy'; strip.append(image);
    }
    row.append(strip);
    root.append(row);
  }
  root.hidden = false;
  tagArtworks(document, artistId);
  window.dispatchEvent(new Event('aaj-showings-updated'));
}

// A gold "On view at…" tag on each piece that is hanging somewhere right now.
export function tagArtworks(scope: ParentNode, artistId: string, skipShowId = '') {
  const placed = new Map<string, Showing>();
  for (const show of artistShows(artistId)) for (const id of show.artworkIds) if (!placed.has(id)) placed.set(id, show);
  scope.querySelectorAll<HTMLElement>('[data-artwork-id]').forEach((card) => {
    card.querySelector('.on-view-tag')?.remove();
    const show = placed.get(card.dataset.artworkId ?? '');
    if (!show || show.id === skipShowId) return;
    const tag = link(`On view at ${show.venue} →`, showUrl(show.id), 'on-view-tag');
    (card.querySelector('.artwork-copy, figcaption, div:last-child') ?? card).prepend(tag);
  });
}

function workFigure(work: ShowWork) {
  const figure = make('figure', '', 'show-piece');
  figure.dataset.artworkId = work.id;
  const frame = make('div', '', 'show-piece-frame');
  if (work.image) { const image = document.createElement('img'); image.src = work.image; image.alt = work.title; image.loading = 'lazy'; frame.append(image); }
  const caption = make('figcaption');
  caption.append(make('span', work.title, 'show-piece-title'));
  if (work.detail) caption.append(make('span', work.detail, 'show-piece-detail'));
  figure.append(frame, caption);
  return figure;
}

// The show page itself, at /showing/?id=…
export async function initShowPage() {
  await storageReady;
  const id = new URLSearchParams(location.search).get('id') ?? '';
  const show = publicShowings().find((item) => item.id === id);
  const artist = show ? artistInfo(show.artistId) : null;
  if (!show || !artist) {
    document.querySelector('[data-show-title]')!.textContent = 'This showing isn’t listed anymore';
    document.querySelector<HTMLElement>('[data-show-missing]')!.hidden = false;
    return;
  }
  const phase = showingStatus(show);
  document.title = `${artist.name} at ${show.venue} | Artists Are Jerks`;
  document.querySelector('[data-show-title]')!.textContent = `${artist.name} at ${show.venue}`;
  document.querySelector('[data-show-eyebrow]')!.textContent = `${phase === 'upcoming' ? 'Coming soon' : show.ongoing ? 'Ongoing' : 'On view now'} · ${show.city}`;

  // Where and when.
  const info = document.querySelector<HTMLElement>('[data-show-info]')!;
  const tag = showingTag(show);
  if (tag) info.append(make('span', tag.label, `showing-tag tag-${tag.kind}`));
  info.append(make('p', show.ongoing ? shortDates(show) : dates(show), 'show-dates'));
  const where = make('p', '', 'show-where'); where.append(make('strong', show.venue), document.createElement('br'), document.createTextNode([show.address, show.city].filter(Boolean).join(', '))); info.append(where);
  const hours = readVenues().find((venue) => venue.id === show.venueId)?.hours;
  if (hours) info.append(make('p', hours, 'show-hours'));
  const actions = make('div', '', 'show-actions');
  actions.append(link('Directions', `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([show.venue, show.address, show.city].filter(Boolean).join(', '))}`, 'show-directions'));
  if (show.website) { const site = link('Their website ↗', show.website, 'show-website'); site.target = '_blank'; site.rel = 'noopener'; actions.append(site); }
  info.append(actions);
  info.hidden = false;

  // On the wall.
  const works = await artistWorks(show.artistId);
  const here = show.artworkIds.map((workId) => works.find((work) => work.id === workId)).filter((work): work is ShowWork => Boolean(work));
  document.querySelector('[data-wall-count]')!.textContent = `${here.length} ${here.length === 1 ? 'piece' : 'pieces'}`;
  document.querySelector('[data-wall]')!.replaceChildren(...here.map(workFigure));
  document.querySelector<HTMLElement>('[data-wall-section]')!.hidden = !here.length;

  // Also on view.
  const others = artistShows(show.artistId).filter((item) => item.id !== show.id);
  const also = document.querySelector<HTMLElement>('[data-also]')!;
  for (const other of others) {
    const row = link('', showUrl(other.id), 'also-row');
    row.append(make('span', 'Also on view', 'also-label'), make('span', `${artist.name} at ${other.venue}, ${other.city} →`, 'also-venue'), make('span', shortDates(other), 'also-when'));
    also.append(row);
  }
  also.hidden = !others.length;

  // More of the artist's work, leaving out what's already on this wall.
  const rest = works.filter((work) => !show.artworkIds.includes(work.id));
  document.querySelector('[data-more-heading]')!.textContent = `More of ${artist.name}’s work`;
  document.querySelector('[data-more]')!.replaceChildren(...rest.map(workFigure));
  document.querySelector<HTMLElement>('[data-more-section]')!.hidden = !rest.length;
  tagArtworks(document.querySelector('[data-more]')!, show.artistId, show.id);

  // About the artist, with a way to get in touch.
  document.querySelector('[data-about-heading]')!.textContent = `About ${artist.name}`;
  document.querySelector('[data-about-bio]')!.textContent = artist.bio || `${artist.practice} · ${artist.city}`;
  const page = document.querySelector<HTMLAnchorElement>('[data-artist-page]')!;
  page.href = artist.href; page.textContent = `${artist.name}’s page →`;
  document.querySelector<HTMLElement>('[data-about]')!.hidden = false;

  if (artist.member) {
    const {wireFollowForm} = await import('./follow-form');
    wireFollowForm(document.querySelector<HTMLElement>('[data-follow-section]')!, artist.id, artist.name, false);
  }
}
