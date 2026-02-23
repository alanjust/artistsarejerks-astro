import { state } from './state';

// One session ID per page load — identifies a single user session in Airtable
const sessionId: string =
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

let currentRating = 0;

// ── Public API ─────────────────────────────────────────────────────────────

export function initFeedback() {
  const stars = document.querySelectorAll<HTMLButtonElement>('.hg-feedback-star');
  const submitBtn = document.getElementById('feedbackSubmit') as HTMLButtonElement | null;

  if (!stars.length || !submitBtn) return;

  // Star interaction
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const val = parseInt(star.dataset.value || '0', 10);
      setRating(val);
    });
    star.addEventListener('mouseenter', () => {
      const val = parseInt(star.dataset.value || '0', 10);
      paintStars(val, true);
    });
    star.addEventListener('mouseleave', () => {
      paintStars(currentRating, false);
    });
  });

  // Submit — allows comment-only (no rating required)
  submitBtn.addEventListener('click', async () => {
    const commentEl = document.getElementById('feedbackComment') as HTMLTextAreaElement | null;
    const comment = commentEl?.value.trim() || '';

    if (currentRating === 0 && !comment) {
      // Nothing to send — just close gracefully
      showThanks();
      return;
    }

    await submitFeedback();
  });
}

export function showFeedbackWidget() {
  const widget = document.getElementById('feedbackWidget');
  if (widget) widget.style.display = 'block';
}

export function resetFeedbackWidget() {
  const widget    = document.getElementById('feedbackWidget');
  const formEl    = document.getElementById('feedbackForm');
  const thanksEl  = document.getElementById('feedbackThanks');
  const commentEl = document.getElementById('feedbackComment') as HTMLTextAreaElement | null;
  const submitBtn = document.getElementById('feedbackSubmit') as HTMLButtonElement | null;

  if (widget)    widget.style.display = 'none';
  if (formEl)    formEl.style.display = 'block';
  if (thanksEl)  thanksEl.style.display = 'none';
  if (commentEl) commentEl.value = '';
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send feedback';
  }

  currentRating = 0;
  paintStars(0, false);
}

// ── Internal ───────────────────────────────────────────────────────────────

function setRating(val: number) {
  currentRating = val;
  paintStars(val, false);
}

function paintStars(upTo: number, isHover: boolean) {
  const stars = document.querySelectorAll<HTMLButtonElement>('.hg-feedback-star');
  stars.forEach(star => {
    const v = parseInt(star.dataset.value || '0', 10);
    const filled = v <= upTo;

    if (isHover) {
      star.classList.toggle('hg-feedback-star--hover', filled);
      star.classList.toggle('hg-feedback-star--active', v <= currentRating);
    } else {
      star.classList.toggle('hg-feedback-star--active', filled);
      star.classList.remove('hg-feedback-star--hover');
    }
    star.setAttribute('aria-pressed', String(v <= currentRating));
  });
}

async function submitFeedback() {
  const commentEl = document.getElementById('feedbackComment') as HTMLTextAreaElement | null;
  const submitBtn = document.getElementById('feedbackSubmit') as HTMLButtonElement | null;

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
  }

  const payload = {
    rating:    currentRating > 0 ? currentRating : null,
    comment:   commentEl?.value.trim() || '',
    modeId:    state.modeId,
    promptId:  state.promptId,
    submodeId: state.submodeId,
    sessionId,
    timestamp: new Date().toISOString(),
  };

  try {
    await fetch('/api/submit-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    // Silent — feedback failure must not disrupt the session
    console.error('Feedback submission error:', error);
  }

  showThanks();
}

function showThanks() {
  const formEl   = document.getElementById('feedbackForm');
  const thanksEl = document.getElementById('feedbackThanks');
  if (formEl)   formEl.style.display = 'none';
  if (thanksEl) thanksEl.style.display = 'block';
}
