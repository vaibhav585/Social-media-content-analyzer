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

  return (
    <div className="analyze-page dashboard-bento">
      {/* Left Column: Input & Configuration */}
      <div className="bento-sidebar">
        <header className="page-header" style={{ marginBottom: '24px' }}>
          <h1 className="page-title" style={{ fontSize: '24px' }}>New Analysis</h1>
          <p className="page-subtitle" style={{ fontSize: '14px' }}>
            Upload a post or paste text to evaluate engagement potential.
          </p>
        </header>

        <section className="analyze-section" style={{ padding: '20px' }}>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <TextPreview />
          </motion.div>

          <div style={{ marginTop: '20px' }}>
            {!uploadedFile ? <DropZone /> : <FilePreview />}
            <ProcessingStatus />
          </div>
          
          <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
            <PlatformSelector />
          </div>

          <div className="analyze-action" style={{ marginTop: '20px' }}>
            <button
              className="btn-primary analyze-submit-btn w-full"
              style={{ width: '100%', padding: '16px' }}
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
              <p className="analyze-action-hint" style={{ textAlign: 'center', marginTop: '12px' }}>
                Upload a file or paste text to activate analysis.
              </p>
            )}
          </div>
        </section>
      </div>

      {/* Right Column: Master Dashboard Results */}
      <div className="bento-main">
        {isAnalyzing ? (
          <div className="bento-empty-state">
             <div className="auth-spinner-large" />
             <h3 style={{ marginTop: '24px', fontSize: '20px', fontWeight: 600 }}>Analyzing Content...</h3>
             <p style={{ color: 'var(--text-secondary)' }}>Evaluating against algorithmic benchmarks</p>
          </div>
        ) : currentAnalysis ? (
          <AnalysisDashboard analysis={currentAnalysis} />
        ) : (
          <div className="bento-empty-state">
            <div className="empty-state-icon" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📊</div>
            <h3 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>Ready for Analysis</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
              Your results will appear here. Paste your content on the left to see viral potential, tone matching, and AI rewrites.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
