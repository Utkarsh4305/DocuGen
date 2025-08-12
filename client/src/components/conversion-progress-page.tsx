import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, FileCode, Zap, CheckCircle, Download, ArrowLeft, Cpu, Database, Globe, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLocation, useRoute } from "wouter";

interface ConversionStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  icon: React.ReactNode;
  duration?: number;
}

interface ConversionLog {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

const ConversionProgressPage = () => {
  const [, setLocation] = useLocation();
  const [match] = useRoute("/progress/:projectId");
  const projectId = match?.projectId;

  const [overallProgress, setOverallProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [logs, setLogs] = useState<ConversionLog[]>([]);

  const [steps, setSteps] = useState<ConversionStep[]>([
    {
      id: 'parsing',
      name: 'Parsing Source Code',
      description: 'Analyzing AST structure and dependencies',
      status: 'pending',
      progress: 0,
      icon: <Code2 className="w-5 h-5" />,
      duration: 2000
    },
    {
      id: 'uir',
      name: 'Generating UIR',
      description: 'Creating Universal Intermediate Representation',
      status: 'pending',
      progress: 0,
      icon: <Cpu className="w-5 h-5" />,
      duration: 3000
    },
    {
      id: 'frontend',
      name: 'Converting Frontend',
      description: 'Transforming UI components and logic',
      status: 'pending',
      progress: 0,
      icon: <Globe className="w-5 h-5" />,
      duration: 4000
    },
    {
      id: 'backend',
      name: 'Converting Backend',
      description: 'Migrating server-side code and APIs',
      status: 'pending',
      progress: 0,
      icon: <Server className="w-5 h-5" />,
      duration: 3500
    },
    {
      id: 'database',
      name: 'Updating Database',
      description: 'Converting schemas and queries',
      status: 'pending',
      progress: 0,
      icon: <Database className="w-5 h-5" />,
      duration: 2500
    },
    {
      id: 'bundling',
      name: 'Bundling Project',
      description: 'Packaging converted code for download',
      status: 'pending',
      progress: 0,
      icon: <FileCode className="w-5 h-5" />,
      duration: 1500
    }
  ]);

  const addLog = (message: string, type: ConversionLog['type'] = 'info') => {
    const newLog: ConversionLog = {
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    };
    setLogs(prev => [...prev, newLog]);
  };

  useEffect(() => {
    let timeouts: NodeJS.Timeout[] = [];
    
    const processSteps = async () => {
      addLog('Starting code conversion process...', 'info');
      
      for (let i = 0; i < steps.length; i++) {
        // Start step
        setCurrentStep(i);
        setSteps(prev => prev.map((step, index) => 
          index === i ? { ...step, status: 'processing' as const } : step
        ));
        
        addLog(`Starting ${steps[i].name.toLowerCase()}...`, 'info');
        
        // Simulate progress for this step
        const stepDuration = steps[i].duration || 2000;
        const progressInterval = setInterval(() => {
          setSteps(prev => prev.map((step, index) => {
            if (index === i && step.progress < 100) {
              const newProgress = Math.min(step.progress + Math.random() * 20, 100);
              return { ...step, progress: newProgress };
            }
            return step;
          }));
        }, stepDuration / 10);
        
        // Wait for step completion
        await new Promise(resolve => {
          const timeout = setTimeout(() => {
            clearInterval(progressInterval);
            setSteps(prev => prev.map((step, index) => 
              index === i ? { ...step, status: 'completed' as const, progress: 100 } : step
            ));
            addLog(`${steps[i].name} completed successfully`, 'success');
            resolve(void 0);
          }, stepDuration);
          timeouts.push(timeout);
        });
        
        // Update overall progress
        setOverallProgress(((i + 1) / steps.length) * 100);
      }
      
      // Mark as complete
      addLog('Code conversion completed successfully!', 'success');
      setIsComplete(true);
    };
    
    if (projectId) {
      processSteps();
    }
    
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [projectId]);

  const getStepStatusColor = (status: ConversionStep['status']) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'processing': return 'text-blue-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getLogTypeColor = (type: ConversionLog['type']) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="morphing-blob w-96 h-96 top-10 -left-20" />
        <div className="morphing-blob w-80 h-80 bottom-20 -right-10" />
        <div className="morphing-blob w-64 h-64 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute inset-0 code-background opacity-20" />
      </div>

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

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">
              Step 4 of 4: Converting Code
            </div>
            <motion.button
              onClick={() => setLocation(`/conversion/${projectId}`)}
              className="glass-button text-sm flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </motion.button>
          </div>
        </motion.div>

        <div className="px-6 pb-8">
          {/* Main Progress Section */}
          <motion.div
            className="max-w-6xl mx-auto"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Overall Progress */}
            <div className="glass-card p-8 mb-8">
              <div className="text-center mb-8">
                <motion.h1 
                  className="text-4xl font-bold mb-4"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="gradient-text neon-text">Converting</span>
                  <span className="text-white"> Your Project</span>
                </motion.h1>
                <p className="text-xl text-gray-400">
                  AI is transforming your code to the target frameworks
                </p>
              </div>

              <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-white">Overall Progress</span>
                  <span className="text-lg font-mono text-neon-blue">
                    {Math.round(overallProgress)}%
                  </span>
                </div>
                
                <div className="progress-bar h-4 mb-4">
                  <motion.div
                    className="progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${overallProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                
                <div className="text-center">
                  <AnimatePresence mode="wait">
                    {!isComplete ? (
                      <motion.p
                        key="processing"
                        className="text-gray-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        Processing step {currentStep + 1} of {steps.length}...
                      </motion.p>
                    ) : (
                      <motion.div
                        key="completed"
                        className="flex items-center justify-center gap-3 text-green-400"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <CheckCircle className="w-6 h-6" />
                        <span className="text-lg font-semibold">Conversion Complete!</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Step-by-Step Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Steps */}
              <div className="glass-card p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Zap className="w-6 h-6 text-neon-blue" />
                  Conversion Steps
                </h2>
                
                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <motion.div
                      key={step.id}
                      className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-300 ${
                        step.status === 'processing' 
                          ? 'bg-blue-500/10 border border-blue-500/30' 
                          : step.status === 'completed'
                          ? 'bg-green-500/10 border border-green-500/30'
                          : 'bg-dark-800'
                      }`}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        step.status === 'processing' 
                          ? 'bg-blue-500/20 text-blue-400' 
                          : step.status === 'completed'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-dark-700 text-gray-400'
                      }`}>
                        <AnimatePresence mode="wait">
                          {step.status === 'processing' ? (
                            <motion.div
                              key="processing"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              {step.icon}
                            </motion.div>
                          ) : step.status === 'completed' ? (
                            <motion.div
                              key="completed"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <CheckCircle className="w-5 h-5" />
                            </motion.div>
                          ) : (
                            <motion.div key="pending">
                              {step.icon}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className={`font-semibold ${getStepStatusColor(step.status)}`}>
                          {step.name}
                        </h3>
                        <p className="text-sm text-gray-400 mb-2">
                          {step.description}
                        </p>
                        
                        {step.status !== 'pending' && (
                          <div className="w-full bg-dark-700 rounded-full h-2">
                            <motion.div
                              className="h-2 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple"
                              initial={{ width: 0 }}
                              animate={{ width: `${step.progress}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Live Logs */}
              <div className="glass-card p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Code2 className="w-6 h-6 text-neon-purple" />
                  Live Logs
                </h2>
                
                <div className="bg-dark-800 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
                  <AnimatePresence>
                    {logs.map((log, index) => (
                      <motion.div
                        key={index}
                        className="mb-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <span className="text-gray-500">[{log.timestamp}]</span>
                        <span className={`ml-2 ${getLogTypeColor(log.type)}`}>
                          {log.message}
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Download Section */}
            <AnimatePresence>
              {isComplete && (
                <motion.div
                  className="text-center"
                  initial={{ scale: 0.9, opacity: 0, y: 50 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="glass-card p-8">
                    <motion.div
                      className="w-24 h-24 rounded-2xl bg-gradient-to-r from-green-500/20 to-green-400/20 flex items-center justify-center mx-auto mb-6"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <CheckCircle className="w-12 h-12 text-green-400" />
                    </motion.div>
                    
                    <h2 className="text-3xl font-bold text-white mb-4">
                      Conversion Successful!
                    </h2>
                    <p className="text-xl text-gray-400 mb-8">
                      Your project has been successfully converted to the target frameworks.
                    </p>
                    
                    <motion.button
                      onClick={() => setLocation(`/download/${projectId}`)}
                      className="gradient-border"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="bg-dark-800 px-8 py-4 rounded-xl flex items-center gap-3 font-semibold text-lg">
                        <Download className="w-6 h-6 text-neon-green" />
                        Download Converted Project
                      </div>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ConversionProgressPage;