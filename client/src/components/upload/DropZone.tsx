// =============================================================================
// DropZone Component
// Drag-and-drop file upload area using react-dropzone.
// =============================================================================

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, Image as ImageIcon } from 'lucide-react';
import { useFileUpload } from '../../hooks/useFileUpload';
import { UPLOAD_CONFIG } from '../../utils/constants';

export default function DropZone() {
  const { handleFileUpload } = useFileUpload();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    handleFileUpload(acceptedFiles);
  }, [handleFileUpload]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: UPLOAD_CONFIG.acceptedTypes,
    maxSize: UPLOAD_CONFIG.maxFileSize,
    multiple: false,
  });

  return (
    <div 
      {...getRootProps()} 
      className={`upload-dropzone ${isDragActive ? 'active' : ''} ${isDragReject ? 'reject' : ''}`}
    >
      <input {...getInputProps()} />
      
      <div className="upload-dropzone-content">
        <div className="upload-icon-pulse">
          <UploadCloud size={48} />
        </div>
        
        <h3 className="upload-title">
          {isDragActive ? 'Drop your post here...' : 'Drag & drop your post'}
        </h3>
        
        <p className="upload-subtitle">
          or click to browse from your computer
        </p>
        
        <div className="upload-hints">
          <span className="upload-hint">
            <ImageIcon size={14} /> Images (JPG, PNG)
          </span>
          <span className="upload-hint">
            <FileText size={14} /> PDFs
          </span>
          <span className="upload-hint">
            Max 10MB
          </span>
        </div>
      </div>
    </div>
  );
}
