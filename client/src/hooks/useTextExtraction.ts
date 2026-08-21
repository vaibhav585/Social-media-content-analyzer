// =============================================================================
// Text Extraction Hook
// Automatically triggers OCR or PDF extraction when a file is uploaded.
// =============================================================================

import { useEffect } from 'react';
import { useAnalysisStore } from '../store/analysisStore';
import { extractTextFromImage } from '../services/ocrService';
import { extractTextFromPDF } from '../services/pdfService';

export function useTextExtraction() {
  const { 
    uploadedFile, 
    setExtractedText, 
    setExtractionProgress, 
    setExtractionStatus, 
    setExtractionError 
  } = useAnalysisStore();

  useEffect(() => {
    // Only run if there's a file and extraction hasn't started
    if (!uploadedFile || uploadedFile.extractionStatus !== 'idle') return;

    const extract = async () => {
      setExtractionStatus('extracting');
      setExtractionProgress(0);
      setExtractionError(null);

      try {
        let text = '';
        const fileType = uploadedFile.file.type;

        if (fileType.startsWith('image/')) {
          // Use Tesseract OCR
          const result = await extractTextFromImage(uploadedFile.file, (progress) => {
            setExtractionProgress(progress);
          });
          text = result.text;
        } else if (fileType === 'application/pdf') {
          // Use PDF.js
          text = await extractTextFromPDF(uploadedFile.file, (progress) => {
            setExtractionProgress(progress);
          });
        } else {
          throw new Error('Unsupported file type for extraction.');
        }

        if (!text || text.trim() === '') {
          throw new Error('No text could be found in the file.');
        }

        setExtractedText(text);
        setExtractionStatus('done');
      } catch (error: any) {
        setExtractionError(error.message || 'Failed to extract text.');
        setExtractionStatus('error');
      }
    };

    extract();
  }, [
    uploadedFile,
    setExtractedText,
    setExtractionProgress,
    setExtractionStatus,
    setExtractionError
  ]);
}
