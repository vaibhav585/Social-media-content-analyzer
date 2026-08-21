// =============================================================================
// useFileUpload Hook
// Validates file uploads (size, type) and creates object URLs for previews.
// =============================================================================

import { useCallback } from 'react';
import { useUIStore } from '../store/uiStore';
import { useAnalysisStore } from '../store/analysisStore';
import { UPLOAD_CONFIG } from '../utils/constants';

export function useFileUpload() {
  const { addToast } = useUIStore();
  const { setUploadedFile, reset } = useAnalysisStore();

  const handleFileUpload = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];

    // Validate size
    if (file.size > UPLOAD_CONFIG.maxFileSize) {
      addToast({
        type: 'error',
        title: 'File too large',
        message: 'Please upload a file smaller than 10MB.',
      });
      return;
    }

    // Reset previous analysis state
    reset();

    // Create object URL for preview (images or PDFs)
    const preview = URL.createObjectURL(file);

    setUploadedFile({
      file,
      preview,
      extractedText: null,
      extractionProgress: 0,
      extractionStatus: 'idle',
      extractionError: null,
    });
  }, [addToast, setUploadedFile, reset]);

  return { handleFileUpload };
}
