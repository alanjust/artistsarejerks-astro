export function initFormInteractions() {
  const customPromptTextarea = document.getElementById('customPrompt') as HTMLTextAreaElement;
  const modeRadios = document.querySelectorAll('input[name="analysisMode"]') as NodeListOf<HTMLInputElement>;
  const customPromptSection = document.querySelector('.custom-prompt-section') as HTMLElement;
  const modesSection = document.querySelector('.preformatted-modes-section') as HTMLElement;
  const lensSelector = document.getElementById('lensSelector') as HTMLSelectElement;
  const lensDescription = document.getElementById('lensDescription');

  // Lens Selection Handling
  lensSelector?.addEventListener('change', () => {
    const selectedOption = lensSelector.options[lensSelector.selectedIndex];
    const prompt = selectedOption.getAttribute('data-prompt');

    if (lensDescription) {
      if (prompt) {
        const preview = prompt.length > 150 ? prompt.substring(0, 150) + '...' : prompt;
        lensDescription.textContent = `Lens Prompt: "${preview}"`;
        lensDescription.style.color = 'var(--color-purple)';
      } else {
        lensDescription.textContent = 'Select a lens to see its description here.';
        lensDescription.style.color = 'var(--color-gray-5)';
      }
    }
  });

  // When user types in custom prompt, deselect all mode radios and dim modes section
  customPromptTextarea?.addEventListener('input', () => {
    const hasCustomPrompt = customPromptTextarea.value.trim().length > 0;
    if (hasCustomPrompt) {
      modeRadios.forEach(radio => {
        radio.checked = false;
      });
      modesSection?.classList.add('inactive');
      customPromptSection?.classList.remove('inactive');
    } else {
      modesSection?.classList.remove('inactive');
    }
  });

  // When user selects a mode, clear the custom prompt and dim custom prompt section
  modeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.checked) {
        if (customPromptTextarea) {
          customPromptTextarea.value = '';
        }
        customPromptSection?.classList.add('inactive');
        modesSection?.classList.remove('inactive');
      }
    });
  });
}
