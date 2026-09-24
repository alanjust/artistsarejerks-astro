// The small things on public artwork that keep the site honest: a "Made with AI"
// label, and a "Report this" link that opens a short form for visitors.
import {mountTurnstile} from './turnstile';

const make = (tag: string, text = '', className = '') => { const node = document.createElement(tag); node.textContent = text; if (className) node.className = className; return node; };

export function aiLabel() { return make('span', 'Made with AI', 'aaj-ai-label'); }

const reasons: [string, string][] = [
  ['not-theirs', 'It isn’t the artist’s own work'],
  ['not-art', 'It’s a craft or a product, not art'],
  ['unlabeled-ai', 'It was made with AI but isn’t labeled'],
  ['other', 'Something else'],
];

let dialog: HTMLDialogElement | null = null;
let current = {artistId: '', workId: '', title: ''};
let openedAt = 0;
let check: Awaited<ReturnType<typeof mountTurnstile>> | null = null;

function buildDialog() {
  const box = document.createElement('dialog');
  box.className = 'aaj-dialog';
  box.setAttribute('aria-labelledby', 'aaj-report-title');
  const form = document.createElement('form');
  const heading = make('h2', '', ''); heading.id = 'aaj-report-title';
  const intro = make('p', 'Tell us what’s wrong. A real person reads every report, and nothing about you is shared with the artist.');
  const choices = document.createElement('fieldset');
  choices.append(make('legend', 'What’s the problem?'));
  for (const [value, label] of reasons) {
    const option = make('label', '', 'report-choice');
    const radio = document.createElement('input'); radio.type = 'radio'; radio.name = 'reason'; radio.value = value; radio.required = true;
    option.append(radio, document.createTextNode(label));
    choices.append(option);
  }
  const details = make('label', '', 'report-field');
  const detailsBox = document.createElement('textarea'); detailsBox.name = 'details'; detailsBox.rows = 3; detailsBox.maxLength = 1000;
  details.append(document.createTextNode('Anything else we should know? '), make('small', 'Optional'), detailsBox);
  const email = make('label', '', 'report-field');
  const emailBox = document.createElement('input'); emailBox.type = 'email'; emailBox.name = 'email'; emailBox.maxLength = 254; emailBox.autocomplete = 'email';
  email.append(document.createTextNode('Your email '), make('small', 'Optional, in case we have a question'), emailBox);
  // A field people never see; automated senders fill it in.
  const trap = document.createElement('input'); trap.name = 'website'; trap.tabIndex = -1; trap.autocomplete = 'off'; trap.className = 'report-trap'; trap.setAttribute('aria-hidden', 'true');
  const turnstile = make('div', '', 'report-turnstile');
  const actions = make('div', '', 'report-actions');
  const send = make('button', 'Send report') as HTMLButtonElement; send.type = 'submit';
  const cancel = make('button', 'Cancel') as HTMLButtonElement; cancel.type = 'button';
  cancel.addEventListener('click', () => box.close());
  actions.append(send, cancel);
  const status = make('p', '', 'report-status'); status.setAttribute('role', 'status');
  form.append(heading, intro, choices, details, email, trap, turnstile, actions, status);
  box.append(form);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    send.disabled = true; status.textContent = 'Sending…';
    try {
      const response = await fetch('/api/community/public/report', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({
        artistId: current.artistId, workId: current.workId, reason: data.get('reason'), details: String(data.get('details') ?? '').trim(),
        email: String(data.get('email') ?? '').trim(), website: String(data.get('website') ?? ''), elapsed: Date.now() - openedAt, turnstile: check?.token() ?? '',
      })});
      const result = await response.json().catch(() => ({})) as {error?: string};
      if (!response.ok) throw new Error(result.error || 'That didn’t go through. Please try again.');
      form.reset();
      status.textContent = 'Thanks. We’ll take a look.';
      setTimeout(() => box.close(), 1800);
    } catch (cause) {
      status.textContent = cause instanceof Error ? cause.message : 'That didn’t go through.';
    } finally {
      send.disabled = false; check?.reset();
    }
  });
  document.body.append(box);
  void mountTurnstile(turnstile).then((mounted) => { check = mounted; }).catch(() => { status.textContent = 'The spam check couldn’t load. Reload the page to try again.'; });
  return box;
}

function openReport(artistId: string, workId: string, title: string) {
  dialog ??= buildDialog();
  current = {artistId, workId, title};
  openedAt = Date.now();
  dialog.querySelector('h2')!.textContent = `Report “${title}”`;
  dialog.querySelector('.report-status')!.textContent = '';
  dialog.showModal();
}

export function reportLink(artistId: string, workId: string, title: string) {
  const button = make('button', 'Report this', 'aaj-report-link') as HTMLButtonElement;
  button.type = 'button';
  button.setAttribute('aria-label', `Report “${title}”`);
  button.addEventListener('click', () => openReport(artistId, workId, title));
  return button;
}
