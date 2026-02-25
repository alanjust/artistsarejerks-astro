import { state } from './state';
import { showFeedbackWidget, resetFeedbackWidget } from './feedback';
import { showLensModifier, resetLensModifier } from './lens-modifier';

// Types matching analysisModes.js structure
interface SubMode {
  id: string;
  label: string;
  description?: string;
}

interface Field {
  id: string;
  label: string;
}

interface Prompt {
  id: string;
  label: string;
  description: string;
  prompt: string;
}

interface AnalysisMode {
  id: string;
  label: string;
  description: string;
  subModes: SubMode[];
  fields: Field[];
  prompts: Prompt[];
}

// ── Page initialisation ────────────────────────────────────────────────────
// Reads URL params, resolves mode/prompt data, renders dynamic fields and header.

export function initPage() {
  const modesDataEl = document.getElementById('analysisModesData');
  if (!modesDataEl) return;

  let modes: AnalysisMode[] = [];
  try {
    modes = JSON.parse(modesDataEl.textContent || '[]');
  } catch {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const modeId = params.get('mode') || '';
  const promptId = params.get('prompt') || '';
  const submodeId = params.get('submode') || '';

  const mode = modes.find(m => m.id === modeId);
  const prompt = mode?.prompts.find(p => p.id === promptId);
  const submode = mode?.subModes.find(s => s.id === submodeId);

  // Store in shared state
  state.modeId = modeId;
  state.promptId = promptId;
  state.submodeId = submodeId;
  state.promptText = prompt?.prompt || '';

  if (mode && prompt) {
    // Populate context header
    const headerEl = document.getElementById('analyzeHeader');
    const fallbackHeaderEl = document.getElementById('fallbackHeader');
    const modeNameEl = document.getElementById('analyzeModeName');
    const promptNameEl = document.getElementById('analyzePromptName');
    const submodeLabelEl = document.getElementById('analyzeSubmodeName');
    const backLinkEl = document.getElementById('backToModeLink') as HTMLAnchorElement | null;

    if (headerEl) headerEl.style.display = 'block';
    if (fallbackHeaderEl) fallbackHeaderEl.style.display = 'none';
    if (modeNameEl) modeNameEl.textContent = mode.label;
    if (promptNameEl) promptNameEl.textContent = prompt.label;

    if (submode && submodeLabelEl) {
      submodeLabelEl.textContent = `Sub-mode: ${submode.label}`;
      submodeLabelEl.style.display = 'block';
    }

    if (backLinkEl) {
      backLinkEl.href = `/hidden-grammar/modes/${modeId}`;
    }

    // Breadcrumb
    const breadcrumbModeEl = document.getElementById('breadcrumbMode');
    const breadcrumbSep2El = document.getElementById('breadcrumbSep2');
    const breadcrumbPromptEl = document.getElementById('breadcrumbPrompt');

    if (breadcrumbModeEl) breadcrumbModeEl.textContent = mode.label;
    if (breadcrumbSep2El) breadcrumbSep2El.style.display = '';
    if (breadcrumbPromptEl) {
      breadcrumbPromptEl.textContent = prompt.label;
      breadcrumbPromptEl.style.display = '';
    }

    // Render dynamic fields
    renderDynamicFields(mode.fields);

    // Hide fallback fields
    const fallbackFieldsSection = document.getElementById('fallbackFieldsSection');
    if (fallbackFieldsSection) fallbackFieldsSection.style.display = 'none';

  } else {
    // No URL params — show fallback header and fallback fields
    const breadcrumbModeEl = document.getElementById('breadcrumbMode');
    if (breadcrumbModeEl) breadcrumbModeEl.textContent = 'Open Analysis';

    // Relabel "Additional Context" → "Custom Prompt" in free-form mode
    const titleEl = document.getElementById('additionalContextTitle');
    const hintEl = document.getElementById('additionalContextHint');
    const textareaEl = document.getElementById('additionalContext') as HTMLTextAreaElement | null;

    if (titleEl) titleEl.innerHTML = 'Custom Prompt';
    if (hintEl) hintEl.textContent = 'Write your own question or instruction for the AI. This is your prompt — ask anything you want about the uploaded image.';
    if (textareaEl) textareaEl.placeholder = 'e.g. What is the primary compositional strategy in this work? What visual tension exists between the figure and the background?';
  }
}

function renderDynamicFields(fields: Field[]) {
  const container = document.getElementById('dynamicFields');
  const section = document.getElementById('dynamicFieldsSection');
  if (!container || !section) return;

  container.innerHTML = '';

  fields.forEach(field => {
    const group = document.createElement('div');
    const isTextarea = field.id === 'notes' || field.id === 'context' ||
      field.id === 'artistStatement' || field.id === 'contextNote';

    group.className = `hg-field-group${isTextarea ? ' full-width' : ''}`;

    const label = document.createElement('label');
    label.className = 'hg-field-label';
    label.htmlFor = `field_${field.id}`;
    label.textContent = field.label;

    if (isTextarea) {
      const textarea = document.createElement('textarea');
      textarea.className = 'hg-field-textarea';
      textarea.id = `field_${field.id}`;
      textarea.name = field.id;
      textarea.rows = 3;
      textarea.placeholder = `${field.label}...`;
      group.appendChild(label);
      group.appendChild(textarea);
    } else {
      const input = document.createElement('input');
      input.className = 'hg-field-input';
      input.type = 'text';
      input.id = `field_${field.id}`;
      input.name = field.id;
      input.placeholder = `${field.label}...`;
      group.appendChild(label);
      group.appendChild(input);
    }

    container.appendChild(group);
  });

  section.style.display = 'block';
}

// ── Collect field values ───────────────────────────────────────────────────

function collectFields(): Record<string, string> {
  const fields: Record<string, string> = {};

  // Dynamic fields (from mode)
  document.querySelectorAll('#dynamicFields [name]').forEach(el => {
    const input = el as HTMLInputElement | HTMLTextAreaElement;
    if (input.value.trim()) {
      fields[input.name] = input.value.trim();
    }
  });

  // Fallback fields (when no mode selected)
  document.querySelectorAll('#fallbackFieldsSection [name]').forEach(el => {
    const input = el as HTMLInputElement | HTMLTextAreaElement;
    if (input.value.trim()) {
      fields[input.name] = input.value.trim();
    }
  });

  return fields;
}

// ── Analysis submission ────────────────────────────────────────────────────

export function initAnalysis() {
  const analyzeBtn = document.getElementById('analyzeBtn') as HTMLButtonElement | null;
  const loadingState = document.getElementById('loadingState');
  const resultsPanel = document.getElementById('resultsPanel');
  const analysisForm = document.getElementById('analysisForm');
  const resultsContent = document.getElementById('resultsContent');
  const backToForm = document.getElementById('backToForm');

  analyzeBtn?.addEventListener('click', async () => {
    if (!state.uploadedImageData) {
      alert('Please upload an image first');
      return;
    }

    const fields = collectFields();
    const additionalContext = (document.getElementById('additionalContext') as HTMLTextAreaElement | null)?.value.trim() || '';
    const promptText = state.promptText
      ? (additionalContext ? `${state.promptText}\n\nAdditional context from the user: ${additionalContext}` : state.promptText)
      : additionalContext;

    // Show loading
    if (analysisForm) analysisForm.style.display = 'none';
    if (loadingState) loadingState.style.display = 'flex';

    try {
      const response = await fetch('/api/analyze-artwork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: state.uploadedImageData,
          fields,
          promptText,
          interrogationMode: false,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('API Error:', result);
        alert(`Analysis failed: ${result.details || result.error}\n\nCheck console for details.`);
        if (loadingState) loadingState.style.display = 'none';
        if (analysisForm) analysisForm.style.display = 'block';
        return;
      }

      // Store output
      state.outputs = [{ raw: result.raw || '', html: result.analysis }];
      state.fields = fields;

      // Display
      if (resultsContent) resultsContent.innerHTML = result.analysis;
      if (loadingState) loadingState.style.display = 'none';
      if (resultsPanel) resultsPanel.style.display = 'block';

      // Show uploaded image thumbnail
      const thumbnail = document.getElementById('resultThumbnail') as HTMLImageElement | null;
      if (thumbnail && state.uploadedImageData) {
        thumbnail.src = state.uploadedImageData;
        thumbnail.style.display = 'block';
      }

      // Wire up main copy button
      wireCopyButton('copyMainOutput', 0);

      // Show feedback widget and lens modifier
      showFeedbackWidget();
      showLensModifier();

      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze artwork. Please try again.');
      if (loadingState) loadingState.style.display = 'none';
      if (analysisForm) analysisForm.style.display = 'block';
    }
  });

  backToForm?.addEventListener('click', () => {
    if (analysisForm) analysisForm.style.display = 'block';
    if (resultsPanel) resultsPanel.style.display = 'none';

    // Reset thumbnail
    const thumbnail = document.getElementById('resultThumbnail') as HTMLImageElement | null;
    if (thumbnail) {
      thumbnail.style.display = 'none';
      thumbnail.src = '';
    }

    // Reset feedback widget and lens modifier for next analysis
    resetFeedbackWidget();
    resetLensModifier();

    // Clear interrogation history
    const history = document.getElementById('interrogationHistory');
    if (history) history.innerHTML = '';
    state.outputs = [];

    // Reset textarea
    const interrogationInput = document.getElementById('interrogationInput') as HTMLTextAreaElement | null;
    if (interrogationInput) interrogationInput.value = '';

    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ── Copy button wiring ─────────────────────────────────────────────────────

export function wireCopyButton(buttonId: string, outputIndex: number) {
  const btn = document.getElementById(buttonId) as HTMLButtonElement | null;
  if (!btn) return;

  btn.addEventListener('click', async () => {
    const output = state.outputs[outputIndex];
    if (!output?.raw) {
      alert('No content to copy.');
      return;
    }

    const iconHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
      Copy
    `;

    try {
      // Build HTML payload — include thumbnail for main analysis only
      const thumbnailHTML = outputIndex === 0 && state.uploadedImageData
        ? `<img src="${state.uploadedImageData}" style="float:right;max-width:120px;border-radius:8px;margin:0 0 1rem 1.5rem;" alt="Uploaded artwork">`
        : '';
      const htmlPayload = `<meta charset="utf-8">${thumbnailHTML}${output.html}`;

      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([htmlPayload], { type: 'text/html' }),
          'text/plain': new Blob([output.raw], { type: 'text/plain' }),
        }),
      ]);

      btn.textContent = '✓ Copied';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.innerHTML = iconHTML;
      }, 2500);
    } catch {
      // Fallback for browsers without ClipboardItem support
      try {
        await navigator.clipboard.writeText(output.raw);
        btn.textContent = '✓ Copied';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.innerHTML = iconHTML;
        }, 2500);
      } catch {
        alert('Copy failed — please select and copy manually.');
      }
    }
  });
}
