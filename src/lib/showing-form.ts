import { readShowings, writeShowing, removeShowing, showingStatus, dates, venueUrl, type Showing } from './prototype-showings';
import pilot from '../data/community-pilot.json';
import {memberUrl} from './member-artists';
import {availableVenues} from './prototype-venues';
export interface ShowingFormData {artist:{id:string;name:string;practice:string[];slug?:string};venue:typeof pilot.venues[number];works:{id:string;title:string;image:string}[]}
export function normalizeShowingDate(value:string):string | null {
  const text=value.trim();
  const iso=/^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(text);
  const local=/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(text);
  if(!iso&&!local)return null;
  const year=Number(iso?iso[1]:local![3]),month=Number(iso?iso[2]:local![1]),day=Number(iso?iso[3]:local![2]);
  const date=new Date(Date.UTC(year,month-1,day));
  if(date.getUTCFullYear()!==year||date.getUTCMonth()!==month-1||date.getUTCDate()!==day)return null;
  return `${String(year).padStart(4,'0')}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}
export function initShowingForm(data?:ShowingFormData) {
  const queriedForm = document.querySelector<HTMLFormElement>('#new-show');
  const payload = document.querySelector('[data-showing-data]');
  if (!queriedForm || (!payload&&!data)) return;
  const form = queriedForm;
  form.noValidate=true;
  const {artist, venue, works} = data || JSON.parse(payload?.textContent || '{}') as ShowingFormData;
  document.querySelectorAll<HTMLAnchorElement>('[data-showing-artist-link]').forEach(a=>a.href=artist.slug?`/prototype/artists/${artist.slug}/`:memberUrl(artist.id));
  const field = (name:string) => form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement;
  const placeRecords = availableVenues();
  const placeSelect = field('venueId') as HTMLSelectElement;
  placeRecords.filter(v=>v.id!==venue.id).forEach(v=>placeSelect.add(new Option(`${v.name} · ${v.city}`,v.id),placeSelect.options.length-1));
  const selectedPlace = () => {const found=placeRecords.find(v=>v.id===placeSelect.value);return found?{id:found.id,name:found.name,addressLine1:found.address,city:found.city,website:found.website}:venue};
  const checks = [...form.querySelectorAll<HTMLInputElement>('[name="works"]')];
  const message = document.querySelector<HTMLElement>('[data-status="new-show"]')!;
  const preview = document.querySelector<HTMLElement>('[data-show-preview]')!;
  const result = document.querySelector<HTMLElement>('[data-publish-result]')!;
  const saved = document.querySelector<HTMLElement>('[data-saved-showings]')!;
  let editingPublished=false;let activeId = '';let candidate:Showing | null = null;
  function placeMode() {
    const fresh = field('venueId').value === 'new';
    document.querySelector<HTMLElement>('[data-new-venue]')!.hidden = !fresh;
    document.querySelector<HTMLElement>('[data-existing-venue]')!.hidden = fresh;
    const place=selectedPlace();document.querySelector('[data-existing-venue]')!.textContent=`${place.addressLine1} · ${place.city}, Oregon`;
    ['venue','address','city','website'].forEach(name=>{field(name).disabled=!fresh});
    (field('venue') as HTMLInputElement).required=fresh;(field('address') as HTMLInputElement).required=fresh;
  }
  function featureOptions() {
    const select = field('featuredArtworkId') as HTMLSelectElement;const previous=select.value;
    select.replaceChildren(new Option('Choose the featured artwork',''));
    checks.filter(c=>c.checked).forEach(c=>{const work=works.find(w=>w.id===c.value)!;select.add(new Option(work.title,work.id))});
    select.value=[...select.options].some(o=>o.value===previous)?previous:'';
    if(select.options.length===2&&!select.value)select.selectedIndex=1;
  }
  function collect():Showing {
    const fresh = field('venueId').value==='new';const place=selectedPlace();
    if(!activeId)activeId=crypto.randomUUID();
    return {id:activeId,artistId:artist.id,venueId:fresh?`new-${activeId}`:place.id,venue:fresh?field('venue').value.trim():place.name,address:fresh?field('address').value.trim():place.addressLine1,city:fresh?field('city').value:place.city,website:fresh?field('website').value.trim():place.website||'',start:normalizeShowingDate(field('start').value)!,end:normalizeShowingDate(field('end').value)!,artworkIds:checks.filter(c=>c.checked).map(c=>c.value),featuredArtworkId:field('featuredArtworkId').value,status:'draft'};
  }
  function validate():boolean {
    const start=normalizeShowingDate(field('start').value),end=normalizeShowingDate(field('end').value);
    (field('start') as HTMLInputElement).setCustomValidity(start?'':'Enter a valid first day, such as 10/28/2026.');
    (field('end') as HTMLInputElement).setCustomValidity(!end?'Enter a valid last day, such as 11/17/2026.':start&&end<start?'The last day must be on or after the first day.':'');
    const featured = field('featuredArtworkId') as HTMLSelectElement;
    featured.setCustomValidity(checks.some(c=>c.checked)?'':'Select at least one artwork for this showing.');
    if(!form.reportValidity())return false;
    if(field('venueId').value==='new' && (!field('venue').value.trim()||!field('address').value.trim())){message.textContent='Enter a venue name and street address.';return false;}
    const website = field('website').value;
    if(!field('website').disabled && website && !/^https?:\/\//i.test(website)){message.textContent='Use a website address beginning with https:// or http://.';return false;}
    return true;
  }
  function persist(show:Showing) {try{writeShowing(show);return true}catch{message.textContent='This browser could not save the showing. Allow local storage and try again.';return false}}
  function edit(show:Showing) {
    activeId=show.id;editingPublished=show.status==='published';candidate=null;form.reset();
    field('venueId').value=[...placeSelect.options].some(o=>o.value===show.venueId)?show.venueId:'new';
    ['venue','address','city','website','start','end'].forEach(name=>field(name).value=show[name as keyof Showing] as string);
    checks.forEach(c=>c.checked=show.artworkIds.includes(c.value));featureOptions();field('featuredArtworkId').value=show.featuredArtworkId;placeMode();
    form.hidden=false;preview.hidden=true;result.hidden=true;
    document.querySelector<HTMLDetailsElement>('[data-new-show]')!.open=true;form.scrollIntoView({block:'start',behavior:'smooth'});message.textContent=editingPublished?'Editing your existing showing. Preview and publish to update its public listing.':'Editing a draft. Preview before publishing.';
  }
  function list() {
    saved.replaceChildren();
    readShowings().filter(s=>s.artistId===artist.id).forEach(show=>{
      const item=document.createElement('article'),title=document.createElement('h3'),detail=document.createElement('p'),button=document.createElement('button');
      title.textContent=show.venue;detail.textContent=`${dates(show)} · ${show.status==='draft'?'Draft':showingStatus(show)==='expired'?'Ended':showingStatus(show)==='upcoming'?'Upcoming':'Showing now'}`;
      button.type='button';button.className='button primary';button.textContent=show.status==='draft'?'Edit draft':'Edit showing';button.addEventListener('click',()=>edit(show));
      item.append(title,detail,button);
      if(show.status==='published'){const retract=document.createElement('button');retract.className='button';retract.type='button';retract.textContent='Take listing offline';retract.addEventListener('click',()=>{if(persist({...show,status:'draft'})){list();message.textContent='Listing is offline. You can edit and publish it again.'}});item.append(retract)}
      const remove=document.createElement('button');remove.className='button';remove.type='button';remove.textContent='Delete';remove.addEventListener('click',()=>{removeShowing(show.id);if(activeId===show.id){activeId='';form.reset();placeMode();featureOptions()}list();message.textContent='Showing deleted from this browser.'});item.append(remove);
      saved.append(item);
    });
  }
  field('venueId').addEventListener('change',placeMode);checks.forEach(c=>c.addEventListener('change',()=>{featureOptions();(field('featuredArtworkId') as HTMLSelectElement).setCustomValidity('')}));
  form.addEventListener('input',()=>{(field('start') as HTMLInputElement).setCustomValidity('');(field('end') as HTMLInputElement).setCustomValidity('');message.textContent=''});
  form.addEventListener('submit',e=>{
    e.preventDefault();if(!validate())return;candidate=collect();if(!editingPublished&&!persist(candidate))return;list();
    const work=works.find(w=>w.id===candidate!.featuredArtworkId)!;
    const image=document.querySelector<HTMLImageElement>('[data-preview-image]')!;image.src=work.image;image.alt=work.title;
    const text=(selector:string,value:string)=>{document.querySelector(selector)!.textContent=value};
    text('[data-preview-city]',`${candidate.city} · ${artist.practice.join(' / ')}`);text('[data-preview-dates]',`${showingStatus(candidate)==='expired'?'Ended':showingStatus(candidate)==='upcoming'?'Coming soon':'Showing now'} · ${dates(candidate)}`);
    text('[data-preview-place]',`${candidate.venue} · ${candidate.address}`);text('[data-preview-works]',`At this showing: ${works.filter(w=>candidate!.artworkIds.includes(w.id)).map(w=>w.title).join(', ')}`);
    form.hidden=true;result.hidden=true;preview.hidden=false;preview.scrollIntoView({block:'start',behavior:'smooth'});
  });
  document.querySelector('[data-save-draft]')?.addEventListener('click',()=>{if(!validate())return;const draft=collect();if(editingPublished)draft.id=crypto.randomUUID();if(persist(draft)){list();message.textContent=editingPublished?'Saved as a separate draft. Your published showing remains unchanged.':'Draft saved. It is not visible on the public previews.'}});
  document.querySelector('[data-edit-preview]')?.addEventListener('click',()=>{form.hidden=false;preview.hidden=true;candidate=null});
  document.querySelector('[data-publish-show]')?.addEventListener('click',()=>{if(!candidate)return;const published:Showing={...candidate,status:'published'};if(!persist(published))return;document.querySelector<HTMLAnchorElement>('[data-published-venue]')!.href=venueUrl(published);preview.hidden=true;result.hidden=false;list();activeId='';editingPublished=false;candidate=null});
  document.querySelector('[data-create-another]')?.addEventListener('click',()=>{activeId='';editingPublished=false;candidate=null;form.reset();featureOptions();placeMode();form.hidden=false;preview.hidden=true;result.hidden=true;message.textContent=''});
  placeMode();featureOptions();list();if(readShowings().some(s=>s.artistId===artist.id)){document.querySelector<HTMLDetailsElement>('[data-new-show]')!.open=false}
}
