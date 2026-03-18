import { state } from './state';
import { wireCopyButton } from './analysis';

// ── Conversation history for pre-analysis chat mode ────────────────────────
// Maintains the multi-turn context so the AI remembers what was said.
// Cleared when the user starts a fresh analysis.
type ChatMessage = { role: 'user' | 'assistant'; content: string };
let chatHistory: ChatMessage[] = [];

export function clearChatHistory() {
  chatHistory = [];
}

// ── Update the chat window UI based on whether an analysis exists ──────────
export function updateChatWindowContext(hasAnalysis: boolean) {
  const titleEl = document.getElementById('interrogationTitle');
  const hintEl = document.getElementById('interrogationHint');
  const textareaEl = document.getElementById('interrogationInput') as HTMLTextAreaElement | null;
  const modeTagEl = document.getElementById('interrogationModeTag');

  if (hasAnalysis) {
    if (titleEl) titleEl.textContent = 'Follow-up Questions';
    if (hintEl) hintEl.textContent = 'Ask a follow-up question about this analysis. The AI stays anchored to the visual evidence already identified.';
    if (textareaEl) textareaEl.placeholder = 'Ask a follow-up question about this analysis...';
    if (modeTagEl) {
      modeTagEl.textContent = 'Anchored to analysis';
      modeTagEl.className = 'hg-chat-mode-tag hg-chat-mode-tag--analysis';
    }
  } else {
    if (titleEl) titleEl.textContent = 'Studio Chat';
    if (hintEl) hintEl.textContent = 'Ask anything — about your constraints, what a principle means, why something isn\'t working, or how this tool works. No image needed.';
    if (textareaEl) textareaEl.placeholder = 'Describe what you\'re working on, what\'s not working, or ask a question about the framework...';
    if (modeTagEl) {
      modeTagEl.textContent = 'Open studio chat';
      modeTagEl.className = 'hg-chat-mode-tag hg-chat-mode-tag--open';
    }
  }
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

    const hasAnalysis = state.outputs.length > 0;

    submitBtn!.disabled = true;
    textarea!.value = '';
    if (loadingEl) loadingEl.style.display = 'flex';

    try {
      let requestBody: Record<string, any>;

      if (hasAnalysis) {
        // ── POST-ANALYSIS: anchored interrogation ───────────────────────────
        // Uses the first output (main analysis) as context.
        const priorAnalysis = state.outputs[0].raw;
        requestBody = {
          interrogationMode: true,
          priorAnalysis,
          userQuestion: question,
        };
      } else {
        // ── PRE-ANALYSIS: open studio chat ─────────────────────────────────
        // Collects any constraint fields that have been filled in.
        const fields: Record<string, string> = {};
        document.querySelectorAll('#dynamicFields [name], #fallbackFieldsSection [name]').forEach(el => {
          const input = el as HTMLInputElement | HTMLTextAreaElement;
          if (input.value.trim()) fields[input.name] = input.value.trim();
        });

        requestBody = {
          chatMode: true,
          userQuestion: question,
          conversationHistory: chatHistory,
          ...(Object.keys(fields).length > 0 ? { fields } : {}),
        };
      }

      const response = await fetch('/api/analyze-artwork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Chat error:', result);
        alert(`Request failed: ${result.details || result.error}`);
        return;
      }

      // Update history for chat mode (multi-turn context)
      if (!hasAnalysis) {
        chatHistory.push({ role: 'user', content: question });
        chatHistory.push({ role: 'assistant', content: result.raw || '' });
      }

      // Store output for copy
      const outputIndex = state.outputs.length;
      state.outputs.push({ raw: result.raw || '', html: result.analysis });

      // Render the turn
      appendInterrogationTurn(question, result.analysis, outputIndex, historyEl, hasAnalysis);

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
  container: HTMLElement | null,
  isAnalysisTurn: boolean
) {
  if (!container) return;

  const copyBtnId = `copyInterrogation_${outputIndex}`;
  const turnClass = isAnalysisTurn ? 'hg-interrogation-turn' : 'hg-interrogation-turn hg-interrogation-turn--chat';

  const turn = document.createElement('div');
  turn.className = turnClass;
  turn.innerHTML = `
    <div class="hg-interrogation-question">
      <p class="hg-interrogation-question-label">${isAnalysisTurn ? 'Your question' : 'You'}</p>
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
