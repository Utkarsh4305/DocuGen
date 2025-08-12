import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { Upload, FileCode, Zap, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";

interface UploadState {
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress: number;
  message?: string;
  projectId?: string;
}

const FuturisticUpload = () => {
  const [, setLocation] = useLocation();
  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle',
    progress: 0
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    if (!file.name.endsWith('.zip')) {
      setUploadState({
        status: 'error',
        progress: 0,
        message: 'Please upload a ZIP file containing your project'
      });
      return;
    }

    setUploadState({ status: 'uploading', progress: 0 });

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('zipFile', file);
      formData.append('name', file.name.replace('.zip', ''));

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadState(prev => {
          const newProgress = Math.min(prev.progress + Math.random() * 15, 90);
          return { ...prev, progress: newProgress };
        });
      }, 200);

      // Upload to backend
      const response = await fetch('/api/projects/upload-zip', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || `Upload failed with status ${response.status}`);
      }

      const result = await response.json();
      
      setUploadState({
        status: 'success',
        progress: 100,
        message: 'Project uploaded and analyzed successfully!',
        projectId: result.project.id
      });

      // Redirect to analysis page after success animation
      setTimeout(() => {
        setLocation(`/analysis/${result.project.id}`);
      }, 2000);
      
    } catch (error) {
      setUploadState({
        status: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Upload failed. Please try again.'
      });
    }
  }, [setLocation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip']
    },
    multiple: false
  });

  const resetUpload = () => {
    setUploadState({ status: 'idle', progress: 0 });
  };

  return (
    <div className="min-h-screen bg-dark-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="morphing-blob w-96 h-96 top-10 -left-20" />
        <div className="morphing-blob w-64 h-64 bottom-20 -right-10" />
        <div className="absolute inset-0 code-background opacity-20" />
      </div>

      {/* Header */}
      <motion.div
        className="relative z-10 p-6 flex items-center justify-between"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setLocation('/')}
          whileHover={{ scale: 1.05 }}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple p-[1px]">
            <div className="w-full h-full bg-dark-800 rounded-xl flex items-center justify-center">
              <FileCode className="w-5 h-5 text-neon-blue" />
            </div>
          </div>
          <span className="text-2xl font-bold gradient-text">CodeMorph</span>
        </motion.div>

        <div className="text-sm text-gray-400">
          Step 1 of 4: Upload Project
        </div>
      </motion.div>

      {/* Main Upload Area */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6">
        <motion.div
          className="w-full max-w-2xl mx-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <AnimatePresence mode="wait">
            {uploadState.status === 'idle' && (
              <motion.div
                key="upload-area"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  {...getRootProps()}
                  className={`upload-area p-16 text-center cursor-pointer ${
                    isDragActive ? 'drag-over' : ''
                  }`}
                  whileHover={{ scale: 1.02 }}
                  animate={{
                    borderColor: isDragActive 
                      ? ['rgba(0, 212, 255, 0.6)', 'rgba(139, 92, 246, 0.6)', 'rgba(0, 212, 255, 0.6)']
                      : 'rgba(0, 212, 255, 0.3)'
                  }}
                  transition={{ duration: 2, repeat: isDragActive ? Infinity : 0 }}
                >
                  <input {...getInputProps()} />
                  
                  <motion.div
                    className="flex flex-col items-center gap-6"
                    animate={{ y: isDragActive ? -10 : 0 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div
                      className="w-24 h-24 rounded-2xl bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 flex items-center justify-center"
                      animate={{ 
                        rotate: isDragActive ? [0, 10, -10, 0] : 0,
                        scale: isDragActive ? 1.1 : 1
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <Upload className="w-12 h-12 text-neon-blue" />
                    </motion.div>
                    
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-4">
                        {isDragActive ? 'Drop your project here' : 'Upload your project'}
                      </h2>
                      <p className="text-gray-400 text-lg mb-6">
                        Drag & drop a ZIP file containing your entire project
                      </p>
                      <p className="text-sm text-gray-500">
                        Supports: Frontend, Backend, Database, and Full-stack projects
                      </p>
                    </div>

                    <motion.div
                      className="glass-button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Browse Files
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}

            {uploadState.status === 'uploading' && (
              <motion.div
                key="uploading"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="glass-card p-16 text-center"
              >
                <motion.div
                  className="w-24 h-24 rounded-2xl bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 flex items-center justify-center mx-auto mb-8"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-12 h-12 text-neon-blue" />
                </motion.div>
                
                <h2 className="text-3xl font-bold text-white mb-4">Processing Your Project</h2>
                <p className="text-gray-400 text-lg mb-8">
                  Uploading and analyzing your code structure...
                </p>
                
                <div className="space-y-4">
                  <div className="progress-bar h-3">
                    <motion.div
                      className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadState.progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    {Math.round(uploadState.progress)}% complete
                  </p>
                </div>
              </motion.div>
            )}

            {uploadState.status === 'success' && (
              <motion.div
                key="success"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="glass-card p-16 text-center"
              >
                <motion.div
                  className="w-24 h-24 rounded-2xl bg-gradient-to-r from-green-500/20 to-green-400/20 flex items-center justify-center mx-auto mb-8"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                >
                  <CheckCircle className="w-12 h-12 text-green-400" />
                </motion.div>
                
                <motion.h2 
                  className="text-3xl font-bold text-white mb-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Upload Successful!
                </motion.h2>
                <motion.p 
                  className="text-gray-400 text-lg mb-8"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {uploadState.message}
                </motion.p>
                
                <motion.p 
                  className="text-sm text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  Redirecting to analysis...
                </motion.p>
              </motion.div>
            )}

            {uploadState.status === 'error' && (
              <motion.div
                key="error"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="glass-card p-16 text-center"
              >
                <motion.div
                  className="w-24 h-24 rounded-2xl bg-gradient-to-r from-red-500/20 to-red-400/20 flex items-center justify-center mx-auto mb-8"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                >
                  <AlertCircle className="w-12 h-12 text-red-400" />
                </motion.div>
                
                <h2 className="text-3xl font-bold text-white mb-4">Upload Failed</h2>
                <p className="text-gray-400 text-lg mb-8">
                  {uploadState.message}
                </p>
                
                <motion.button
                  onClick={resetUpload}
                  className="glass-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Try Again
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Upload Tips */}
        {uploadState.status === 'idle' && (
          <motion.div
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <div className="glass-card p-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-neon-blue/20 to-neon-blue/10 flex items-center justify-center mx-auto mb-4">
                <FileCode className="w-6 h-6 text-neon-blue" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Complete Projects</h3>
              <p className="text-sm text-gray-400">
                Upload your entire project folder as a ZIP file for best results
              </p>
            </div>

            <div className="glass-card p-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-neon-purple/20 to-neon-purple/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-neon-purple" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Fast Processing</h3>
              <p className="text-sm text-gray-400">
                AI-powered analysis completes in seconds, not minutes
              </p>
            </div>

            <div className="glass-card p-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-neon-pink/20 to-neon-pink/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-neon-pink" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Secure & Private</h3>
              <p className="text-sm text-gray-400">
                Your code is processed securely and never stored permanently
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FuturisticUpload;