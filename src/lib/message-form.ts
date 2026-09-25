// The visitor-to-artist message form, used on artist pages and on studio pages. It keeps
// the artist's address private: the site emails the artist, and the reply goes straight
// back to the visitor.
import {mountTurnstile} from './turnstile';

type Options = {artistId: string; artistName: string; preview?: boolean; about?: 'studio'};
export function wireMessageForm(section: HTMLElement, {artistId, artistName, preview = false, about}: Options) {
  const form = section.querySelector<HTMLFormElement>('[data-contact-form]');
  if (!form) return;
  section.hidden = false;
  const status = section.querySelector('[data-contact-status]')!;
  const shownAt = Date.now();
  // The spam check loads in the background so it never delays the artwork.
  const checkLoading = preview ? Promise.resolve(null) : mountTurnstile(section.querySelector<HTMLElement>('[data-turnstile]')!).catch(() => null);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (preview) { status.textContent = 'This is a preview. Visitors can send messages once your page is public.'; return; }
    const data = new FormData(form), get = (name: string) => String(data.get(name) || '').trim();
    if (!get('name') || !/^\S+@\S+\.\S+$/.test(get('email')) || !get('message')) { status.textContent = 'Please add your name, a working email, and a message.'; return; }
    const check = await checkLoading;
    if (check?.enabled && !check.token()) { status.textContent = 'One moment. The spam check is still finishing.'; return; }
    const send = form.querySelector<HTMLButtonElement>('button.send')!;
    send.disabled = true; status.textContent = 'Sending…';
    try {
      const response = await fetch('/api/community/public/messages', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({artistId, name: get('name'), email: get('email'), message: get('message'), website: get('website'), elapsed: Date.now() - shownAt, turnstile: check?.token(), ...(about ? {about} : {})})});
      const result = await response.json().catch(() => ({})) as {error?: string};
      if (!response.ok) throw new Error(result.error || 'Your message couldn’t be sent. Please try again.');
      const done = document.createElement('p');
      done.textContent = `Sent. ${artistName} will get your message by email and can write back to you directly.`;
      form.replaceChildren(done);
    } catch (cause) {
      status.textContent = cause instanceof Error ? cause.message : 'Your message couldn’t be sent.';
      send.disabled = false; check?.reset();
    }
  });
}
