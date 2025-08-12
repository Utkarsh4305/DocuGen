import { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ProjectFile {
  path: string;
  content: string;
  size: number;
  type: string;
}

interface UploadSectionProps {
  onProjectCreated: (projectId: string) => void;
}

export default function UploadSectionRedesigned({ onProjectCreated }: UploadSectionProps) {
  const [uploadedFiles, setUploadedFiles] = useState<ProjectFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragDepth, setDragDepth] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      formData.append('zipFile', files[0]);
      formData.append('name', `Project ${new Date().toLocaleString()}`);

      const response = await apiRequest('POST', '/api/projects/upload-zip', formData);
      return response.json();
    },
    onSuccess: (data) => {
      setUploadedFiles(data.uploadResult?.files || []);
      onProjectCreated(data.project.id);
      toast({
        title: "🚀 Upload Successful!",
        description: `Analyzed ${data.uploadResult?.totalFiles} files with advanced parsing.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsUploading(false);
      setUploadProgress(0);
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select a ZIP file containing your project.",
        variant: "destructive",
      });
      return;
    }

    const file = acceptedFiles[0];
    if (!file.name.toLowerCase().endsWith('.zip')) {
      toast({
        title: "Invalid file type",
        description: "Only ZIP files are supported. Please upload a ZIP file containing your project.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Smooth progress animation
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    uploadMutation.mutate(acceptedFiles);
  }, [uploadMutation, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip'],
    },
    maxSize: 100 * 1024 * 1024,
    maxFiles: 1,
    onDragEnter: () => setDragDepth(prev => prev + 1),
    onDragLeave: () => setDragDepth(prev => prev - 1),
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileTypeIcon = (type: string) => {
    const icons = {
      javascript: { icon: 'fab fa-js-square', color: '#f7df1e' },
      typescript: { icon: 'fab fa-js-square', color: '#3178c6' },
      python: { icon: 'fab fa-python', color: '#3776ab' },
      html: { icon: 'fab fa-html5', color: '#e34f26' },
      css: { icon: 'fab fa-css3-alt', color: '#1572b6' },
      react: { icon: 'fab fa-react', color: '#61dafb' },
      vue: { icon: 'fab fa-vuejs', color: '#4fc08d' },
      default: { icon: 'fas fa-file-code', color: '#6b7280' }
    };
    return icons[type as keyof typeof icons] || icons.default;
  };

  return (
    <div className="upload-container">
      <div className="upload-header">
        <div className="upload-icon-container">
          <div className="upload-icon-orbit">
            <div className="upload-icon-core">
              <i className="fas fa-cloud-upload-alt"></i>
            </div>
            <div className="orbit-ring ring-1"></div>
            <div className="orbit-ring ring-2"></div>
            <div className="orbit-ring ring-3"></div>
          </div>
        </div>
        
        <div className="upload-text">
          <h2 className="upload-title">
            <span className="gradient-text">Upload Your Project</span>
          </h2>
          <p className="upload-subtitle">
            Transform your codebase with advanced precision
          </p>
        </div>
      </div>

      <div 
        {...getRootProps()} 
        className={`advanced-dropzone ${isDragActive ? 'active' : ''} ${isUploading ? 'uploading' : ''}`}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        
        {/* Animated Background Grid */}
        <div className="grid-background">
          {Array.from({ length: 100 }).map((_, i) => (
            <div key={i} className="grid-dot" />
          ))}
        </div>

        {/* Drop Zone Content */}
        <div className="dropzone-content">
          {!isUploading ? (
            <>
              <div className="drop-icon-container">
                <div className={`drop-icon ${isDragActive ? 'active' : ''}`}>
                  <i className="fas fa-file-archive"></i>
                  {isDragActive && (
                    <div className="drop-ripple">
                      <div className="ripple-wave"></div>
                      <div className="ripple-wave"></div>
                      <div className="ripple-wave"></div>
                    </div>
                  )}
                </div>
              </div>

              <div className="drop-text">
                {isDragActive ? (
                  <>
                    <h3 className="drop-title active">
                      <i className="fas fa-magic mr-2"></i>
                      Drop your ZIP file here!
                    </h3>
                    <p className="drop-description">
                      Release to start the code transformation
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="drop-title">
                      Drag & Drop Your ZIP File
                    </h3>
                    <p className="drop-description">
                      Or{' '}
                      <button 
                        type="button" 
                        className="browse-button"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        browse files
                      </button>
                      {' '}to get started
                    </p>
                  </>
                )}
              </div>

              <div className="upload-specs">
                <div className="spec-item">
                  <i className="fas fa-file-archive text-neon-blue"></i>
                  <span>ZIP files only</span>
                </div>
                <div className="spec-divider"></div>
                <div className="spec-item">
                  <i className="fas fa-weight-hanging text-neon-purple"></i>
                  <span>Max 100MB</span>
                </div>
                <div className="spec-divider"></div>
                <div className="spec-item">
                  <i className="fas fa-shield-alt text-neon-green"></i>
                  <span>Secure Upload</span>
                </div>
              </div>
            </>
          ) : (
            <div className="upload-progress-container">
              <div className="progress-icon">
                <div className="progress-ring">
                  <svg className="progress-svg" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.1)"
                      strokeWidth="4"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="url(#progress-gradient)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${uploadProgress * 2.51} 251`}
                      transform="rotate(-90 50 50)"
                    />
                    <defs>
                      <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00f5ff" />
                        <stop offset="100%" stopColor="#b400ff" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="progress-center">
                    <i className="fas fa-brain"></i>
                  </div>
                </div>
              </div>
              
              <div className="progress-info">
                <h3 className="progress-title">
                  <i className="fas fa-atom mr-2 animate-spin"></i>
                  Processing Your Project
                </h3>
                <p className="progress-description">
                  Analyzing code structure and dependencies...
                </p>
                <div className="progress-percentage">
                  {Math.round(uploadProgress)}%
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scan Lines Effect */}
        <div className="scan-lines">
          <div className="scan-line"></div>
          <div className="scan-line"></div>
          <div className="scan-line"></div>
        </div>
      </div>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="files-preview">
          <div className="files-header">
            <h4 className="files-title">
              <i className="fas fa-folder-open mr-2"></i>
              Analyzed Files ({uploadedFiles.length})
            </h4>
            <div className="files-badge">
              <i className="fas fa-check-circle text-neon-green mr-1"></i>
              Ready for Conversion
            </div>
          </div>
          
          <div className="files-grid">
            {uploadedFiles.slice(0, 8).map((file, index) => {
              const fileIcon = getFileTypeIcon(file.type);
              return (
                <div key={`${file.path}-${index}`} className="file-card">
                  <div className="file-icon" style={{ color: fileIcon.color }}>
                    <i className={fileIcon.icon}></i>
                  </div>
                  <div className="file-info">
                    <div className="file-name" title={file.path}>
                      {file.path.split('/').pop()}
                    </div>
                    <div className="file-size">
                      {formatFileSize(file.size)}
                    </div>
                  </div>
                  <div className="file-status">
                    <i className="fas fa-check text-neon-green"></i>
                  </div>
                </div>
              );
            })}
            
            {uploadedFiles.length > 8 && (
              <div className="file-card more-files">
                <div className="more-count">
                  +{uploadedFiles.length - 8}
                </div>
                <div className="more-text">More Files</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}