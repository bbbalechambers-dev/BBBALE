import React, { useRef, useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X, Eye, Trash2 } from 'lucide-react';
import { UploadedFileMetadata } from '../../types';

interface LocalFilePickerProps {
  label?: string;
  accept?: string;
  multiple?: boolean;
  maxSizeMb?: number;
  category?: string;
  linkedEntityId?: string;
  linkedEntityType?: string;
  uploadedBy?: string;
  branchId?: string;
  currentFiles?: UploadedFileMetadata[];
  onUploadComplete: (files: UploadedFileMetadata[]) => void;
  onRemoveFile?: (fileId: string) => void;
  className?: string;
  compact?: boolean;
}

export const LocalFilePicker: React.FC<LocalFilePickerProps> = ({
  label = 'Choose File from Device',
  accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.webp',
  multiple = false,
  maxSizeMb = 50,
  category = 'General Document',
  linkedEntityId = 'GENERAL',
  linkedEntityType = 'Generic',
  uploadedBy = 'User',
  branchId = 'HQ',
  currentFiles = [],
  onUploadComplete,
  onRemoveFile,
  className = '',
  compact = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<UploadedFileMetadata | null>(null);

  const handleButtonClick = () => {
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const processFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (!multiple && files.length > 1) {
      setErrorMessage('Please select only one file.');
      return;
    }

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileSizeMb = file.size / (1024 * 1024);
      if (fileSizeMb > maxSizeMb) {
        setErrorMessage(`File "${file.name}" exceeds maximum allowed size of ${maxSizeMb} MB.`);
        return;
      }
      validFiles.push(file);
    }

    setIsUploading(true);
    setUploadProgress(15);

    // Simulate progress and convert to Base64 with metadata
    const progressTimer = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressTimer);
          return 90;
        }
        return prev + 25;
      });
    }, 100);

    const promises = validFiles.map((file, idx) => {
      return new Promise<UploadedFileMetadata>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = (e.target?.result as string) || '';
          const meta: UploadedFileMetadata = {
            id: `FILE-${Date.now()}-${Math.floor(Math.random() * 1000)}-${idx}`,
            originalName: file.name,
            fileType: file.type || 'application/octet-stream',
            fileSize: file.size,
            uploadDate: new Date().toISOString(),
            uploadedBy,
            branchId,
            linkedEntityId,
            linkedEntityType,
            dataUrl,
            checksum: `SHA256-${Math.random().toString(36).substring(2, 12)}`,
            version: 1,
            category
          };
          resolve(meta);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(uploadedMetas => {
      clearInterval(progressTimer);
      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        onUploadComplete(uploadedMetas);
      }, 300);
    }).catch(() => {
      clearInterval(progressTimer);
      setIsUploading(false);
      setErrorMessage('Upload failed while reading file from device.');
    });
  };

  const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Hidden Native File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleNativeChange}
        accept={accept}
        multiple={multiple}
        className="hidden"
      />

      {/* Choose File Action Container */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleButtonClick}
            disabled={isUploading}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md border border-[#c9a227] bg-[#1a2a4a] text-white hover:bg-[#111e38] transition-all shadow-sm active:scale-[0.99] disabled:opacity-50 cursor-pointer ${
              compact ? 'text-xs px-3 py-1.5' : ''
            }`}
          >
            <Upload className={compact ? 'w-3.5 h-3.5 text-[#c9a227]' : 'w-4 h-4 text-[#c9a227]'} />
            <span>{label}</span>
          </button>
          
          <span className="text-xs text-[#5a5a5a]">
            Max {maxSizeMb}MB ({accept.split(',').join(', ')})
          </span>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 p-2.5 rounded border border-red-200 mt-1">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="ml-auto text-red-500 hover:text-red-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="w-full bg-gray-100 rounded-full h-2 mt-2 overflow-hidden border border-gray-200">
            <div
              className="bg-[#c9a227] h-2 transition-all duration-200 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
            <div className="text-[11px] text-[#5a5a5a] text-right mt-1">
              Uploading from device... {uploadProgress}%
            </div>
          </div>
        )}

        {/* Existing / Uploaded Files List */}
        {currentFiles.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {currentFiles.map((file) => {
              const isImage = file.fileType.startsWith('image/') || file.originalName.match(/\.(jpg|jpeg|png|webp)$/i);
              return (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-2 rounded-md bg-white border border-[#e0ddd5] shadow-xs text-xs hover:border-[#c9a227] transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {isImage && file.dataUrl ? (
                      <img
                        src={file.dataUrl}
                        alt={file.originalName}
                        className="w-8 h-8 rounded object-cover border border-gray-200 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded bg-[#1a2a4a]/5 text-[#1a2a4a] flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-[#c9a227]" />
                      </div>
                    )}
                    <div className="truncate">
                      <div className="font-medium text-[#1c1c1c] truncate">{file.originalName}</div>
                      <div className="text-[10px] text-[#5a5a5a]">
                        {formatFileSize(file.fileSize)} · {new Date(file.uploadDate).toLocaleDateString('en-GB')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 ml-2">
                    {isImage && (
                      <button
                        type="button"
                        onClick={() => setPreviewFile(file)}
                        className="p-1 text-gray-500 hover:text-[#1a2a4a] rounded hover:bg-gray-100"
                        title="Preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onRemoveFile && (
                      <button
                        type="button"
                        onClick={() => onRemoveFile(file.id)}
                        className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50"
                        title="Remove file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-4 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <span className="font-semibold text-sm truncate">{previewFile.originalName}</span>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-1 text-gray-500 hover:text-gray-900 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 flex justify-center max-h-[70vh] overflow-auto">
              <img
                src={previewFile.dataUrl}
                alt={previewFile.originalName}
                className="max-h-[60vh] rounded shadow-sm object-contain"
              />
            </div>
            <div className="text-right pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setPreviewFile(null)}
                className="px-4 py-1.5 text-xs font-semibold bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
