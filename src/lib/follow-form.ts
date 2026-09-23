// "Get an email when [artist] shows next": the sign-up used on artist and show pages.
// It is double opt-in; the confirming step happens from the email.
import {mountTurnstile} from './turnstile';

export function wireFollowForm(section: HTMLElement, artistId: string, artistName: string, preview: boolean) {
  const form = section.querySelector<HTMLFormElement>('[data-follow-form]');
  if (!form) return;
  section.hidden = false;
  section.querySelector('[data-follow-heading]')!.textContent = `Get an email when ${artistName} shows next`;
  section.querySelector('[data-follow-note]')!.textContent = `One short email each time there’s new work on a wall somewhere. ${artistName} will see your email address, and you can stop anytime.`;
  const shown = Date.now(), status = section.querySelector('[data-follow-status]')!;
  const checkLoading = preview ? Promise.resolve(null) : mountTurnstile(section.querySelector<HTMLElement>('[data-follow-turnstile]')!).catch(() => null);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (preview) { status.textContent = 'This is a preview. Visitors can sign up once your page is public.'; return; }
    const data = new FormData(form), email = String(data.get('email') || '').trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) { status.textContent = 'Please enter a working email address.'; return; }
    const check = await checkLoading;
    if (check?.enabled && !check.token()) { status.textContent = 'One moment. The spam check is still finishing.'; return; }
    const button = form.querySelector<HTMLButtonElement>('button.send')!;
    button.disabled = true; status.textContent = 'Signing you up…';
    try {
      const response = await fetch('/api/community/public/follow', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({artistId, email, website: String(data.get('website') || ''), elapsed: Date.now() - shown, turnstile: check?.token()})});
      const result = await response.json().catch(() => ({})) as {error?: string};
      if (!response.ok) throw new Error(result.error || 'That didn’t go through. Please try again.');
      const done = document.createElement('p');
      done.textContent = 'Almost done. Check your email for a message from Artists Are Jerks, and press the button in it to confirm.';
      form.replaceChildren(done);
    } catch (cause) {
      status.textContent = cause instanceof Error ? cause.message : 'That didn’t go through.';
      button.disabled = false; check?.reset();
    }
  });
}
