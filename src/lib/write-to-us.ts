// "Write to us": a short note from an artist or venue to the administrator. It's
// emailed with the member as reply-to, so an answer comes straight back by email.
const make = (tag: string, text = '', className = '') => { const node = document.createElement(tag); node.textContent = text; if (className) node.className = className; return node; };

const topics: [string, string][] = [
  ['hidden', 'A piece that was hidden'],
  ['problem', 'Something isn’t working'],
  ['question', 'A question'],
  ['other', 'Something else'],
];

let dialog: HTMLDialogElement | null = null;
let workId = '';

function buildDialog() {
  const box = document.createElement('dialog');
  box.className = 'aaj-dialog';
  box.setAttribute('aria-labelledby', 'aaj-write-title');
  const form = document.createElement('form');
  const heading = make('h2', 'Write to us'); heading.id = 'aaj-write-title';
  const intro = make('p', 'A real person reads every note, usually within a day or two. We’ll answer at the email on your account.');
  const choices = document.createElement('fieldset');
  choices.append(make('legend', 'What’s it about?'));
  for (const [value, label] of topics) {
    const option = make('label', '', 'report-choice');
    const radio = document.createElement('input'); radio.type = 'radio'; radio.name = 'topic'; radio.value = value; radio.required = true;
    option.append(radio, document.createTextNode(label));
    choices.append(option);
  }
  const field = make('label', '', 'report-field');
  const body = document.createElement('textarea'); body.name = 'body'; body.rows = 5; body.maxLength = 4000; body.required = true;
  field.append(document.createTextNode('What’s going on?'), body);
  const actions = make('div', '', 'report-actions');
  const send = make('button', 'Send') as HTMLButtonElement; send.type = 'submit';
  const cancel = make('button', 'Cancel') as HTMLButtonElement; cancel.type = 'button';
  cancel.addEventListener('click', () => box.close());
  actions.append(send, cancel);
  const status = make('p', '', 'report-status'); status.setAttribute('role', 'status');
  const fallback = make('p', 'Or email info@artistsarejerks.com.', 'write-fallback');
  form.append(heading, intro, choices, field, actions, status, fallback);
  box.append(form);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    send.disabled = true; status.textContent = 'Sending…';
    try {
      const response = await fetch('/api/community/notes', {method: 'PUT', headers: {'Content-Type': 'application/json', 'x-aaj-prototype': 'local'}, body: JSON.stringify({topic: data.get('topic'), body: String(data.get('body') ?? '').trim(), workId: data.get('topic') === 'hidden' ? workId : ''})});
      const result = await response.json().catch(() => ({})) as {error?: string};
      if (!response.ok) throw new Error(result.error || 'That didn’t go through. Please try again.');
      form.reset();
      status.textContent = 'Sent. We’ll write back by email.';
      setTimeout(() => box.close(), 2000);
    } catch (cause) {
      status.textContent = cause instanceof Error ? cause.message : 'That didn’t go through.';
    } finally {
      send.disabled = false;
    }
  });
  document.body.append(box);
  return box;
}

// Opens the form, optionally already about one hidden piece.
export function openWriteToUs(about?: {topic: string; workId?: string; text?: string}) {
  dialog ??= buildDialog();
  workId = about?.workId ?? '';
  const form = dialog.querySelector('form')!;
  form.reset();
  dialog.querySelector('.report-status')!.textContent = '';
  if (about?.topic) form.querySelector<HTMLInputElement>(`input[name="topic"][value="${about.topic}"]`)!.checked = true;
  if (about?.text) form.querySelector('textarea')!.value = about.text;
  dialog.showModal();
}

// Wires every [data-write-to-us] button on the page.
export function initWriteToUs(scope: ParentNode = document) {
  scope.querySelectorAll<HTMLElement>('[data-write-to-us]').forEach((button) => button.addEventListener('click', () => openWriteToUs()));
}
