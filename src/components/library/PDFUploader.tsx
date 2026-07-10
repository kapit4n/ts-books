import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText } from 'lucide-react';
import './PDFUploader.css';

interface PDFUploaderProps {
  onFilesSelected: (files: File[]) => void;
}

export const PDFUploader: React.FC<PDFUploaderProps> = ({ onFilesSelected }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files).filter(
        (f) => f.type === 'application/pdf'
      );
      if (files.length > 0) onFilesSelected(files);
    },
    [onFilesSelected]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(
      (f) => f.type === 'application/pdf'
    );
    if (files.length > 0) onFilesSelected(files);
    e.target.value = '';
  };

  return (
    <motion.div
      className={`pdf-uploader ${isDragging ? 'pdf-uploader-dragging' : ''}`}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      whileHover={{ borderColor: 'var(--color-primary)' }}
    >
      <div className="pdf-uploader-icon">
        <Upload size={48} />
      </div>
      <h3 className="pdf-uploader-title">
        {isDragging ? 'Drop your PDFs here' : 'Import PDF Books'}
      </h3>
      <p className="pdf-uploader-subtitle">
        Drag & drop PDF files here, or click to browse
      </p>
      <label className="pdf-uploader-btn">
        <FileText size={18} />
        Browse Files
        <input
          type="file"
          accept=".pdf,application/pdf"
          multiple
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
      </label>
      <p className="pdf-uploader-formats">PDF only · Maximum size: 50MB</p>
    </motion.div>
  );
};
