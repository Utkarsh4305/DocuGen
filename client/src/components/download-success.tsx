import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, CheckCircle, FileCode, Zap, Share2, Star, Github, Home, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation, useRoute } from "wouter";

interface ConversionSummary {
  originalFrameworks: string[];
  targetFrameworks: string[];
  filesConverted: number;
  linesProcessed: number;
  conversionTime: string;
  downloadSize: string;
}

const DownloadSuccessPage = () => {
  const [, setLocation] = useLocation();
  const [match] = useRoute("/download/:projectId");
  const projectId = match?.projectId;

  const [isDownloadReady, setIsDownloadReady] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  // Mock conversion summary data
  const conversionSummary: ConversionSummary = {
    originalFrameworks: ['React', 'Node.js', 'MongoDB'],
    targetFrameworks: ['Vue.js', 'FastAPI', 'PostgreSQL'],
    filesConverted: 247,
    linesProcessed: 18543,
    conversionTime: '2m 34s',
    downloadSize: '15.7 MB'
  };

  useEffect(() => {
    // Simulate download preparation
    const prepareDownload = async () => {
      const interval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsDownloadReady(true);
            setShowConfetti(true);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 100);
    };

    if (projectId) {
      prepareDownload();
    }
  }, [projectId]);

  const handleDownload = () => {
    // In a real app, this would trigger the actual download
    const link = document.createElement('a');
    link.href = '/api/download/' + projectId; // Mock endpoint
    link.download = `converted-project-${projectId}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const startNewConversion = () => {
    setLocation('/upload');
  };

  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
    duration: Math.random() * 3 + 2,
  }));

  return (
    <div className="min-h-screen bg-dark-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="morphing-blob w-96 h-96 top-10 -left-20" />
        <div className="morphing-blob w-80 h-80 bottom-20 -right-10" />
        <div className="absolute inset-0 code-background opacity-20" />
      </div>

      {/* Confetti Effect */}
      <AnimatePresence>
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute w-2 h-2 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  y: [0, -100, -200]
                }}
                transition={{
                  duration: particle.duration,
                  delay: particle.delay,
                  repeat: Infinity,
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          className="p-6 flex items-center justify-between"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
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
            Conversion Complete
          </div>
        </motion.div>

        <div className="px-6 pb-8">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Success Header */}
            <div className="text-center mb-12">
              <motion.div
                className="w-32 h-32 rounded-full bg-gradient-to-r from-green-500/20 to-green-400/20 flex items-center justify-center mx-auto mb-8"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.3 }}
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <CheckCircle className="w-16 h-16 text-green-400" />
                </motion.div>
              </motion.div>
              
              <motion.h1 
                className="text-5xl font-bold mb-4"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <span className="gradient-text neon-text">Conversion</span>
                <br />
                <span className="text-white">Complete!</span>
              </motion.h1>
              
              <motion.p
                className="text-xl text-gray-400 max-w-2xl mx-auto"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                Your project has been successfully transformed to the target frameworks.
                Ready for download!
              </motion.p>
            </div>

            {/* Conversion Summary */}
            <motion.div
              className="glass-card p-8 mb-8"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Zap className="w-6 h-6 text-neon-blue" />
                Conversion Summary
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Before & After */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Framework Migration</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-400 mb-2">From:</div>
                      <div className="flex flex-wrap gap-2">
                        {conversionSummary.originalFrameworks.map((framework) => (
                          <Badge key={framework} variant="secondary" className="bg-red-500/20 text-red-300">
                            {framework}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-2">To:</div>
                      <div className="flex flex-wrap gap-2">
                        {conversionSummary.targetFrameworks.map((framework) => (
                          <Badge key={framework} variant="secondary" className="bg-green-500/20 text-green-300">
                            {framework}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Processing Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Files Converted:</span>
                      <span className="text-white font-mono">{conversionSummary.filesConverted.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Lines Processed:</span>
                      <span className="text-white font-mono">{conversionSummary.linesProcessed.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Processing Time:</span>
                      <span className="text-white font-mono">{conversionSummary.conversionTime}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Download Size:</span>
                      <span className="text-white font-mono">{conversionSummary.downloadSize}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Download Section */}
            <AnimatePresence>
              {!isDownloadReady ? (
                <motion.div
                  key="preparing"
                  className="glass-card p-8 text-center"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                >
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 flex items-center justify-center mx-auto mb-6">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Download className="w-8 h-8 text-neon-blue" />
                    </motion.div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-4">Preparing Download</h3>
                  <p className="text-gray-400 mb-6">
                    Packaging your converted project...
                  </p>
                  
                  <div className="max-w-md mx-auto">
                    <div className="progress-bar h-3 mb-4">
                      <motion.div
                        className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${downloadProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      {Math.round(downloadProgress)}% complete
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="ready"
                  className="glass-card p-8 text-center"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div
                    className="w-20 h-20 rounded-2xl bg-gradient-to-r from-green-500/20 to-green-400/20 flex items-center justify-center mx-auto mb-6"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Download className="w-10 h-10 text-green-400" />
                  </motion.div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4">Ready to Download!</h3>
                  <p className="text-gray-400 mb-8">
                    Your converted project is ready. Click below to download the ZIP file.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <motion.button
                      onClick={handleDownload}
                      className="gradient-border"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="bg-dark-800 px-8 py-4 rounded-xl flex items-center gap-3 font-semibold text-lg">
                        <Download className="w-6 h-6 text-green-400" />
                        Download Project
                      </div>
                    </motion.button>
                    
                    <motion.button
                      onClick={startNewConversion}
                      className="glass-button flex items-center gap-3"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <RefreshCcw className="w-5 h-5" />
                      Convert Another Project
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Share & Feedback */}
            {isDownloadReady && (
              <motion.div
                className="mt-8 text-center"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Share Your Experience</h3>
                  <p className="text-gray-400 mb-6">
                    Love CodeMorph? Help us spread the word and improve the platform!
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-4">
                    <motion.button
                      className="glass-button flex items-center gap-2 text-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Star className="w-4 h-4" />
                      Rate Us
                    </motion.button>
                    
                    <motion.button
                      className="glass-button flex items-center gap-2 text-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </motion.button>
                    
                    <motion.button
                      className="glass-button flex items-center gap-2 text-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Github className="w-4 h-4" />
                      GitHub
                    </motion.button>
                    
                    <motion.button
                      onClick={() => setLocation('/')}
                      className="glass-button flex items-center gap-2 text-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Home className="w-4 h-4" />
                      Home
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DownloadSuccessPage;