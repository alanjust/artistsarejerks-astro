import {getStoredItem,setStoredItem} from './community-storage';
export const ARTIST_APPLICATIONS_KEY='aaj-artist-applications-prototype';
export interface ArtistApplication {id:string;name:string;email:string;regionId?:string;city:string;practice:string;portfolio:string;note:string;status:'pending'|'approved'|'declined';invitationAccepted:boolean;opportunities:boolean;terms?:{version:string;agreedAt:string}}
export function readArtistApplications():ArtistApplication[]{try{const data=JSON.parse(getStoredItem(ARTIST_APPLICATIONS_KEY)||'[]');return Array.isArray(data)?data.filter(a=>a&&typeof a.id==='string'&&typeof a.name==='string'):[]}catch{return []}}
export function saveArtistApplication(application:ArtistApplication){setStoredItem(ARTIST_APPLICATIONS_KEY,JSON.stringify([...readArtistApplications().filter(a=>a.id!==application.id),application]))}
