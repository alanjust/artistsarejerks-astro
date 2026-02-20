import { state } from './state';

export function initAnalysis() {
  const analyzeBtn = document.getElementById('analyzeBtn');
  const loadingState = document.getElementById('loadingState');
  const resultsPanel = document.getElementById('resultsPanel');
  const analysisForm = document.getElementById('analysisForm');
  const resultsContent = document.getElementById('resultsContent');
  const backToForm = document.getElementById('backToForm');
  const customPromptTextarea = document.getElementById('customPrompt') as HTMLTextAreaElement;
  const modeRadios = document.querySelectorAll('input[name="analysisMode"]') as NodeListOf<HTMLInputElement>;
  const customPromptSection = document.querySelector('.custom-prompt-section') as HTMLElement;
  const modesSection = document.querySelector('.preformatted-modes-section') as HTMLElement;

  analyzeBtn?.addEventListener('click', async () => {
    if (!state.uploadedImageData) {
      alert('Please upload an image first');
      return;
    }

    // Get form data
    const title = (document.getElementById('artworkTitle') as HTMLInputElement)?.value || 'Untitled';
    const artist = (document.getElementById('artistName') as HTMLInputElement)?.value || 'Unknown Artist';
    const year = (document.getElementById('yearCreated') as HTMLInputElement)?.value;
    const medium = (document.getElementById('medium') as HTMLInputElement)?.value;
    const dimensions = (document.getElementById('dimensions') as HTMLInputElement)?.value;
    const artistStatement = (document.getElementById('artistStatement') as HTMLTextAreaElement)?.value || '';
    const contextNote = (document.getElementById('contextNote') as HTMLTextAreaElement)?.value || '';
    const customPrompt = (document.getElementById('customPrompt') as HTMLTextAreaElement)?.value || '';
    const selectedModeRadio = document.querySelector('input[name="analysisMode"]:checked') as HTMLInputElement;
    const mode = selectedModeRadio?.value || 'strategic';
    const lens = (document.getElementById('lensSelector') as HTMLSelectElement)?.value || '';

    // Validate that either custom prompt or mode is selected
    if (!customPrompt.trim() && !selectedModeRadio) {
      alert('Please either enter a custom prompt or select a pre-formatted analysis mode');
      if (loadingState) loadingState.style.display = 'none';
      if (analysisForm) analysisForm.style.display = 'block';
      return;
    }

    // Show loading state
    if (analysisForm) analysisForm.style.display = 'none';
    if (loadingState) loadingState.style.display = 'flex';

    try {
      const response = await fetch('/api/analyze-artwork', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: state.uploadedImageData,
          title,
          artist,
          year,
          medium,
          dimensions,
          artistStatement,
          contextNote,
          mode,
          customPrompt,
          lens,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('API Error:', result);
        alert(`Analysis failed: ${result.details || result.error}\n\nAPI Key Present: ${result.apiKeyPresent}\n\nCheck console for more details.`);
        if (loadingState) loadingState.style.display = 'none';
        if (analysisForm) analysisForm.style.display = 'block';
        return;
      }

      // Display results
      if (resultsContent) {
        resultsContent.innerHTML = result.analysis;
      }

      // Store raw markdown and metadata for export/copy
      state.rawMarkdownContent = result.raw || '';

      // Get mode name from the label associated with selected radio
      let modeName = mode;
      if (selectedModeRadio) {
        const modeLabel = selectedModeRadio.closest('.mode-card')?.querySelector('h3');
        if (modeLabel) {
          modeName = modeLabel.textContent || mode;
        }
      }

      // Get lens name
      let lensName = '';
      if (lens) {
        const lensOption = (document.getElementById('lensSelector') as HTMLSelectElement)?.querySelector(`option[value="${lens}"]`);
        if (lensOption) {
          lensName = lensOption.textContent || lens;
        }
      }

      state.analysisMetadata = {
        title,
        artist,
        year,
        medium,
        dimensions,
        mode: modeName,
        lens: lensName,
        customPrompt,
        timestamp: new Date().toISOString()
      };

      if (loadingState) loadingState.style.display = 'none';
      if (resultsPanel) resultsPanel.style.display = 'block';
      window.scrollTo(0, 0);

    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze artwork. Please try again.\n\nCheck console for more details.');
      if (loadingState) loadingState.style.display = 'none';
      if (analysisForm) analysisForm.style.display = 'block';
    }
  });

  backToForm?.addEventListener('click', () => {
    if (analysisForm) analysisForm.style.display = 'block';
    if (resultsPanel) resultsPanel.style.display = 'none';

    // Clear custom prompt
    if (customPromptTextarea) {
      customPromptTextarea.value = '';
    }

    // Deselect all mode radios
    modeRadios.forEach(radio => {
      radio.checked = false;
    });

    // Remove inactive classes from both sections so they're both accessible
    customPromptSection?.classList.remove('inactive');
    modesSection?.classList.remove('inactive');

    window.scrollTo(0, 0);
  });
}
