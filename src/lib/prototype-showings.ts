import {getStoredItem,setStoredItem,publicStorageMode} from './community-storage';
import pilot from '../data/community-pilot.json';
import {getMemberArtist,imageUrl,memberUrl} from './member-artists';
import {readVenues,venueProfileUrl} from './prototype-venues';
export const SHOWINGS_KEY = 'aaj-showings-prototype';
export interface Showing {
  id: string; artistId: string; venueId: string; venue: string; address: string;
  city: string; website: string; start: string; end: string; artworkIds: string[];
  featuredArtworkId: string; status: 'draft' | 'published';
}
function alanUploads(){try{const value=JSON.parse(getStoredItem('aaj-artist-workspace-prototype')||'{}');return Array.isArray(value.uploadedWorks)?value.uploadedWorks:[]}catch{return []}}
export function readShowings(): Showing[] {
  try {
    const data = JSON.parse(getStoredItem(SHOWINGS_KEY) || '[]');
    return Array.isArray(data) ? data.filter((s) => s && typeof s.id === 'string' && typeof s.start === 'string' && typeof s.end === 'string' && typeof s.venue === 'string' && Array.isArray(s.artworkIds) && ((pilot.artists.some(a => a.id === s.artistId) && pilot.artworks.some(a => a.id === s.featuredArtworkId&&a.artistId===s.artistId)) || getMemberArtist(s.artistId)?.works.some(w=>w.id===s.featuredArtworkId))) : [];
  } catch { return []; }
}
export function removeShowing(id: string) {
  setStoredItem(SHOWINGS_KEY, JSON.stringify(readShowings().filter(s => s.id !== id)));
}
export function writeShowing(show: Showing) {
  const records = readShowings();
  setStoredItem(SHOWINGS_KEY, JSON.stringify([...records.filter(s => s.id !== show.id), show]));
}
export function showingStatus(show: Pick<Showing, 'start' | 'end'>, today?: string) {
  // Construct a local calendar date explicitly; avoid locale-dependent formatting.
  const now = new Date();
  const localDay = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const day = today && /^\d{4}-\d{2}-\d{2}$/.test(today) ? today : localDay;
  return day < show.start ? 'upcoming' : day > show.end ? 'expired' : 'showing-now';
}
export function dates(show: Pick<Showing, 'start' | 'end'>) {
  const label = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString('en-US', {month:'short', day:'numeric',year:'numeric'});
  return `${label(show.start)}–${label(show.end)}`;
}
export function venueUrl(show: Showing) {
  if(readVenues().some(v=>v.id===show.venueId&&v.status==='approved'&&v.visible))return venueProfileUrl(show.venueId);
  return show.venueId === 'venue-leos-brewpub' ? '/prototype/venues/leos-brewpub-and-grill/' : `/prototype/venues/preview/?show=${encodeURIComponent(show.id)}`;
}
export async function renderShowings(root: HTMLElement) {
  const context = root.dataset.context;
  const records = readShowings().filter(s => s.status === 'published' && showingStatus(s) !== 'expired' && !readVenues().some(v=>v.id===s.venueId&&!v.visible) && (pilot.artists.some(a=>a.id===s.artistId)||Boolean(getMemberArtist(s.artistId)?.published && getMemberArtist(s.artistId)?.works.some(w=>w.id===s.featuredArtworkId&&w.public))));
  const matches = records.filter(s => context === 'artist' ? s.artistId === root.dataset.artist : context === 'venue' ? s.venueId === root.dataset.venue : context === 'venue-preview' ? s.id === new URLSearchParams(location.search).get('show') : true);
  root.querySelectorAll('[data-browser-show]').forEach(node => node.remove());
  document.querySelectorAll('.showing-grid [data-browser-show],.coming-grid [data-browser-show]').forEach(node => node.remove());
  const create = (tag: string, text = '', className = '') => {const node = document.createElement(tag);node.textContent = text;node.className = className;return node;};
  const link = (text: string, href: string, className = '') => {const node = create('a',text,className) as HTMLAnchorElement;node.href = href;return node;};
  for(const show of matches) {
    const member=getMemberArtist(show.artistId);
    const artist = pilot.artists.find(a => a.id === show.artistId) || (member ? {id:member.id,name:member.name,practice:member.practice.split(',').map(s=>s.trim()),slug:''}:null);
    const memberWork=member?.works.find(w=>w.id===show.featuredArtworkId&&w.public);
    let artwork=pilot.artworks.find(a => a.id === show.featuredArtworkId) as {image:string;title:string}|undefined;
    const alanWork=show.artistId==='artist-alan-just'?alanUploads().find((w:any)=>w.id===show.featuredArtworkId&&w.visibility==='public'):null;
    if(alanWork)artwork={image:alanWork.sampleImage||`/api/community/${publicStorageMode()?'public/':''}images/${encodeURIComponent(alanWork.imageKey)}`,title:alanWork.title};
    if(memberWork){try{artwork={image:await imageUrl(memberWork),title:memberWork.title}}catch{continue}}
    if(!artist||!artwork)continue;
    const artistHref=member?memberUrl(member.id):`/prototype/artists/${artist.slug}/`;

    const upcoming = showingStatus(show) === 'upcoming';
    if(context==='artist'&&member){
      const callout=create('section','',`show-callout${upcoming?' upcoming':''}`);callout.dataset.browserShow=show.id;
      const info=create('div');info.append(create('p',upcoming?'Coming soon':'Showing now','eyebrow'),create('h2',show.venue),create('p',`${dates(show)} · ${show.city}, Oregon`));
      callout.append(info,link('Map & info',venueUrl(show)));root.append(callout);continue;
    }
    const card = create('article', '', context === 'directory' ? `showing-card${upcoming ? ' coming-card' : ''}` : 'browser-showing');
    card.dataset.browserShow = show.id;card.dataset.city = show.city;
    card.dataset.search = `${artist.name} ${show.venue} ${artist.practice.join(' ')} ${show.city}`.toLowerCase();
    const frame = create('div','','artwork-frame');const image = document.createElement('img');image.src=artwork.image;image.alt=artwork.title;image.loading='lazy';frame.append(image);
    const copy = create('div','','copy');const heading = create('h3');heading.append(link(artist.name,artistHref));
    copy.append(create('p',`${show.city} · ${artist.practice.join(' / ')}`,'city-label'),heading,create('p',`${upcoming ? 'Coming soon' : 'Showing now'} · ${dates(show)}`,'dates'));
    const place = create('p');place.append(link(show.venue,venueUrl(show),'venue-name'));
    copy.append(place,link('Artist, artwork & visit details →',artistHref,'card-link'));card.append(frame,copy);
    const destination = context === 'directory' ? document.querySelector(upcoming ? '.coming-grid' : '.showing-grid') : root;
    destination?.append(card);
    if(context==='artist') {
      const gallery=create('div','','browser-showing-artworks');gallery.dataset.browserShow=show.id;
      for(const id of show.artworkIds){
        const fixture=pilot.artworks.find(w=>w.id===id&&w.artistId===artist.id);
        const alanFixture=show.artistId==='artist-alan-just'?alanUploads().find((w:any)=>w.id===id&&w.visibility==='public'):null;
        const ownWork=member?.works.find(w=>w.id===id&&w.public);
        let source=fixture?.image||alanFixture?.sampleImage||(alanFixture?.imageKey?`/api/community/${publicStorageMode()?'public/':''}images/${encodeURIComponent(alanFixture.imageKey)}`:''),title=fixture?.title||alanFixture?.title||'';
        if(ownWork){try{source=await imageUrl(ownWork);title=ownWork.title}catch{continue}}
        if(!source)continue;
        const figure=create('figure'),img=document.createElement('img');img.src=source;img.alt=title;img.loading='lazy';figure.append(img,create('figcaption',title));gallery.append(figure);
      }
      root.append(gallery);
    }
  }
  root.hidden = context === 'directory' || !matches.length;
  if(context==='directory'){
    const coming=document.querySelector<HTMLElement>('.coming-section');
    if(coming)coming.hidden=!coming.querySelector('.showing-card');
  }
  if (context === 'venue-preview') {
    const show = matches[0];
    const heading = document.querySelector('[data-preview-venue-title]');if(heading)heading.textContent = show?.venue || 'Venue preview unavailable';
    const details = document.querySelector('[data-preview-venue-info]');
    if(details && show){details.replaceChildren(create('p',`${show.address}, ${show.city}, Oregon`));if(show.website)details.append(link('Venue website ↗',show.website));details.append(create('p','A real map and hours can be added when this venue joins.'));}
    const notice = document.querySelector<HTMLElement>('[data-venue-missing]');if(notice)notice.hidden=Boolean(show);
  }
  window.dispatchEvent(new Event('aaj-showings-updated'));
}
