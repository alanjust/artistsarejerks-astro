import { state } from './state';
import { showFeedbackWidget, resetFeedbackWidget } from './feedback';
import { showLensModifier, resetLensModifier } from './lens-modifier';
import { showChatSection, hideChatSection } from './interrogation';

// ── Shared utilities (exported for use in interrogation.ts and lens-modifier.ts) ──

export function stripTiers(html: string): string {
  return html
    .replace(/\bTier\s+[A-D]\s*[—–\-]\s*/g, '')
    .replace(/\s*\(Tier\s+[A-D]\)/g, '');
}

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
  const slamResultsPanel = document.getElementById('slamResultsPanel');
  const analysisForm = document.getElementById('analysisForm');
  const resultsContent = document.getElementById('resultsContent');
  const backToForm = document.getElementById('backToForm');
  const backToFormSlam = document.getElementById('backToFormSlam');

  // ── Back button for slam panel ────────────────────────────────────────────
  backToFormSlam?.addEventListener('click', () => {
    if (analysisForm) analysisForm.style.display = 'block';
    if (slamResultsPanel) slamResultsPanel.style.display = 'none';
    const slamContent = document.getElementById('slamContent');
    if (slamContent) slamContent.textContent = '';
    const slamThumbnail = document.getElementById('slamThumbnail') as HTMLImageElement | null;
    if (slamThumbnail) { slamThumbnail.src = ''; slamThumbnail.style.display = 'none'; }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  analyzeBtn?.addEventListener('click', async () => {
    if (!state.uploadedImageData) {
      alert('Please upload an image first');
      return;
    }

    const isSlam = state.modeId === 'slam-read';
    const fields = collectFields();
    const additionalContext = (document.getElementById('additionalContext') as HTMLTextAreaElement | null)?.value.trim() || '';
    const promptText = state.promptText
      ? (additionalContext ? `${state.promptText}\n\nAdditional context from the user: ${additionalContext}` : state.promptText)
      : additionalContext;

    // Show loading (with mode-specific text)
    if (analysisForm) analysisForm.style.display = 'none';
    if (loadingState) loadingState.style.display = 'flex';
    const loadingTextEl = document.getElementById('loadingText');
    const loadingSubEl = document.getElementById('loadingSub');
    if (isSlam) {
      if (loadingTextEl) loadingTextEl.textContent = 'Reading the work...';
      if (loadingSubEl) loadingSubEl.textContent = '';
    }

    try {
      const devModelEl = document.getElementById('devModelSelector') as HTMLSelectElement | null;
      const devModel = devModelEl?.value || undefined;

      const response = await fetch('/api/analyze-artwork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: state.uploadedImageData,
          fields,
          promptText,
          interrogationMode: false,
          ...(isSlam && { slamMode: true }),
          ...(devModel && { model: devModel }),
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

      if (loadingState) loadingState.style.display = 'none';

      // ── Slam output ──────────────────────────────────────────────────────
      if (result.slamMode) {
        const slamContent = document.getElementById('slamContent');
        const slamThumbnail = document.getElementById('slamThumbnail') as HTMLImageElement | null;
        const copySlamBtn = document.getElementById('copySlamOutput') as HTMLButtonElement | null;

        if (slamContent) slamContent.textContent = result.raw || '';

        if (slamThumbnail && state.uploadedImageData) {
          slamThumbnail.src = state.uploadedImageData;
          slamThumbnail.style.display = 'block';
        }

        if (copySlamBtn && slamContent) {
          copySlamBtn.onclick = async () => {
            const poemText = slamContent.textContent || '';
            const imgSrc = state.uploadedImageData || '';
            const htmlPayload = imgSrc
              ? `<img src="${imgSrc}" style="max-height:140px;width:auto;border-radius:8px;display:block;margin-bottom:1.5em"><pre style="font-family:inherit;font-size:1rem;line-height:2;white-space:pre-wrap">${poemText}</pre>`
              : `<pre style="font-family:inherit;font-size:1rem;line-height:2;white-space:pre-wrap">${poemText}</pre>`;
            try {
              await navigator.clipboard.write([
                new ClipboardItem({
                  'text/html': new Blob([htmlPayload], { type: 'text/html' }),
                  'text/plain': new Blob([poemText], { type: 'text/plain' }),
                }),
              ]);
            } catch {
              await navigator.clipboard.writeText(poemText);
            }
            copySlamBtn.textContent = 'Copied';
            setTimeout(() => { copySlamBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy'; }, 2000);
          };
        }

        if (slamResultsPanel) slamResultsPanel.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // ── Standard output ──────────────────────────────────────────────────
      state.outputs = [{ raw: result.raw || '', html: result.analysis }];
      state.fields = fields;
      state.imagePropertiesHTML = stripTiers(result.imageProperties || '');
      state.viewerEffectsHTML = stripTiers(result.viewerEffects || '');

      if (resultsContent) {
        resultsContent.innerHTML = stripTiers(result.analysis);
        buildSidebar(resultsContent);
        linkPrincipleNames(resultsContent);
      }
      if (resultsPanel) resultsPanel.style.display = 'block';

      // Show uploaded image thumbnail
      const thumbnail = document.getElementById('resultThumbnail') as HTMLImageElement | null;
      if (thumbnail && state.uploadedImageData) {
        thumbnail.src = state.uploadedImageData;
        thumbnail.style.display = 'block';
      }

      // Inject view toggle if sections are present (pass already-stripped HTML)
      if (result.imageProperties && result.viewerEffects) {
        injectViewToggle(state.imagePropertiesHTML, state.viewerEffectsHTML);
      }

      // Wire up main copy button
      wireCopyButton('copyMainOutput', 0);

      // Show exploration panel for WIP and C&O modes
      const isWip = state.promptId.includes('wip');
      const isCO = state.modeId === 'constraints-opportunities';
      if (isWip || isCO) injectExplorationPanel(result.raw || '');

      // Show feedback widget and lens modifier
      showFeedbackWidget();
      showLensModifier();

      // Show follow-up chat section
      showChatSection();

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
    const loadingTextEl = document.getElementById('loadingText');
    const loadingSubEl = document.getElementById('loadingSub');
    if (loadingTextEl) loadingTextEl.textContent = 'Analyzing artwork...';
    if (loadingSubEl) loadingSubEl.textContent = 'the Art Analyzer is examining the visual grammar';

    // Reset thumbnail
    const thumbnail = document.getElementById('resultThumbnail') as HTMLImageElement | null;
    if (thumbnail) {
      thumbnail.style.display = 'none';
      thumbnail.src = '';
    }

    // Reset sidebar
    const sidebar = document.getElementById('resultsSidebar');
    const sidebarList = document.getElementById('sidebarList');
    if (sidebar) sidebar.style.display = 'none';
    if (sidebarList) sidebarList.innerHTML = '';

    // Remove toggle and section divs
    document.getElementById('viewToggle')?.remove();
    document.getElementById('sectionIP')?.remove();
    document.getElementById('sectionVE')?.remove();

    // Reset exploration panel
    const explorationPanel = document.getElementById('explorationPanel');
    const explorationOutput = document.getElementById('explorationOutput');
    if (explorationPanel) explorationPanel.style.display = 'none';
    if (explorationOutput) { explorationOutput.innerHTML = ''; explorationOutput.style.display = 'none'; }
    document.querySelector('.hg-exploration-spinner')?.remove();
    state.imagePropertiesHTML = '';
    state.viewerEffectsHTML = '';

    // Reset feedback widget and lens modifier for next analysis
    resetFeedbackWidget();
    resetLensModifier();

    // Hide follow-up chat and reset its contents
    hideChatSection();
    state.outputs = [];

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

// ── View toggle ───────────────────────────────────────────────────────────────────
// Injects a three-button toggle (Full / Image Properties / Viewer Effects)
// into the results header and wires the section visibility switching.

function injectViewToggle(ipHTML: string, veHTML: string) {
  const resultsContent = document.getElementById('resultsContent');
  const resultsHeader = document.querySelector('.hg-results-header');
  if (!resultsContent || !resultsHeader) return;

  // Build section containers and insert after resultsContent
  const ipDiv = document.createElement('div');
  ipDiv.id = 'sectionIP';
  ipDiv.className = 'hg-section-panel hg-section-panel--ip';
  ipDiv.style.display = 'none';
  ipDiv.innerHTML = `<div class="hg-section-eyebrow hg-section-eyebrow--ip">Image Properties — what is physically present</div>${ipHTML}`;
  linkPrincipleNames(ipDiv);

  const veDiv = document.createElement('div');
  veDiv.id = 'sectionVE';
  veDiv.className = 'hg-section-panel hg-section-panel--ve';
  veDiv.style.display = 'none';
  veDiv.innerHTML = `<div class="hg-section-eyebrow hg-section-eyebrow--ve">Viewer Effects — predicted nervous system response</div>${veHTML}`;
  linkPrincipleNames(veDiv);

  resultsContent.after(ipDiv);
  ipDiv.after(veDiv);

  // Build toggle bar and append to results header
  const toggle = document.createElement('div');
  toggle.id = 'viewToggle';
  toggle.className = 'hg-view-toggle';
  toggle.innerHTML = `
    <button class="hg-toggle-btn hg-toggle-btn--active" data-view="full">Full Analysis</button>
    <button class="hg-toggle-btn" data-view="properties">
      <span class="hg-toggle-pip hg-toggle-pip--ip"></span>Image Properties
    </button>
    <button class="hg-toggle-btn" data-view="effects">
      <span class="hg-toggle-pip hg-toggle-pip--ve"></span>Viewer Effects
    </button>
  `;
  resultsHeader.appendChild(toggle);

  // Wire toggle clicks
  toggle.querySelectorAll<HTMLButtonElement>('.hg-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-view');
      toggle.querySelectorAll('.hg-toggle-btn').forEach(b => b.classList.remove('hg-toggle-btn--active'));
      btn.classList.add('hg-toggle-btn--active');

      const full = document.getElementById('resultsContent');
      const ip = document.getElementById('sectionIP');
      const ve = document.getElementById('sectionVE');
      const sidebar = document.getElementById('resultsSidebar');
      const copyRow = document.getElementById('mainCopyRow');

      if (view === 'full') {
        if (full) full.style.display = '';
        if (ip) ip.style.display = 'none';
        if (ve) ve.style.display = 'none';
        if (sidebar) sidebar.style.display = 'block';
        if (copyRow) copyRow.style.display = 'flex';
      } else if (view === 'properties') {
        if (full) full.style.display = 'none';
        if (ip) ip.style.display = '';
        if (ve) ve.style.display = 'none';
        if (sidebar) sidebar.style.display = 'none';
        if (copyRow) copyRow.style.display = 'none';
      } else {
        if (full) full.style.display = 'none';
        if (ip) ip.style.display = 'none';
        if (ve) ve.style.display = '';
        if (sidebar) sidebar.style.display = 'none';
        if (copyRow) copyRow.style.display = 'none';
      }
    });
  });
}

// ── Exploration panel ─────────────────────────────────────────────────────────────
// Shows the "What could this become?" button for WIP and C&O modes.
// On click, fires a pre-built API call and renders 2–3 experimental angles inline.

function injectExplorationPanel(priorAnalysis: string) {
  const panel = document.getElementById('explorationPanel');
  const btn = document.getElementById('explorationBtn') as HTMLButtonElement | null;
  const output = document.getElementById('explorationOutput');
  if (!panel || !btn || !output) return;

  panel.style.display = 'block';

  btn.addEventListener('click', async () => {
    // Replace button with spinner
    const spinner = document.createElement('div');
    spinner.className = 'hg-exploration-spinner';
    spinner.innerHTML = `<div class="hg-exploration-spin"></div><span class="hg-exploration-spin-label">Finding angles…</span>`;
    btn.replaceWith(spinner);

    try {
      const response = await fetch('/api/analyze-artwork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          explorationMode: true,
          priorAnalysis,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.analysis) {
        spinner.replaceWith(btn);
        btn.disabled = false;
        alert('Could not generate directions. Please try again.');
        return;
      }

      spinner.remove();
      document.querySelector('.hg-exploration-question')?.remove();
      output.innerHTML = stripTiers(result.analysis);
      linkPrincipleNames(output);
      output.style.display = 'block';

      // Inject a copy button into each angle card
      output.querySelectorAll('li').forEach((li, i) => {
        const copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'hg-angle-copy-btn';
        copyBtn.textContent = 'Copy this angle';
        copyBtn.addEventListener('click', async () => {
          const text = li.innerText.replace('Copy this angle', '').trim();
          try {
            await navigator.clipboard.writeText(text);
            copyBtn.textContent = 'Copied ✓';
            setTimeout(() => { copyBtn.textContent = 'Copy this angle'; }, 2000);
          } catch {
            copyBtn.textContent = 'Copy failed';
            setTimeout(() => { copyBtn.textContent = 'Copy this angle'; }, 2000);
          }
        });
        li.appendChild(copyBtn);
      });

      output.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch {
      spinner.replaceWith(btn);
      btn.disabled = false;
      alert('Could not generate directions. Please try again.');
    }
  });
}

// ── Sidebar builder ────────────────────────────────────────────────────────────────
// Reads H2 headings from the rendered analysis, builds sticky sidebar nav,
// and marks the first H2 as Key Findings if the text matches.

function buildSidebar(contentEl: HTMLElement) {
  const headings = Array.from(contentEl.querySelectorAll('h2'));
  const sidebar = document.getElementById('resultsSidebar');
  const sidebarList = document.getElementById('sidebarList');
  if (!sidebar || !sidebarList || headings.length < 2) return;

  sidebarList.innerHTML = '';

  headings.forEach((h2, i) => {
    // Assign anchor ID
    const id = `hg-section-${i}`;
    h2.id = id;
    h2.style.scrollMarginTop = '80px';

    // Mark Key Findings heading for special styling
    const text = h2.textContent?.trim().toLowerCase() || '';
    if (i === 0 && (text.includes('key finding') || text.includes('key signal'))) {
      h2.classList.add('hg-key-findings');
    }

    // Build sidebar link
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${id}`;
    a.className = 'hg-sidebar-link';
    a.textContent = h2.textContent || `Section ${i + 1}`;
    li.appendChild(a);
    sidebarList.appendChild(li);
  });

  sidebar.style.display = 'block';

  // Highlight active section on scroll
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        const id = entry.target.id;
        const link = sidebarList.querySelector(`a[href="#${id}"]`);
        if (link) {
          if (entry.isIntersecting) {
            sidebarList.querySelectorAll('.hg-sidebar-link--active').forEach(el => el.classList.remove('hg-sidebar-link--active'));
            link.classList.add('hg-sidebar-link--active');
          }
        }
      });
    },
    { rootMargin: '-10% 0px -80% 0px', threshold: 0 }
  );

  headings.forEach(h2 => observer.observe(h2));
}

// ── Principle linking ──────────────────────────────────────────────────────────
// Finds principle names in rendered analysis text and wraps them in trigger
// buttons. Click shows a popover (pointer devices) or bottom sheet (haptic).

interface Principle {
  id: number;
  name: string;
  subtitle?: string;
  tier: string;
  neuralFact?: string;
  studioTool?: string;
}

function getPrinciples(): Principle[] {
  const el = document.getElementById('principlesData');
  if (!el) return [];
  try {
    const data = JSON.parse(el.textContent || '{}');
    return data.principles || [];
  } catch {
    return [];
  }
}

export function linkPrincipleNames(contentEl: HTMLElement) {
  const principles = getPrinciples();
  if (!principles.length) return;

  // Sort longest-first so "Figure-Ground Relationships" matches before "Figure-Ground"
  const sorted = [...principles].sort((a, b) => b.name.length - a.name.length);

  // Escape special regex chars in each name
  const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = sorted.map(p => escapeRe(p.name)).join('|');
  const regex = new RegExp(`(?<![\\w-])(${pattern})(?![\\w-])`, 'gi');

  // Lookup: lowercase name → principle object
  const principleMap = new Map(principles.map(p => [p.name.toLowerCase(), p]));

  // Only process text nodes outside headings, buttons, links, or existing triggers
  const skipTags = new Set(['H1','H2','H3','H4','H5','H6','BUTTON','A','SCRIPT','STYLE']);
  const filter: NodeFilter = {
    acceptNode(node: Node) {
      let el = (node as Text).parentElement;
      while (el) {
        if (skipTags.has(el.tagName)) return NodeFilter.FILTER_SKIP;
        if (el.classList.contains('hg-principle-trigger')) return NodeFilter.FILTER_SKIP;
        el = el.parentElement;
      }
      return NodeFilter.FILTER_ACCEPT;
    }
  };

  const walker = document.createTreeWalker(contentEl, NodeFilter.SHOW_TEXT, filter);
  const textNodes: Text[] = [];
  let node;
  while ((node = walker.nextNode())) textNodes.push(node as Text);

  textNodes.forEach(textNode => {
    const text = textNode.nodeValue || '';
    regex.lastIndex = 0;
    if (!regex.test(text)) { regex.lastIndex = 0; return; }
    regex.lastIndex = 0;

    const parent = textNode.parentNode;
    if (!parent) return;

    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
      }

      const principle = principleMap.get(match[0].toLowerCase());
      if (principle) {
        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'hg-principle-trigger';
        trigger.textContent = match[0];
        trigger.dataset.principleId = String(principle.id);
        fragment.appendChild(trigger);
      } else {
        fragment.appendChild(document.createTextNode(match[0]));
      }

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
    }

    parent.replaceChild(fragment, textNode);
  });

  // Wire the overlay once after all triggers are injected
  initPrincipleOverlay(principles);
}

// ── Principle overlay (popover + bottom sheet) ─────────────────────────────────

let overlayInitialized = false;

function initPrincipleOverlay(principles: Principle[]) {
  if (overlayInitialized) return;
  overlayInitialized = true;

  const isHaptic = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const principleMap = new Map(principles.map(p => [p.id, p]));

  // ── Popover (pointer devices) ──────────────────────────────────────────────
  const popover = document.getElementById('principlePopover');
  const ppName = popover?.querySelector('.hg-pp-name');
  const ppSub = popover?.querySelector('.hg-pp-sub');
  const ppNeural = popover?.querySelector('.hg-pp-neural');
  const ppStudio = popover?.querySelector('.hg-pp-studio');
  const ppLink = popover?.querySelector('.hg-pp-link') as HTMLAnchorElement | null;
  const ppClose = popover?.querySelector('.hg-pp-close');

  // ── Bottom sheet (haptic devices) ─────────────────────────────────────────
  const sheet = document.getElementById('principleSheet');
  const psBackdrop = sheet?.querySelector('.hg-ps-backdrop');
  const psName = sheet?.querySelector('.hg-ps-name');
  const psSub = sheet?.querySelector('.hg-ps-sub');
  const psNeural = sheet?.querySelector('.hg-ps-neural');
  const psStudio = sheet?.querySelector('.hg-ps-studio');
  const psLink = sheet?.querySelector('.hg-ps-link') as HTMLAnchorElement | null;
  const psClose = sheet?.querySelector('.hg-ps-close');

  function fillPopover(p: Principle) {
    if (!popover || !ppName || !ppSub || !ppNeural || !ppStudio || !ppLink) return;
    ppName.textContent = p.name;
    ppSub.textContent = p.subtitle || '';
    ppNeural.textContent = p.neuralFact || '';
    ppStudio.textContent = p.studioTool || '';
    ppLink.href = `/hidden-grammar/principles#principle-${p.id}`;
    // Hide studio section if empty
    const studioSection = ppStudio.closest('.hg-pp-section') as HTMLElement | null;
    if (studioSection) studioSection.style.display = p.studioTool ? '' : 'none';
    const neuralSection = ppNeural.closest('.hg-pp-section') as HTMLElement | null;
    if (neuralSection) neuralSection.style.display = p.neuralFact ? '' : 'none';
  }

  function fillSheet(p: Principle) {
    if (!sheet || !psName || !psSub || !psNeural || !psStudio || !psLink) return;
    psName.textContent = p.name;
    psSub.textContent = p.subtitle || '';
    psNeural.textContent = p.neuralFact || '';
    psStudio.textContent = p.studioTool || '';
    psLink.href = `/hidden-grammar/principles#principle-${p.id}`;
    const studioSection = psStudio.closest('.hg-ps-section') as HTMLElement | null;
    if (studioSection) studioSection.style.display = p.studioTool ? '' : 'none';
    const neuralSection = psNeural.closest('.hg-ps-section') as HTMLElement | null;
    if (neuralSection) neuralSection.style.display = p.neuralFact ? '' : 'none';
  }

  function showPopover(trigger: HTMLElement, p: Principle) {
    if (!popover) return;
    fillPopover(p);
    // Show off-screen to measure real height, then position
    popover.style.visibility = 'hidden';
    popover.style.top = '-9999px';
    popover.style.left = '-9999px';
    popover.classList.add('hg-pp--visible');
    // rAF gives browser time to lay out before we measure
    requestAnimationFrame(() => {
      positionPopover(trigger, popover!);
      popover!.style.visibility = '';
      popover!.setAttribute('aria-hidden', 'false');
    });
  }

  function hidePopover() {
    if (!popover) return;
    popover.classList.remove('hg-pp--visible');
    popover.setAttribute('aria-hidden', 'true');
  }

  function showSheet(p: Principle) {
    if (!sheet) return;
    fillSheet(p);
    sheet.classList.add('hg-ps--visible');
    sheet.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function hideSheet() {
    if (!sheet) return;
    sheet.classList.remove('hg-ps--visible');
    sheet.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function positionPopover(trigger: HTMLElement, pop: HTMLElement) {
    const triggerRect = trigger.getBoundingClientRect();
    const popRect = pop.getBoundingClientRect();
    const popWidth = popRect.width || 320;
    const popHeight = popRect.height || 300;
    const margin = 10;
    const vp = { w: window.innerWidth, h: window.innerHeight };

    let left = triggerRect.left;
    let top = triggerRect.bottom + margin;

    // Flip horizontally if too close to right edge
    if (left + popWidth > vp.w - 16) {
      left = Math.max(16, vp.w - popWidth - 16);
    }

    // Prefer below; flip above if it would be clipped
    if (top + popHeight > vp.h - 16) {
      const topAbove = triggerRect.top - popHeight - margin;
      // Use above if it fits; otherwise pin to top of viewport
      top = topAbove >= 8 ? topAbove : Math.max(8, vp.h - popHeight - 16);
    }

    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;
  }

  // Delegate trigger clicks (works for triggers added after init too)
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    // Close popover on outside click
    if (popover?.classList.contains('hg-pp--visible')) {
      if (!popover.contains(target) && !target.classList.contains('hg-principle-trigger')) {
        hidePopover();
      }
    }

    // Handle trigger click
    if (target.classList.contains('hg-principle-trigger')) {
      e.stopPropagation();
      const id = parseInt(target.dataset.principleId || '0', 10);
      const principle = principleMap.get(id);
      if (!principle) return;

      if (isHaptic) {
        showSheet(principle);
      } else {
        // Toggle: close if already showing for same trigger
        if (popover?.classList.contains('hg-pp--visible')) {
          hidePopover();
        } else {
          showPopover(target, principle);
        }
      }
    }
  });

  // Popover close button
  ppClose?.addEventListener('click', hidePopover);

  // Sheet close button and backdrop
  psClose?.addEventListener('click', hideSheet);
  psBackdrop?.addEventListener('click', hideSheet);

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hidePopover();
      hideSheet();
    }
  });
}
