// Shared state for ai-analyze modules

export const state = {
  uploadedImageData: null as string | null,

  // URL param values resolved on page load
  modeId: '',
  promptId: '',
  submodeId: '',

  // The mode-specific prompt text (from analysisModes.js, resolved client-side)
  promptText: '',

  // Dynamic field values collected at analysis time
  fields: {} as Record<string, string>,

  // All analysis outputs for copy operations
  // Index 0 = main analysis, 1+ = interrogation responses
  outputs: [] as Array<{ raw: string; html: string }>,
};
