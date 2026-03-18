import { initImageUpload } from './image-upload';
import { initPage, initAnalysis } from './analysis';
import { initInterrogation, updateChatWindowContext } from './interrogation';
import { initFeedback } from './feedback';
import { initLensModifier } from './lens-modifier';

initImageUpload();
initPage();
initAnalysis();
initInterrogation();
initFeedback();
initLensModifier();

// Set initial chat window state — no analysis yet on page load
updateChatWindowContext(false);
