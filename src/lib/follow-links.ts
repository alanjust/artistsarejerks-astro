// The confirm and unsubscribe pages people reach from a follower email.
export async function completeFollow(action: 'confirm' | 'unsubscribe') {
  const token = new URLSearchParams(location.search).get('t') ?? '';
  const button = document.querySelector<HTMLButtonElement>('[data-follow-confirm]')!;
  const result = document.querySelector('[data-follow-result]')!;
  const copy = document.querySelector('[data-follow-copy]')!;
  if (!/^[0-9a-f]{48}$/.test(token)) {
    button.hidden = true;
    copy.textContent = 'This link is missing something. Open the most recent email from Artists Are Jerks and try its link again.';
    return;
  }
  button.addEventListener('click', async () => {
    button.disabled = true;
    result.textContent = 'One moment…';
    try {
      const response = await fetch(`/api/community/public/follow/${action}`, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({token})});
      const body = await response.json().catch(() => ({})) as {error?: string; artistName?: string; artistUrl?: string};
      if (!response.ok) throw new Error(body.error || 'That didn’t go through. Please try again.');
      button.hidden = true;
      const artist = body.artistName ?? 'this artist';
      copy.textContent = action === 'confirm'
        ? `You’re on the list. You’ll hear from us when ${artist} has work up somewhere.`
        : `Done. We won’t email you about ${artist} again.`;
      result.replaceChildren();
      if (action === 'confirm' && body.artistUrl) {
        const link = document.createElement('a');
        link.href = body.artistUrl; link.textContent = `See ${artist}’s work →`;
        result.append(link);
      }
    } catch (cause) {
      result.textContent = cause instanceof Error ? cause.message : 'That didn’t go through.';
      button.disabled = false;
    }
  });
}
