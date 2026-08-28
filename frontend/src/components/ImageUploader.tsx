import { useState, useRef } from 'react';
import type { ImageMetadata } from '../types';
import { processUploadedImage } from '../utils/mockUploadHelper';
import './ImageUploader.css';

interface ImageUploaderProps {
  onUpload: (metadata: ImageMetadata) => void;
  role: 'reference' | 'source';
}

export default function ImageUploader({ onUpload, role }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Only image files are supported in this demo.');
      return;
    }
    
    setIsProcessing(true);
    try {
      const metadata = await processUploadedImage(file);
      onUpload(metadata);
    } catch (error) {
      console.error(error);
      alert('Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div 
      className={`image-uploader ${isDragging ? 'image-uploader--dragging' : ''} ${isProcessing ? 'image-uploader--processing' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleFile(e.dataTransfer.files[0]);
        }
      }}
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />
      <div className="image-uploader__content">
        <span className="image-uploader__icon">⇧</span>
        <span className="image-uploader__text">
          {isProcessing ? 'PROCESSING METADATA...' : `UPLOAD LOCAL ${role.toUpperCase()} IMAGE`}
        </span>
        <span className="image-uploader__subtext">Drag & drop or click to browse</span>
      </div>
    </div>
  );
}
