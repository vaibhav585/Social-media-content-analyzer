// =============================================================================
// File Preview
// Shows thumbnail and metadata for the uploaded file.
// =============================================================================

import { X, FileText, ImageIcon } from 'lucide-react';
import { useAnalysisStore } from '../../store/analysisStore';
import { formatFileSize } from '../../utils/formatters';

export default function FilePreview() {
  const { uploadedFile, setUploadedFile } = useAnalysisStore();

  if (!uploadedFile) return null;

  const isImage = uploadedFile.file.type.startsWith('image/');

  return (
    <div className="file-preview-card">
      <div className="file-preview-thumbnail">
        {isImage ? (
          <img src={uploadedFile.preview} alt="Preview" />
        ) : (
          <div className="file-preview-icon">
            <FileText size={32} />
          </div>
        )}
      </div>
      
      <div className="file-preview-info">
        <h4 className="file-preview-name">{uploadedFile.file.name}</h4>
        <p className="file-preview-meta">
          {formatFileSize(uploadedFile.file.size)} • {isImage ? 'Image' : 'PDF Document'}
        </p>
      </div>

      <button
        className="file-preview-remove"
        onClick={() => setUploadedFile(null)}
        aria-label="Remove file"
      >
        <X size={20} />
      </button>
    </div>
  );
}
