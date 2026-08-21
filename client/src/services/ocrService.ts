// =============================================================================
// OCR Service (Client-Side)
// Wraps Tesseract.js for extracting text from images in the browser.
// =============================================================================

import Tesseract from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
}

export type ProgressCallback = (progress: number) => void;

/**
 * Extracts text from an image file using Tesseract.js.
 * Provides progress updates via a callback.
 */
export async function extractTextFromImage(
  imageFile: File,
  onProgress?: ProgressCallback
): Promise<OCRResult> {
  try {
    const result = await Tesseract.recognize(
      imageFile,
      'eng',
      {
        logger: (m) => {
          if (m?.status === 'recognizing text' && onProgress && typeof m.progress === 'number') {
            onProgress(m.progress * 100);
          }
        },
      }
    );

    return {
      text: (result?.data?.text || '').trim(),
      confidence: result?.data?.confidence || 0,
    };
  } catch (error) {
    console.error('[OCR Service] Error extracting text:', error);
    throw new Error('Failed to extract text from the image.');
  }
}
