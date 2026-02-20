import { state } from './state';

export function initExports() {
  const resultsContent = document.getElementById('resultsContent');
  const exportBtn = document.getElementById('exportMarkdown');
  const copyBtn = document.getElementById('copyToClipboard');
  const exportJSONBtn = document.getElementById('exportJSON');
  const exportPDFBtn = document.getElementById('exportPDF');

  exportBtn?.addEventListener('click', () => {
    if (!state.rawMarkdownContent) {
      alert('No analysis to export. Please run an analysis first.');
      return;
    }
    const blob = new Blob([state.rawMarkdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hidden-grammar-analysis.md';
    a.click();
    URL.revokeObjectURL(url);
  });

  copyBtn?.addEventListener('click', () => {
    if (!state.rawMarkdownContent) {
      alert('No analysis to copy. Please run an analysis first.');
      return;
    }
    navigator.clipboard.writeText(state.rawMarkdownContent).then(() => {
      alert('Analysis copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard. Please try again.');
    });
  });

  exportJSONBtn?.addEventListener('click', () => {
    if (!state.rawMarkdownContent) {
      alert('No analysis to export. Please run an analysis first.');
      return;
    }

    const jsonData = {
      metadata: state.analysisMetadata,
      analysis: {
        markdown: state.rawMarkdownContent,
        html: resultsContent?.innerHTML || ''
      },
      exportedAt: new Date().toISOString()
    };

    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hidden-grammar-analysis-${state.analysisMetadata.title.replace(/\s+/g, '-').toLowerCase() || 'artwork'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  exportPDFBtn?.addEventListener('click', () => {
    if (!state.rawMarkdownContent) {
      alert('No analysis to export. Please run an analysis first.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to export PDF');
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Hidden Grammar Analysis - ${state.analysisMetadata.title}</title>
        <style>
          @page {
            margin: 0.5in;
            size: letter;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            margin: 0;
            padding: 20px;
            max-width: 8.5in;
          }
          h1, h2, h3, h4 {
            color: #7c3aed;
            page-break-after: avoid;
          }
          h1 {
            font-size: 24px;
            border-bottom: 3px solid #7c3aed;
            padding-bottom: 10px;
            margin: 0 0 20px 0;
          }
          h2 {
            font-size: 20px;
            margin-top: 30px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 8px;
          }
          h3 {
            font-size: 16px;
            margin-top: 20px;
          }
          h4 {
            font-size: 14px;
            margin-top: 15px;
          }
          p {
            margin: 12px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            page-break-inside: avoid;
          }
          th, td {
            border: 1px solid #d1d5db;
            padding: 8px 12px;
            text-align: left;
          }
          th {
            background-color: #f3f4f6;
            font-weight: 600;
          }
          .metadata {
            background: #f9fafb;
            padding: 15px;
            border-left: 4px solid #7c3aed;
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          .metadata p {
            margin: 5px 0;
          }
          .artwork-image {
            width: 144px;
            height: 144px;
            object-fit: contain;
            display: block;
            margin: 15px 0 20px 0;
            border: 1px solid #d1d5db;
            border-radius: 4px;
          }
          ul, ol {
            margin: 12px 0;
            padding-left: 30px;
          }
          li {
            margin: 6px 0;
          }
          strong {
            color: #374151;
            font-weight: 600;
          }
          @media print {
            body {
              padding: 0;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="metadata">
          <h1>Hidden Grammar Analysis</h1>
          ${state.uploadedImageData ? `<img src="${state.uploadedImageData}" alt="Artwork" class="artwork-image">` : ''}
          <p><strong>Artwork:</strong> ${state.analysisMetadata.title}</p>
          <p><strong>Artist:</strong> ${state.analysisMetadata.artist}</p>
          ${state.analysisMetadata.year ? `<p><strong>Year:</strong> ${state.analysisMetadata.year}</p>` : ''}
          ${state.analysisMetadata.medium ? `<p><strong>Medium:</strong> ${state.analysisMetadata.medium}</p>` : ''}
          ${state.analysisMetadata.dimensions ? `<p><strong>Dimensions:</strong> ${state.analysisMetadata.dimensions}</p>` : ''}
          <p><strong>Analysis Mode:</strong> ${state.analysisMetadata.mode}</p>
          ${state.analysisMetadata.lens ? `<p><strong>Lens:</strong> ${state.analysisMetadata.lens}</p>` : ''}
          <p><strong>Analysis Date:</strong> ${new Date(state.analysisMetadata.timestamp).toLocaleString()}</p>
        </div>
        ${resultsContent?.innerHTML || ''}
        <div class="no-print" style="margin-top: 40px; text-align: center; color: #6b7280;">
          <p style="font-size: 14px; margin-bottom: 15px;">
            <strong>Ready to save as PDF?</strong>
          </p>
          <button onclick="window.print()" style="background: #7c3aed; color: white; border: none; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; margin-bottom: 10px;">
            Click Here to Print/Save as PDF
          </button>
          <p style="font-size: 12px; margin-top: 10px;">
            Or use: File → Print (⌘P) → Save as PDF
          </p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        try {
          printWindow.print();
        } catch (e) {
          console.log('Auto-print blocked - user can click button in window');
        }
      }, 750);
    };

    setTimeout(() => {
      if (printWindow && !printWindow.closed) {
        try {
          printWindow.print();
        } catch (e) {
          // Silent fail - button is available in window
        }
      }
    }, 1500);
  });
}
