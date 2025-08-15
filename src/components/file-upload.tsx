'use client';

import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';

interface UploadedFile {
  name: string;
  size: number;
  uploadedAt: Date;
  status: 'uploading' | 'success' | 'error';
}

const FileUpload: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    const newFile: UploadedFile = {
      name: file.name,
      size: file.size,
      uploadedAt: new Date(),
      status: 'uploading',
    };

    setUploadedFiles(prev => [...prev, newFile]);

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('https://pdf-rag-api.vercel.app/upload/pdf', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        setUploadedFiles(prev =>
          prev.map(f =>
            f.name === file.name && f.status === 'uploading'
              ? { ...f, status: 'success' }
              : f
          )
        );
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadedFiles(prev =>
        prev.map(f =>
          f.name === file.name && f.status === 'uploading'
            ? { ...f, status: 'error' }
            : f
        )
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileUploadButtonClick = () => {
    const el = document.createElement('input');
    el.setAttribute('type', 'file');
    el.setAttribute('accept', '.pdf');
    el.addEventListener('change', async (event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        await handleFileUpload(file);
      }
    });
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        await handleFileUpload(file);
      }
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 p-6">
      {/* Upload Area */}
      <Card
        className={`
          relative overflow-hidden transition-all duration-300 cursor-pointer
          ${dragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 scale-105'
            : 'border-dashed border-2 border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500'
          }
          ${isUploading ? 'pointer-events-none opacity-75' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleFileUploadButtonClick}
      >
        <div className="p-12 text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-white" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
              Upload PDF Document
            </h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
              Drag and drop your PDF file here, or click to browse and select a file
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800">
              PDF Only
            </Badge>
            <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800">
              Max 50MB
            </Badge>
          </div>

          {isUploading && (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-blue-600 font-medium">Uploading...</span>
              </div>
              <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
            </div>
          )}
        </div>

        {dragActive && (
          <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
            <div className="text-blue-600 font-semibold text-lg">
              Drop your PDF file here
            </div>
          </div>
        )}
      </Card>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            Uploaded Documents
          </h4>
          <div className="space-y-3">
            {uploadedFiles.map((file, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <FileText className="w-8 h-8 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {file.name}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <span>{formatFileSize(file.size)}</span>
                        <span>
                          {file.uploadedAt.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {file.status === 'uploading' && (
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {file.status === 'success' && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {file.status === 'error' && (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <Card className="p-4 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
        <div className="space-y-3">
          <h5 className="font-medium text-slate-800 dark:text-slate-200">
            How it works:
          </h5>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-start gap-2">
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                1
              </span>
              <span>Upload your PDF document using the area above</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                2
              </span>
              <span>Wait for the document to be processed and indexed</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                3
              </span>
              <span>Start asking questions about the content in the chat</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FileUpload;