// =============================================================================
// Processing Status
// Shows progress bar and status text during client-side text extraction.
// =============================================================================

import { motion } from 'framer-motion';
import { useAnalysisStore } from '../../store/analysisStore';

export default function ProcessingStatus() {
  const { uploadedFile } = useAnalysisStore();

  if (!uploadedFile || uploadedFile.extractionStatus === 'idle' || uploadedFile.extractionStatus === 'done') {
    return null;
  }

  const { extractionStatus, extractionProgress, extractionError } = uploadedFile;

  return (
    <motion.div 
      className="processing-status-card"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
    >
      {extractionStatus === 'error' ? (
        <div className="processing-error">
          <span className="processing-error-icon">⚠️</span>
          <p>{extractionError || 'Failed to extract text.'}</p>
        </div>
      ) : (
        <div className="processing-active">
          <div className="processing-header">
            <span className="processing-spinner" />
            <span className="processing-text">
              {extractionProgress < 100 ? 'Extracting text from file...' : 'Finalizing extraction...'}
            </span>
            <span className="processing-percent">{Math.round(extractionProgress)}%</span>
          </div>
          
          <div className="processing-bar-container">
            <motion.div 
              className="processing-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${extractionProgress}%` }}
              transition={{ ease: 'linear' }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
