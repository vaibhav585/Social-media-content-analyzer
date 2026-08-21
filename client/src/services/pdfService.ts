// =============================================================================
// PDF Service (Client-Side)
// Wraps PDF.js for extracting text from PDFs in the browser.
// =============================================================================

import * as pdfjsLib from 'pdfjs-dist';

// Use standard CDN worker fallback to ensure zero bundler worker issues in dev & prod
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
}

export type ProgressCallback = (progress: number) => void;

/**
 * Extracts text from a PDF file using PDF.js.
 * Provides progress updates per page.
 */
export async function extractTextFromPDF(
  pdfFile: File,
  onProgress?: ProgressCallback
): Promise<string> {
  try {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdf = await loadingTask.promise;
    
    const numPages = pdf.numPages;
    let extractedText = '';

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .join(' ');
        
      extractedText += pageText + '\n\n';

      if (onProgress) {
        onProgress((pageNum / numPages) * 100);
      }
    }

    return extractedText.trim();
  } catch (error) {
    console.error('[PDF Service] Error extracting text:', error);
    throw new Error('Failed to extract text from the PDF.');
  }
}
