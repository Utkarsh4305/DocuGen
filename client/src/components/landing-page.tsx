import { motion } from "framer-motion";
import { ArrowRight, Code2, Zap, FileCode, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

const CodeMorphLandingPage = () => {
  const [, setLocation] = useLocation();

  const floatingElements = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    size: Math.random() * 100 + 50,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 10 + 10,
  }));

  return (
    <div className="min-h-screen bg-dark-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {floatingElements.map((element) => (
          <motion.div
            key={element.id}
            className="morphing-blob"
            style={{
              width: element.size,
              height: element.size,
              left: `${element.x}%`,
              top: `${element.y}%`,
            }}
            animate={{
              x: [0, 50, -50, 0],
              y: [0, -50, 50, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: element.duration,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 code-background opacity-30" />
        
        {/* Gradient Overlays */}
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-neon-blue/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-neon-purple/10 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <motion.nav 
        className="relative z-10 flex items-center justify-between p-6"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div 
          className="flex items-center gap-3"
          whileHover={{ scale: 1.05 }}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple p-[1px]">
            <div className="w-full h-full bg-dark-800 rounded-xl flex items-center justify-center">
              <Code2 className="w-5 h-5 text-neon-blue" />
            </div>
          </div>
          <span className="text-2xl font-bold gradient-text">CodeMorph</span>
        </motion.div>
        
        <div className="flex items-center gap-4">
          <motion.button
            className="glass-button text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            How it Works
          </motion.button>
          <motion.button
            className="glass-button text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            About
          </motion.button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <motion.h1 
            className="text-6xl md:text-8xl font-bold mb-8 leading-tight"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3 }}
          >
            <span className="gradient-text neon-text">Transform</span>
            <br />
            <span className="text-white">Your Code</span>
            <br />
            <span className="gradient-text neon-text">Instantly</span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Universal code transpiler that converts entire projects between frameworks.
            Upload your project, choose your target stack, and watch the magic happen.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <motion.button
              onClick={() => setLocation("/upload")}
              className="gradient-border"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="bg-dark-800 px-8 py-4 rounded-xl flex items-center gap-3 font-semibold text-lg">
                <Sparkles className="w-5 h-5 text-neon-blue" />
                Start Converting
                <ArrowRight className="w-5 h-5 text-neon-purple" />
              </div>
            </motion.button>
            
            <motion.button
              className="glass-button text-lg px-8 py-4 flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Zap className="w-5 h-5" />
              Watch Demo
            </motion.button>
          </motion.div>

          {/* Features Preview */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          >
            <motion.div
              className="glass-card p-6 text-left"
              whileHover={{ scale: 1.05, y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-neon-blue/20 to-neon-blue/10 flex items-center justify-center mb-4">
                <FileCode className="w-6 h-6 text-neon-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Smart Detection</h3>
              <p className="text-gray-400">
                Automatically detects your tech stack and analyzes code structure with AI precision.
              </p>
            </motion.div>

            <motion.div
              className="glass-card p-6 text-left"
              whileHover={{ scale: 1.05, y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-neon-purple/20 to-neon-purple/10 flex items-center justify-center mb-4">
                <Code2 className="w-6 h-6 text-neon-purple" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Universal Translation</h3>
              <p className="text-gray-400">
                Convert between any frameworks using our Universal Intermediate Representation.
              </p>
            </motion.div>

            <motion.div
              className="glass-card p-6 text-left"
              whileHover={{ scale: 1.05, y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-neon-pink/20 to-neon-pink/10 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-neon-pink" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Ready-to-Run</h3>
              <p className="text-gray-400">
                Get a complete, functional project in your target framework with preserved functionality.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Animated Code Snippets */}
      <motion.div
        className="absolute bottom-10 left-10 glass-card p-4 font-mono text-sm text-green-400"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        whileHover={{ scale: 1.05 }}
      >
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          React → Flutter
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-32 right-10 glass-card p-4 font-mono text-sm text-blue-400"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 1.7 }}
        whileHover={{ scale: 1.05 }}
      >
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        >
          Python → Node.js
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute top-32 right-32 glass-card p-4 font-mono text-sm text-purple-400"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 1.9 }}
        whileHover={{ scale: 1.05 }}
      >
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        >
          Vue → Angular
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CodeMorphLandingPage;