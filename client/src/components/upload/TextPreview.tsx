// =============================================================================
// Text Preview
// Editable text area showing extracted text before analysis.
// =============================================================================

import { useAnalysisStore } from '../../store/analysisStore';

export default function TextPreview() {
  const { uploadedFile, manualText, setManualText } = useAnalysisStore();

  const textToDisplay = uploadedFile?.extractedText ?? manualText;
  const isEditing = !uploadedFile;

  return (
    <div className="text-preview-container">
      <div className="text-preview-header">
        <h4 className="text-preview-title">
          {uploadedFile ? 'Extracted Content' : 'Or paste your content directly'}
        </h4>
        {uploadedFile && (
          <span className="text-preview-badge">Auto-extracted</span>
        )}
      </div>
      
      <textarea
        className="text-preview-textarea"
        value={textToDisplay}
        onChange={(e) => setManualText(e.target.value)}
        placeholder="Type or paste the social media post text here..."
        readOnly={!isEditing && uploadedFile !== null}
        rows={12}
      />
      
      {!isEditing && (
        <p className="text-preview-hint">
          Text extracted automatically from your file. If incorrect, please upload a clearer image.
        </p>
      )}
    </div>
  );
}
