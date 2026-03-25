import { state } from './state';
import { wireCopyButton } from './analysis';

// ── Show / hide the follow-up chat section ─────────────────────────────────
export function showChatSection() {
  const el = document.getElementById('studioChatSection');
  if (el) el.style.display = '';
}

export function hideChatSection() {
  const el = document.getElementById('studioChatSection');
  if (el) el.style.display = 'none';

  // Clear history display and textarea
  const history = document.getElementById('interrogationHistory');
  if (history) history.innerHTML = '';
  const textarea = document.getElementById('interrogationInput') as HTMLTextAreaElement | null;
  if (textarea) textarea.value = '';
}

// ── Main interrogation initializer ────────────────────────────────────────
export function initInterrogation() {
  const submitBtn = document.getElementById('interrogationSubmit') as HTMLButtonElement | null;
  const textarea = document.getElementById('interrogationInput') as HTMLTextAreaElement | null;
  const loadingEl = document.getElementById('interrogationLoading');
  const historyEl = document.getElementById('interrogationHistory');

  if (!submitBtn || !textarea) return;

  // Allow Shift+Enter for newline, Enter to submit
  textarea.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitInterrogation();
    }
  });

  submitBtn.addEventListener('click', submitInterrogation);

  async function submitInterrogation() {
    const question = textarea!.value.trim();
    if (!question) return;

    const priorAnalysis = state.outputs[0]?.raw;
    if (!priorAnalysis) return;

    submitBtn!.disabled = true;
    textarea!.value = '';
    if (loadingEl) loadingEl.style.display = 'flex';

    try {
      const response = await fetch('/api/analyze-artwork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interrogationMode: true,
          priorAnalysis,
          userQuestion: question,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Chat error:', result);
        alert(`Request failed: ${result.details || result.error}`);
        return;
      }

      // Store output for copy
      const outputIndex = state.outputs.length;
      state.outputs.push({ raw: result.raw || '', html: result.analysis });

      // Render the turn
      appendInterrogationTurn(question, result.analysis, outputIndex, historyEl);

    } catch (error) {
      console.error('Chat error:', error);
      alert('Request failed. Please try again.');
    } finally {
      submitBtn!.disabled = false;
      if (loadingEl) loadingEl.style.display = 'none';
      textarea!.focus();
    }
  }
}

function appendInterrogationTurn(
  question: string,
  answerHTML: string,
  outputIndex: number,
  container: HTMLElement | null
) {
  if (!container) return;

  const copyBtnId = `copyInterrogation_${outputIndex}`;

  const turn = document.createElement('div');
  turn.className = 'hg-interrogation-turn';
  turn.innerHTML = `
    <div class="hg-interrogation-question">
      <p class="hg-interrogation-question-label">Your question</p>
      <p>${escapeHtml(question)}</p>
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
  wireCopyButton(copyBtnId, outputIndex);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
