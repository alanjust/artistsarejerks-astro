// The "Tell people" kit: a ready-made note about a showing that the artist sends
// from their own email or phone, plus a calendar invite. Nothing is sent by the site.
import type {Showing} from './prototype-showings';
import {showingStatus} from './showing-display';

const day = (value: string, options: Intl.DateTimeFormatOptions = {month: 'long', day: 'numeric'}) => new Date(`${value}T12:00:00`).toLocaleDateString('en-US', options);
const place = (show: Showing) => [show.address, show.city].filter(Boolean).join(', ');

export function tellMessage(show: Showing, pageUrl: string) {
  if (show.kind === 'studio') return `My studio${show.city ? ` in ${show.city}` : ''} is open to visitors, by appointment. If you’d like to see the work in person, get in touch and we’ll find a time.\n\nMore about the work, and how to reach me: ${location.origin}/showing/?id=${encodeURIComponent(show.id)}`;
  const where = `${show.venue}${show.city ? ` in ${show.city}` : ''}`;
  const upcoming = showingStatus(show) === 'upcoming';
  const when = show.ongoing
    ? (upcoming ? `Some of my work goes up at ${where} on ${day(show.start)}, and it’ll be there for a while.` : `Some of my work is on the wall at ${where}, and it’ll be there for a while.`)
    : upcoming ? `Some of my work goes up at ${where} on ${day(show.start)} and stays through ${day(show.end)}.` : `Some of my work is up at ${where} through ${day(show.end)}.`;
  return `${when} If you’re nearby, I’d love for you to see it in person.\n\n${place(show)}\n\nMore about the work: ${pageUrl}`;
}
export const tellSubject = (show: Showing) => show.kind === 'studio' ? 'Come visit my studio' : `Come see my work at ${show.venue}`;

// An all-day calendar event (iCalendar), for dated showings.
export function calendarFile(show: Showing, artistName: string, message: string, pageUrl: string) {
  const escape = (text: string) => text.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
  const compact = (value: string) => value.replace(/-/g, '');
  const after = new Date(`${show.end}T12:00:00Z`); after.setUTCDate(after.getUTCDate() + 1);
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Artists Are Jerks//Showing//EN', 'BEGIN:VEVENT',
    `UID:${show.id}@artistsarejerks`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${compact(show.start)}`, `DTEND;VALUE=DATE:${compact(after.toISOString().slice(0, 10))}`,
    `SUMMARY:${escape(`${artistName} at ${show.venue}`)}`, `LOCATION:${escape(place(show))}`, `DESCRIPTION:${escape(message)}`, `URL:${pageUrl}`,
    'END:VEVENT', 'END:VCALENDAR'];
  // The calendar format asks for long lines to be wrapped, continuing with a leading space.
  const fold = (line: string) => line.length <= 73 ? line : line.match(/.{1,73}/gu)!.join('\r\n ');
  return lines.map(fold).join('\r\n') + '\r\n';
}

// A ready-made note the artist can send to a place that isn't on the site yet,
// pointing the owner to the For Venues page.
export function inviteMessage(show: Showing, artistName: string, venuesUrl: string) {
  return `Hi! Thanks for having my work at ${show.venue}.\n\nI’ve listed the showing on Artists Are Jerks, a free guide to local art on real walls around the Rogue Valley. If you’d like ${show.venue} listed there too, with your hours and a Directions button, it’s free and takes about five minutes. This page explains it: ${venuesUrl}\n\nThanks again,\n${artistName}`;
}

type Kit = {heading: string; subject: string; message: string; calendar?: () => Blob; fileName?: string};
function openKit(kit: Kit) {
  const panel = document.querySelector<HTMLElement>('[data-tell-people]');
  if (!panel) return;
  const message = panel.querySelector<HTMLTextAreaElement>('[data-tell-message]')!, status = panel.querySelector('[data-tell-status]')!;
  const email = panel.querySelector<HTMLAnchorElement>('[data-tell-email]')!, text = panel.querySelector<HTMLAnchorElement>('[data-tell-text]')!;
  const share = panel.querySelector<HTMLButtonElement>('[data-tell-share]')!, calendar = panel.querySelector<HTMLButtonElement>('[data-tell-calendar]')!;
  panel.querySelector('[data-tell-heading]')!.textContent = kit.heading;
  message.value = kit.message;
  status.textContent = '';
  const sync = () => {
    email.href = `mailto:?subject=${encodeURIComponent(kit.subject)}&body=${encodeURIComponent(message.value)}`;
    text.href = `sms:?&body=${encodeURIComponent(message.value)}`;
  };
  sync();
  message.oninput = sync;
  share.hidden = typeof navigator.share !== 'function';
  share.onclick = () => { void navigator.share({title: kit.subject, text: message.value}).catch(() => {}); };
  panel.querySelector<HTMLButtonElement>('[data-tell-copy]')!.onclick = async () => {
    try { await navigator.clipboard.writeText(message.value); status.textContent = 'Copied. Paste it anywhere.'; }
    catch { message.select(); status.textContent = 'Select the text above and copy it.'; }
  };
  calendar.hidden = !kit.calendar;
  calendar.onclick = () => {
    if (!kit.calendar) return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(kit.calendar()); link.download = kit.fileName ?? 'showing.ics';
    link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    status.textContent = 'Calendar invite saved. Attach it to an email, or open it to add it to your own calendar.';
  };
  panel.querySelector<HTMLButtonElement>('[data-tell-close]')!.onclick = () => { panel.hidden = true; };
  panel.hidden = false;
  panel.scrollIntoView({behavior: 'smooth', block: 'start'});
}

export function openTellPeople(show: Showing, artistName: string, pageUrl: string) {
  const message = tellMessage(show, pageUrl);
  openKit({
    heading: `Tell people about ${show.venue}`, subject: tellSubject(show), message,
    calendar: show.ongoing ? undefined : () => new Blob([calendarFile(show, artistName, (document.querySelector<HTMLTextAreaElement>('[data-tell-message]')?.value ?? message), pageUrl)], {type: 'text/calendar'}),
    fileName: `${show.venue.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'showing'}.ics`,
  });
}

export function openInviteVenue(show: Showing, artistName: string, venuesUrl: string) {
  openKit({heading: `Invite ${show.venue}`, subject: `${show.venue} on Artists Are Jerks`, message: inviteMessage(show, artistName, venuesUrl)});
}
