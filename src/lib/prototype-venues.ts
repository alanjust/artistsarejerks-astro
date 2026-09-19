import {getStoredItem,setStoredItem} from './community-storage';
import pilot from '../data/community-pilot.json';
export const VENUES_KEY='aaj-venues-prototype';
export interface VenueRecord {
  id:string; name:string; type:string; regionId?:string; city:string; address:string; postalCode:string;
  description:string; website:string; phone:string; hours:string; accessibility:string;
  instructions:string; contactName:string; email:string; opportunities:string;
  status:'draft'|'pending'|'approved'|'declined'; visible:boolean; available:boolean;
  memberIds:string[]; campaigns:{kind:string;subject:string;body:string;recipients:string[];createdAt:string}[];
}
export function readVenues():VenueRecord[]{try{const records=JSON.parse(getStoredItem(VENUES_KEY)||'[]');return Array.isArray(records)?records.filter(v=>v&&typeof v.id==='string'&&typeof v.name==='string'):[]}catch{return []}}
export function saveVenue(record:VenueRecord){setStoredItem(VENUES_KEY,JSON.stringify([...readVenues().filter(v=>v.id!==record.id),record]))}
export function availableVenues(){return readVenues().filter(v=>v.status==='approved'&&v.visible)}
export function seedLeo():VenueRecord {
 const venue=pilot.venues[0];return {id:venue.id,name:venue.name,type:venue.type,regionId:'region-rogue-valley',city:venue.city,address:venue.addressLine1,postalCode:venue.postalCode,description:'A fictional Medford brewpub and grill with rotating local artwork.',website:'',phone:'',hours:Object.entries(venue.hours).map(([day,time])=>`${day}: ${time}`).join('\n'),accessibility:'',instructions:'',contactName:'',email:'',opportunities:'We welcome local artists for rotating wall displays.',status:'draft',visible:true,available:true,memberIds:[],campaigns:[]};
}
export function venueProfileUrl(id:string){return id==='venue-leos-brewpub'?'/prototype/venues/leos-brewpub-and-grill/':`/prototype/venues/profile/?venue=${encodeURIComponent(id)}`}

let watchingPublicVisibility=false;
export function applyPublicVenueVisibility(){
 if(!watchingPublicVisibility){watchingPublicVisibility=true;window.addEventListener('storage',event=>{if(event.key===VENUES_KEY)applyPublicVenueVisibility()})}
 const hidden=new Set(readVenues().filter(venue=>!venue.visible).map(venue=>venue.id));
 document.querySelectorAll<HTMLElement>('[data-public-venue]').forEach(element=>{
  element.dataset.adminHidden=String(hidden.has(element.dataset.publicVenue||''));
  element.hidden=element.dataset.adminHidden==='true';
 });
 window.dispatchEvent(new Event('aaj-showings-updated'));
}
