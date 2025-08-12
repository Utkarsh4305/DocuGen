import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { FileCode, Zap, ArrowRight, Code2, Database, Globe, Server, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLocation, useRoute } from "wouter";

interface LanguageData {
  name: string;
  percentage: number;
  lines: number;
  files: number;
  color: string;
  icon: string;
}

interface FrameworkData {
  name: string;
  type: 'frontend' | 'backend' | 'database' | 'other';
  confidence: number;
  files: string[];
}

interface ProjectAnalysis {
  id: string;
  name: string;
  totalFiles: number;
  totalLines: number;
  languages: LanguageData[];
  frameworks: FrameworkData[];
  structure: {
    frontend: boolean;
    backend: boolean;
    database: boolean;
    tests: boolean;
    docs: boolean;
  };
}

const AnalysisDashboard = () => {
  const [, setLocation] = useLocation();
  const [match] = useRoute("/analysis/:projectId");
  const projectId = match?.projectId;

  const [analysis, setAnalysis] = useState<ProjectAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  // Mock data for demonstration
  useEffect(() => {
    const loadAnalysis = async () => {
      setIsLoading(true);
      setProgress(0);

      // Simulate loading progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      await new Promise(resolve => setTimeout(resolve, 3000));
      
      clearInterval(progressInterval);
      setProgress(100);

      // Mock analysis data
      const mockAnalysis: ProjectAnalysis = {
        id: projectId || 'mock',
        name: 'E-commerce Platform',
        totalFiles: 247,
        totalLines: 18543,
        languages: [
          { name: 'JavaScript', percentage: 45.2, lines: 8385, files: 89, color: '#F7DF1E', icon: '⚡' },
          { name: 'TypeScript', percentage: 28.7, lines: 5322, files: 67, color: '#3178C6', icon: '🔷' },
          { name: 'Python', percentage: 15.3, lines: 2837, files: 34, color: '#3776AB', icon: '🐍' },
          { name: 'CSS', percentage: 6.8, lines: 1261, files: 23, color: '#1572B6', icon: '🎨' },
          { name: 'HTML', percentage: 4.0, lines: 742, files: 34, color: '#E34F26', icon: '🌐' }
        ],
        frameworks: [
          { name: 'React', type: 'frontend', confidence: 95, files: ['src/App.tsx', 'src/components/*'] },
          { name: 'Node.js', type: 'backend', confidence: 89, files: ['server/index.js', 'api/*'] },
          { name: 'Express', type: 'backend', confidence: 87, files: ['server/routes/*', 'server/middleware/*'] },
          { name: 'MongoDB', type: 'database', confidence: 82, files: ['models/*', 'database/*'] },
          { name: 'Tailwind CSS', type: 'frontend', confidence: 76, files: ['tailwind.config.js', 'src/styles/*'] }
        ],
        structure: {
          frontend: true,
          backend: true,
          database: true,
          tests: true,
          docs: false
        }
      };

      setAnalysis(mockAnalysis);
      setIsLoading(false);
    };

    if (projectId) {
      loadAnalysis();
    }
  }, [projectId]);

  const getFrameworkIcon = (type: string) => {
    switch (type) {
      case 'frontend': return <Globe className="w-4 h-4" />;
      case 'backend': return <Server className="w-4 h-4" />;
      case 'database': return <Database className="w-4 h-4" />;
      default: return <Layers className="w-4 h-4" />;
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-card p-3 text-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{data.icon}</span>
            <span className="font-semibold text-white">{data.name}</span>
          </div>
          <div className="text-gray-300">
            <div>{data.percentage.toFixed(1)}% of codebase</div>
            <div>{data.lines.toLocaleString()} lines</div>
            <div>{data.files} files</div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading || !analysis) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <motion.div
          className="glass-card p-12 text-center max-w-md"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <motion.div
            className="w-16 h-16 rounded-2xl bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 flex items-center justify-center mx-auto mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Code2 className="w-8 h-8 text-neon-blue" />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-white mb-4">Analyzing Your Project</h2>
          <p className="text-gray-400 mb-6">
            AI is examining your code structure, detecting languages and frameworks...
          </p>
          
          <div className="space-y-4">
            <div className="progress-bar h-2">
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-sm text-gray-500">
              {Math.round(progress)}% complete
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="morphing-blob w-96 h-96 top-20 -left-20" />
        <div className="morphing-blob w-64 h-64 bottom-32 -right-10" />
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

          <div className="text-sm text-gray-400">
            Step 2 of 4: Analysis Results
          </div>
        </motion.div>

        <div className="px-6 pb-8">
          {/* Project Overview */}
          <motion.div
            className="mb-8"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="glass-card p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-bold gradient-text mb-2">{analysis.name}</h1>
                  <p className="text-gray-400">
                    {analysis.totalFiles.toLocaleString()} files • {analysis.totalLines.toLocaleString()} lines of code
                  </p>
                </div>
                <motion.button
                  onClick={() => setLocation(`/conversion/${projectId}`)}
                  className="gradient-border"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="bg-dark-800 px-6 py-3 rounded-xl flex items-center gap-3 font-semibold">
                    Continue to Conversion
                    <ArrowRight className="w-5 h-5 text-neon-purple" />
                  </div>
                </motion.button>
              </div>

              {/* Project Structure */}
              <div className="grid grid-cols-5 gap-4">
                {[
                  { key: 'frontend', label: 'Frontend', icon: Globe },
                  { key: 'backend', label: 'Backend', icon: Server },
                  { key: 'database', label: 'Database', icon: Database },
                  { key: 'tests', label: 'Tests', icon: Zap },
                  { key: 'docs', label: 'Docs', icon: FileCode }
                ].map(({ key, label, icon: Icon }) => (
                  <motion.div
                    key={key}
                    className={`glass-card p-4 text-center ${
                      analysis.structure[key as keyof typeof analysis.structure] 
                        ? 'border-neon-green/50 bg-neon-green/5' 
                        : 'border-gray-600/50'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 + Object.keys(analysis.structure).indexOf(key) * 0.1 }}
                  >
                    <Icon className={`w-8 h-8 mx-auto mb-2 ${
                      analysis.structure[key as keyof typeof analysis.structure]
                        ? 'text-neon-green' 
                        : 'text-gray-500'
                    }`} />
                    <div className="text-sm font-medium text-white">{label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Language Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <motion.div
              className="glass-card p-8"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Code2 className="w-6 h-6 text-neon-blue" />
                Language Distribution
              </h2>
              
              <div className="h-80 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analysis.languages}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="percentage"
                    >
                      {analysis.languages.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          className="chart-glow"
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {analysis.languages.map((lang, index) => (
                  <motion.div
                    key={lang.name}
                    className="flex items-center justify-between"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: lang.color }}
                      />
                      <span className="text-lg">{lang.icon}</span>
                      <span className="text-white font-medium">{lang.name}</span>
                    </div>
                    <Badge variant="secondary">
                      {lang.percentage.toFixed(1)}%
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Framework Detection */}
            <motion.div
              className="glass-card p-8"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Layers className="w-6 h-6 text-neon-purple" />
                Detected Frameworks
              </h2>

              <div className="space-y-6">
                {analysis.frameworks.map((framework, index) => (
                  <motion.div
                    key={framework.name}
                    className="glass-card p-4 border-l-4 border-neon-blue/50"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getFrameworkIcon(framework.type)}
                        <span className="font-semibold text-white text-lg">{framework.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">
                          {framework.confidence}% confidence
                        </span>
                        <Badge variant={framework.confidence > 80 ? "default" : "secondary"}>
                          {framework.type}
                        </Badge>
                      </div>
                    </div>
                    
                    <Progress value={framework.confidence} className="mb-3" />
                    
                    <div className="text-sm text-gray-400">
                      <span className="font-medium">Key files:</span>
                      <div className="mt-1 text-xs text-gray-500">
                        {framework.files.slice(0, 3).join(', ')}
                        {framework.files.length > 3 && ` +${framework.files.length - 3} more`}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Continue Button */}
          <motion.div
            className="text-center"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <motion.button
              onClick={() => setLocation(`/conversion/${projectId}`)}
              className="gradient-border"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="bg-dark-800 px-12 py-4 rounded-xl flex items-center gap-4 font-semibold text-lg">
                <Zap className="w-6 h-6 text-neon-blue" />
                Start Code Conversion
                <ArrowRight className="w-6 h-6 text-neon-purple" />
              </div>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;