import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Code2, Database, Globe, Server, Zap, ArrowRight, CheckCircle, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation, useRoute } from "wouter";

interface Framework {
  id: string;
  name: string;
  type: 'frontend' | 'backend' | 'database';
  icon: string;
  description: string;
  popularity: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
}

interface ConversionOption {
  frontend?: Framework;
  backend?: Framework;
  database?: Framework;
}

const ConversionSelector = () => {
  const [, setLocation] = useLocation();
  const [match] = useRoute("/conversion/:projectId");
  const projectId = match?.projectId;

  const [selectedOptions, setSelectedOptions] = useState<ConversionOption>({});
  const [activeCategory, setActiveCategory] = useState<'frontend' | 'backend' | 'database' | null>(null);

  const frameworks: Framework[] = [
    // Frontend Frameworks
    { id: 'react', name: 'React', type: 'frontend', icon: '⚛️', description: 'A JavaScript library for building user interfaces', popularity: 95, difficulty: 'Medium', tags: ['SPA', 'Component-based', 'Virtual DOM'] },
    { id: 'vue', name: 'Vue.js', type: 'frontend', icon: '💚', description: 'Progressive JavaScript framework', popularity: 87, difficulty: 'Easy', tags: ['Progressive', 'Template-based', 'Reactive'] },
    { id: 'angular', name: 'Angular', type: 'frontend', icon: '🅰️', description: 'Platform for building mobile and desktop web applications', popularity: 82, difficulty: 'Hard', tags: ['TypeScript', 'Full-featured', 'Enterprise'] },
    { id: 'svelte', name: 'Svelte', type: 'frontend', icon: '🧡', description: 'Cybernetically enhanced web apps', popularity: 76, difficulty: 'Medium', tags: ['Compile-time', 'No virtual DOM', 'Small bundle'] },
    { id: 'flutter', name: 'Flutter', type: 'frontend', icon: '💙', description: 'Google\'s UI toolkit for mobile, web, and desktop', popularity: 73, difficulty: 'Medium', tags: ['Cross-platform', 'Dart', 'Native performance'] },
    
    // Backend Frameworks
    { id: 'nodejs', name: 'Node.js', type: 'backend', icon: '🟢', description: 'JavaScript runtime built on Chrome\'s V8 JavaScript engine', popularity: 92, difficulty: 'Easy', tags: ['JavaScript', 'Event-driven', 'Non-blocking'] },
    { id: 'django', name: 'Django', type: 'backend', icon: '🐍', description: 'High-level Python web framework', popularity: 85, difficulty: 'Medium', tags: ['Python', 'Batteries included', 'ORM'] },
    { id: 'spring', name: 'Spring Boot', type: 'backend', icon: '🍃', description: 'Java-based framework for building enterprise applications', popularity: 83, difficulty: 'Hard', tags: ['Java', 'Dependency injection', 'Enterprise'] },
    { id: 'fastapi', name: 'FastAPI', type: 'backend', icon: '⚡', description: 'Modern, fast web framework for building APIs with Python', popularity: 79, difficulty: 'Easy', tags: ['Python', 'Async', 'Type hints'] },
    { id: 'nestjs', name: 'NestJS', type: 'backend', icon: '🦅', description: 'Progressive Node.js framework for scalable server-side applications', popularity: 74, difficulty: 'Medium', tags: ['TypeScript', 'Decorators', 'Modular'] },

    // Databases
    { id: 'postgresql', name: 'PostgreSQL', type: 'database', icon: '🐘', description: 'Powerful, open source object-relational database system', popularity: 89, difficulty: 'Medium', tags: ['SQL', 'ACID', 'Extensible'] },
    { id: 'mongodb', name: 'MongoDB', type: 'database', icon: '🍃', description: 'NoSQL document database', popularity: 86, difficulty: 'Easy', tags: ['NoSQL', 'Document-based', 'Scalable'] },
    { id: 'mysql', name: 'MySQL', type: 'database', icon: '🐬', description: 'Open-source relational database management system', popularity: 84, difficulty: 'Easy', tags: ['SQL', 'Reliable', 'Fast'] },
    { id: 'redis', name: 'Redis', type: 'database', icon: '🔴', description: 'In-memory data structure store', popularity: 78, difficulty: 'Easy', tags: ['In-memory', 'Cache', 'Key-value'] },
    { id: 'firebase', name: 'Firebase', type: 'database', icon: '🔥', description: 'Google\'s mobile platform with real-time database', popularity: 72, difficulty: 'Easy', tags: ['Real-time', 'NoSQL', 'Cloud'] }
  ];

  const getFrameworksByType = (type: string) => 
    frameworks.filter(f => f.type === type).sort((a, b) => b.popularity - a.popularity);

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'frontend': return <Globe className="w-5 h-5" />;
      case 'backend': return <Server className="w-5 h-5" />;
      case 'database': return <Database className="w-5 h-5" />;
      default: return <Code2 className="w-5 h-5" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-neon-green';
      case 'Medium': return 'text-neon-orange';
      case 'Hard': return 'text-neon-red';
      default: return 'text-gray-400';
    }
  };

  const handleFrameworkSelect = (framework: Framework) => {
    setSelectedOptions(prev => ({
      ...prev,
      [framework.type]: framework
    }));
    setActiveCategory(null);
  };

  const startConversion = () => {
    if (Object.keys(selectedOptions).length > 0) {
      setLocation(`/progress/${projectId}`);
    }
  };

  const isConversionReady = Object.keys(selectedOptions).length > 0;

  return (
    <div className="min-h-screen bg-dark-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="morphing-blob w-96 h-96 top-20 -left-20" />
        <div className="morphing-blob w-80 h-80 bottom-10 -right-20" />
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
            Step 3 of 4: Conversion Options
          </div>
        </motion.div>

        <div className="px-6 pb-8">
          {/* Title Section */}
          <motion.div
            className="text-center mb-12"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-5xl font-bold mb-4">
              <span className="gradient-text">Choose Your</span>
              <br />
              <span className="text-white">Target Stack</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Select the frameworks and technologies you want to convert your project to.
              Mix and match to create your perfect tech stack.
            </p>
          </motion.div>

          {/* Selection Categories */}
          <div className="max-w-6xl mx-auto space-y-8">
            {['frontend', 'backend', 'database'].map((category, categoryIndex) => (
              <motion.div
                key={category}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 + categoryIndex * 0.1 }}
              >
                <div className="glass-card p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 flex items-center justify-center">
                        {getCategoryIcon(category)}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white capitalize">{category}</h2>
                        <p className="text-gray-400">
                          {category === 'frontend' && 'User interface and client-side logic'}
                          {category === 'backend' && 'Server-side logic and APIs'}
                          {category === 'database' && 'Data storage and management'}
                        </p>
                      </div>
                    </div>

                    {selectedOptions[category as keyof ConversionOption] ? (
                      <motion.div
                        className="flex items-center gap-3 glass-card p-4 border-neon-green/50 bg-neon-green/5"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => setActiveCategory(category as any)}
                      >
                        <span className="text-2xl">
                          {selectedOptions[category as keyof ConversionOption]?.icon}
                        </span>
                        <div>
                          <div className="font-semibold text-white">
                            {selectedOptions[category as keyof ConversionOption]?.name}
                          </div>
                          <div className="text-sm text-gray-400">Selected</div>
                        </div>
                        <CheckCircle className="w-5 h-5 text-neon-green" />
                      </motion.div>
                    ) : (
                      <motion.button
                        className="glass-button flex items-center gap-2"
                        onClick={() => setActiveCategory(category as any)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Choose Framework
                        <ChevronDown className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>

                  <AnimatePresence>
                    {activeCategory === category && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6 border-t border-gray-700/50">
                          {getFrameworksByType(category).map((framework, index) => (
                            <motion.div
                              key={framework.id}
                              className="glass-card p-6 cursor-pointer hover:border-neon-blue/50 hover:bg-neon-blue/5 transition-all duration-300"
                              onClick={() => handleFrameworkSelect(framework)}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: index * 0.05 }}
                              whileHover={{ scale: 1.02, y: -5 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex items-start gap-4 mb-4">
                                <span className="text-3xl">{framework.icon}</span>
                                <div className="flex-1">
                                  <h3 className="text-lg font-bold text-white mb-1">
                                    {framework.name}
                                  </h3>
                                  <p className="text-sm text-gray-400 mb-2">
                                    {framework.description}
                                  </p>
                                  <div className="flex items-center gap-2 mb-3">
                                    <Badge variant="secondary" className="text-xs">
                                      {framework.popularity}% popular
                                    </Badge>
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${getDifficultyColor(framework.difficulty)}`}
                                    >
                                      {framework.difficulty}
                                    </Badge>
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {framework.tags.slice(0, 3).map(tag => (
                                      <span
                                        key={tag}
                                        className="text-xs bg-dark-700 text-gray-300 px-2 py-1 rounded-full"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              
                              <motion.div
                                className="w-full h-1 bg-dark-700 rounded-full overflow-hidden"
                                whileHover={{ scale: 1.05 }}
                              >
                                <motion.div
                                  className="h-full bg-gradient-to-r from-neon-blue to-neon-purple rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${framework.popularity}%` }}
                                  transition={{ delay: index * 0.05 + 0.2, duration: 0.8 }}
                                />
                              </motion.div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Conversion Summary & CTA */}
          <AnimatePresence>
            {isConversionReady && (
              <motion.div
                className="max-w-4xl mx-auto mt-12"
                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 50 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="glass-card p-8 text-center">
                  <h2 className="text-3xl font-bold text-white mb-6">
                    Your Conversion Plan
                  </h2>
                  
                  <div className="flex flex-wrap justify-center gap-6 mb-8">
                    {Object.values(selectedOptions).map((framework, index) => (
                      <motion.div
                        key={framework.id}
                        className="flex items-center gap-3 glass-card p-4 border-neon-blue/50 bg-neon-blue/5"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <span className="text-2xl">{framework.icon}</span>
                        <div>
                          <div className="font-semibold text-white">{framework.name}</div>
                          <div className="text-sm text-gray-400 capitalize">{framework.type}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <motion.button
                    onClick={startConversion}
                    className="gradient-border"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="bg-dark-800 px-12 py-4 rounded-xl flex items-center gap-4 font-semibold text-xl">
                      <Zap className="w-6 h-6 text-neon-blue" />
                      Start Conversion
                      <ArrowRight className="w-6 h-6 text-neon-purple" />
                    </div>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ConversionSelector;