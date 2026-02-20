// Shared state for ai-analyze modules

export interface AnalysisMetadata {
  title: string;
  artist: string;
  year: string;
  medium: string;
  dimensions: string;
  mode: string;
  lens: string;
  customPrompt: string;
  timestamp: string;
}

export const state = {
  uploadedImageData: null as string | null,
  rawMarkdownContent: '',
  analysisMetadata: {
    title: '',
    artist: '',
    year: '',
    medium: '',
    dimensions: '',
    mode: '',
    lens: '',
    customPrompt: '',
    timestamp: ''
  } as AnalysisMetadata
};
