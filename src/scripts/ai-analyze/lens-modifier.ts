import { state } from './state';

interface LensEntry {
  id: string;
  name: string;
  category: string;
  thinker: string;
  tagline: string;
  prompt: string;
}

interface LensCategory {
  id: string;
  name: string;
}

export function initLensModifier() {
  const lensDataEl = document.getElementById('lensesData');
  if (!lensDataEl) return;

  let categories: LensCategory[] = [];
  let lenses: LensEntry[] = [];
  try {
    const parsed = JSON.parse(lensDataEl.textContent || '{}');
    categories = parsed.categories || [];
    lenses = parsed.lenses || [];
  } catch {
    return;
  }

  const select = document.getElementById('lensSelect') as HTMLSelectElement | null;
  const applyBtn = document.getElementById('applyLensBtn') as HTMLButtonElement | null;
  const loadingEl = document.getElementById('lensLoading');
  const historyEl = document.getElementById('interrogationHistory');
  const intentSection = document.getElementById('lensIntentSection');
  const intentField = document.getElementById('lensIntent') as HTMLTextAreaElement | null;

  if (!select || !applyBtn) return;

  // Build grouped dropdown options
  categories.forEach(cat => {
    const group = document.createElement('optgroup');
    group.label = cat.name;
    lenses
      .filter(l => l.category === cat.id)
      .forEach(lens => {
        const opt = document.createElement('option');
        opt.value = lens.id;
        opt.textContent = lens.name;
        group.appendChild(opt);
      });
    select.appendChild(group);
  });

  function requiresIntent(lens: LensEntry | undefined): boolean {
    return !!lens && lens.prompt.includes('[STATED_INTENT]');
  }

  function updateApplyBtn() {
    const lens = lenses.find(l => l.id === select!.value);
    if (!select!.value) {
      applyBtn!.disabled = true;
      return;
    }
    if (requiresIntent(lens)) {
      applyBtn!.disabled = !intentField?.value.trim();
    } else {
      applyBtn!.disabled = false;
    }
  }

  select.addEventListener('change', () => {
    const lens = lenses.find(l => l.id === select.value);
    if (intentSection) {
      intentSection.style.display = requiresIntent(lens) ? 'flex' : 'none';
    }
    if (intentField) intentField.value = '';
    updateApplyBtn();
  });

  intentField?.addEventListener('input', updateApplyBtn);

  applyBtn.addEventListener('click', async () => {
    const selectedId = select.value;
    if (!selectedId || !state.uploadedImageData) return;

    const lens = lenses.find(l => l.id === selectedId);
    if (!lens) return;

    // Inject stated intent if this lens requires it
    let promptText = lens.prompt;
    if (requiresIntent(lens)) {
      const intent = intentField?.value.trim() || '';
      if (!intent) return;
      promptText = promptText.replace('[STATED_INTENT]', intent);
    }

    applyBtn.disabled = true;
    select.disabled = true;
    if (intentField) intentField.disabled = true;
    if (loadingEl) loadingEl.style.display = 'flex';

    try {
      const response = await fetch('/api/analyze-artwork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: state.uploadedImageData,
          fields: state.fields,
          promptText,
          interrogationMode: false,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(`Lens analysis failed: ${result.details || result.error}`);
        return;
      }

      const outputIndex = state.outputs.length;
      state.outputs.push({ raw: result.raw || '', html: result.analysis });

      appendLensTurn(lens, result.analysis, outputIndex, historyEl);

    } catch (error) {
      console.error('Lens modifier error:', error);
      alert('Lens analysis failed. Please try again.');
    } finally {
      select.disabled = false;
      select.value = '';
      if (intentField) { intentField.disabled = false; intentField.value = ''; }
      if (intentSection) intentSection.style.display = 'none';
      if (loadingEl) loadingEl.style.display = 'none';
      updateApplyBtn();
    }
  });
}

export function showLensModifier() {
  const section = document.getElementById('lensModifierSection');
  if (section) section.style.display = 'block';
}

export function resetLensModifier() {
  const section = document.getElementById('lensModifierSection');
  const select = document.getElementById('lensSelect') as HTMLSelectElement | null;
  const applyBtn = document.getElementById('applyLensBtn') as HTMLButtonElement | null;
  const loadingEl = document.getElementById('lensLoading');
  const intentSection = document.getElementById('lensIntentSection');
  const intentField = document.getElementById('lensIntent') as HTMLTextAreaElement | null;

  if (section) section.style.display = 'none';
  if (select) { select.value = ''; select.disabled = false; }
  if (applyBtn) applyBtn.disabled = true;
  if (loadingEl) loadingEl.style.display = 'none';
  if (intentSection) intentSection.style.display = 'none';
  if (intentField) { intentField.value = ''; intentField.disabled = false; }
}

function appendLensTurn(
  lens: LensEntry,
  answerHTML: string,
  outputIndex: number,
  container: HTMLElement | null
) {
  if (!container) return;

  const copyBtnId = `copyLens_${outputIndex}`;

  const turn = document.createElement('div');
  turn.className = 'hg-interrogation-turn hg-lens-turn';
  turn.innerHTML = `
    <div class="hg-lens-turn-header">
      <span class="hg-lens-turn-label">Lens Applied</span>
      <span class="hg-lens-turn-name">${lens.name}</span>
      <span class="hg-lens-turn-thinker">${lens.thinker}</span>
    </div>
    <div class="hg-interrogation-answer">
      <div class="hg-interrogation-answer-content">${answerHTML}</div>
      <div class="hg-copy-row">
        <button class="hg-btn hg-btn--copy" id="${copyBtnId}">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          Copy
        </button>
      </div>
    </div>
  `;

  container.appendChild(turn);
  turn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  // Wire copy button
  const btn = document.getElementById(copyBtnId) as HTMLButtonElement | null;
  if (!btn) return;

  btn.addEventListener('click', async () => {
    const output = state.outputs[outputIndex];
    if (!output?.raw) return;

    const iconHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
      Copy
    `;

    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([`<meta charset="utf-8">${output.html}`], { type: 'text/html' }),
          'text/plain': new Blob([output.raw], { type: 'text/plain' }),
        }),
      ]);
      btn.textContent = '✓ Copied';
      btn.classList.add('copied');
      setTimeout(() => { btn.classList.remove('copied'); btn.innerHTML = iconHTML; }, 2500);
    } catch {
      try {
        await navigator.clipboard.writeText(output.raw);
        btn.textContent = '✓ Copied';
        btn.classList.add('copied');
        setTimeout(() => { btn.classList.remove('copied'); btn.innerHTML = iconHTML; }, 2500);
      } catch {
        alert('Copy failed — please select and copy manually.');
      }
    }
  });
}
