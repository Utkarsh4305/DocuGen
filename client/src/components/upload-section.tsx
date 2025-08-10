import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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

export default function UploadSection({ onProjectCreated }: UploadSectionProps) {
  const [uploadedFiles, setUploadedFiles] = useState<ProjectFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      // Only handle the first file (ZIP file)
      formData.append('zipFile', files[0]);
      formData.append('name', `Project ${new Date().toLocaleString()}`);

      const response = await apiRequest('POST', '/api/projects/upload-zip', formData);
      return response.json();
    },
    onSuccess: (data) => {
      setUploadedFiles(data.uploadResult?.files || []);
      onProjectCreated(data.project.id);
      toast({
        title: "Upload successful",
        description: `Uploaded ${data.uploadResult?.totalFiles} files successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
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

    // Validate ZIP file
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
    setUploadProgress(25);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
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
    maxSize: 100 * 1024 * 1024, // 100MB for ZIP files
    maxFiles: 1, // Only one ZIP file at a time
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'javascript':
        return 'fab fa-js-square text-yellow-500';
      case 'typescript':
        return 'fab fa-js-square text-blue-500';
      case 'python':
        return 'fab fa-python text-green-500';
      case 'html':
        return 'fab fa-html5 text-orange-500';
      case 'css':
        return 'fab fa-css3-alt text-blue-500';
      case 'json':
        return 'fas fa-file-code text-gray-500';
      default:
        return 'fas fa-file-code text-gray-500';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <Card data-testid="card-upload">
      <CardHeader>
        <CardTitle className="flex items-center">
          <i className="fas fa-upload text-primary mr-2"></i>
          Project Upload
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Drag & Drop Area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-300 hover:border-primary'
          }`}
          data-testid="dropzone-upload"
        >
          <input {...getInputProps()} />
          <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-600 mb-2">
            {isDragActive 
              ? "Drop your ZIP file here..."
              : "Drag & drop your project ZIP file or"
            }
          </p>
          <Button 
            type="button" 
            disabled={isUploading}
            data-testid="button-browse-files"
          >
            <i className="fas fa-folder-open mr-2"></i>
            Browse Files
          </Button>
          <p className="text-xs text-gray-500 mt-4">
            Only ZIP files are accepted. Maximum file size: 100MB
          </p>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="mt-4">
            <div className="flex justify-between text-sm font-medium text-gray-900 mb-2">
              <span>Uploading files...</span>
              <span data-testid="text-upload-progress">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" data-testid="progress-upload" />
          </div>
        )}

        {/* File List */}
        {uploadedFiles.length > 0 && (
          <div className="mt-4 space-y-2" data-testid="list-uploaded-files">
            <h3 className="font-medium text-gray-900">Uploaded Files:</h3>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {uploadedFiles.map((file, index) => (
                <div 
                  key={index}
                  className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded"
                  data-testid={`file-item-${index}`}
                >
                  <i className={`${getFileIcon(file.type)} mr-2`}></i>
                  <span className="flex-1 truncate">{file.path}</span>
                  <span className="text-xs" data-testid={`file-size-${index}`}>
                    {formatFileSize(file.size)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
