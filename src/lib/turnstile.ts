// Cloudflare Turnstile, the spam check on artist message forms. The site key is
// public by design; the matching secret lives only on the storage service.
// Local development has no key and no secret, so the check is skipped there.
export const TURNSTILE_SITE_KEY = import.meta.env.MODE === 'online-test' ? '0x4AAAAAAFAI946rzic0nhjk' : '';
type Turnstile = {render(element: HTMLElement, options: Record<string, unknown>): string; reset(id?: string): void};
let loading: Promise<Turnstile> | null = null;
function load(): Promise<Turnstile> {
  loading ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onload = () => resolve((window as unknown as {turnstile: Turnstile}).turnstile);
    script.onerror = () => reject(new Error('The spam check couldn’t load.'));
    document.head.append(script);
  });
  return loading;
}
// Renders the check into `element` and returns a way to read and reset its token.
export async function mountTurnstile(element: HTMLElement) {
  let token = '';
  if (!TURNSTILE_SITE_KEY) return {token: () => 'not-configured', reset() {}, enabled: false};
  const turnstile = await load();
  const id = turnstile.render(element, {sitekey: TURNSTILE_SITE_KEY, callback: (value: string) => { token = value; }, 'expired-callback': () => { token = ''; }, 'error-callback': () => { token = ''; }});
  return {token: () => token, reset() { token = ''; turnstile.reset(id); }, enabled: true};
}
