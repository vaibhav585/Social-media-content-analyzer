// =============================================================================
// Analyze Page
// Orchestrates upload flow and transitions to the full AnalysisDashboard upon completion.
// =============================================================================

import { motion, AnimatePresence } from 'framer-motion';
import DropZone from '../upload/DropZone';
import FilePreview from '../upload/FilePreview';
import ProcessingStatus from '../upload/ProcessingStatus';
import TextPreview from '../upload/TextPreview';
import PlatformSelector from '../upload/PlatformSelector';
import AnalysisDashboard from './AnalysisDashboard';
import { useAnalysisStore } from '../../store/analysisStore';
import { useTextExtraction } from '../../hooks/useTextExtraction';
import { useAnalysis } from '../../hooks/useAnalysis';

export default function AnalyzePage() {
  const { uploadedFile, manualText, isAnalyzing, currentAnalysis } = useAnalysisStore();
  const { runAnalysis } = useAnalysis();

  // Start client-side OCR/PDF extraction if a file is uploaded
  useTextExtraction();

  const isExtracting = uploadedFile?.extractionStatus === 'extracting';
  const hasContent = Boolean(uploadedFile?.extractedText || manualText.trim());
  const canAnalyze = hasContent && !isExtracting && !isAnalyzing;

  // If analysis is complete, render the master dashboard
  if (currentAnalysis) {
    return <AnalysisDashboard analysis={currentAnalysis} />;
  }

  return (
    <div className="analyze-page">
      <header className="page-header">
        <h1 className="page-title">New Social Content Analysis</h1>
        <p className="page-subtitle">
          Upload a post screenshot or PDF, or paste text directly to evaluate viral and engagement potential.
        </p>
      </header>

      <div className="analyze-grid">
        {/* Left Column: Upload & Extracted Text Content */}
        <div className="analyze-col-left">
          <section className="analyze-section">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <TextPreview />
            </motion.div>

            <div style={{ marginTop: '24px' }}>
              {!uploadedFile ? <DropZone /> : <FilePreview />}
              <ProcessingStatus />
            </div>
          </section>
        </div>

        {/* Right Column: Platform Configuration & Trigger */}
        <div className="analyze-col-right">
          <section className="analyze-section">
            <PlatformSelector />

            <div className="analyze-action">
              <button
                className="btn-primary analyze-submit-btn"
                onClick={runAnalysis}
                disabled={!canAnalyze}
              >
                {isAnalyzing ? (
                  <>
                    <span className="spinner-small" />
                    <span>Evaluating Algorithm Factors...</span>
                  </>
                ) : (
                  <>
                    <span>Analyze Content Potential</span>
                    <span>✨</span>
                  </>
                )}
              </button>

              {!hasContent && !isExtracting && (
                <p className="analyze-action-hint">
                  Upload a file or paste post text to activate analysis.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
