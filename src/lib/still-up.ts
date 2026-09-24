// The answer page for an emailed "Still up?" reminder about an ongoing showing.
type Reply = {error?: string; venue?: string; city?: string; artistName?: string; workspaceUrl?: string; settled?: boolean; answer?: string};
async function ask(token: string, answer?: string): Promise<Reply> {
  const response = await fetch('/api/community/public/still-up', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(answer ? {token, answer} : {token})});
  const body = await response.json().catch(() => ({})) as Reply;
  if (!response.ok) throw new Error(body.error || 'That didn’t go through. Please try again.');
  return body;
}
export async function initStillUp() {
  const token = new URLSearchParams(location.search).get('t') ?? '';
  const title = document.querySelector('[data-still-title]')!, copy = document.querySelector('[data-still-copy]')!;
  const actions = document.querySelector<HTMLElement>('[data-still-actions]')!, result = document.querySelector('[data-still-result]')!;
  const workspaceLink = (reply: Reply) => { if (!reply.workspaceUrl) return; const link = document.createElement('a'); link.href = reply.workspaceUrl; link.textContent = 'Open your showings →'; result.replaceChildren(link); };
  if (!/^[0-9a-f]{48}$/.test(token)) { copy.textContent = 'This link is missing something. Open the most recent “Still up?” email and try its link again.'; return; }
  try {
    const info = await ask(token);
    const where = [info.venue, info.city].filter(Boolean).join(', ');
    title.textContent = `Is your work still up at ${info.venue || 'this place'}?`;
    if (info.settled) { copy.textContent = `You’re all set. Your showing at ${where} is up to date.`; workspaceLink(info); return; }
    copy.textContent = `Your ongoing showing at ${where} stays on Showing Now as long as it’s still hanging. Just let us know.`;
    actions.hidden = false;
    actions.querySelectorAll<HTMLButtonElement>('[data-still-answer]').forEach((button) => button.addEventListener('click', async () => {
      actions.querySelectorAll('button').forEach((each) => each.disabled = true);
      result.textContent = 'One moment…';
      try {
        const reply = await ask(token, button.dataset.stillAnswer);
        actions.hidden = true;
        copy.textContent = reply.answer === 'down'
          ? `Thanks for letting us know. The showing at ${where} is off Showing Now, and it stays in your workspace as a past showing.`
          : `Thanks. Your showing at ${where} stays on Showing Now. We’ll check in again in a couple of months.`;
        workspaceLink(reply);
      } catch (cause) {
        result.textContent = cause instanceof Error ? cause.message : 'That didn’t go through.';
        actions.querySelectorAll('button').forEach((each) => each.disabled = false);
      }
    }));
  } catch (cause) {
    copy.textContent = cause instanceof Error ? cause.message : 'That link didn’t work.';
  }
}
