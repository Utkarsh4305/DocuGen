import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";

import HeroSection from "../components/hero-section";
import InteractiveUpload from "../components/interactive-upload";
import AnalysisResults from "../components/analysis-results";
import ConversionPanel from "../components/conversion-panel";
import ConversionProgress from "../components/conversion-progress";
import TechStackChanger from "../components/tech-stack-changer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface SupportedFramework {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  maturity: string;
  difficulty: string;
}

export default function Home() {
  const [currentProject, setCurrentProject] = useState<string | null>(null);
  const [activeConversionJob, setActiveConversionJob] = useState<string | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [showNavbar, setShowNavbar] = useState(false);

  const { data: frameworks } = useQuery({
    queryKey: ['/api/frameworks'],
    enabled: true,
  });

  const { data: project } = useQuery({
    queryKey: ['/api/projects', currentProject],
    enabled: !!currentProject,
  });

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setShowNavbar(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll to section
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen relative">
      {/* Animated particles background */}
      <div className="particles fixed inset-0 z-0">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      {/* Floating Navigation */}
      <nav className={`
        fixed top-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500
        ${showNavbar ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'}
      `}>
        <div className="glass-strong rounded-full px-8 py-4 flex items-center space-x-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
              <i className="fas fa-code text-white text-sm"></i>
            </div>
            <span className="font-bold text-sm">DocuGen</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => scrollToSection('upload-section')}
              className="text-sm hover:text-primary"
            >
              Upload
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => scrollToSection('features-section')}
              className="text-sm hover:text-primary"
            >
              Features
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-sm hover:text-primary"
            >
              Docs
            </Button>
          </div>

          <Button size="sm" className="btn-magic text-xs px-4 py-2">
            <i className="fab fa-github mr-2"></i>
            Star on GitHub
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection />

      {/* Upload Section */}
      <section id="upload-section" className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="gradient-text">Ready to Transform?</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload your project and watch the magic happen. Our AI analyzes your codebase 
              and prepares it for conversion to any framework.
            </p>
          </div>

          <div className="fade-in" style={{ animationDelay: '0.2s' }}>
            <InteractiveUpload onUploadSuccess={(data) => setCurrentProject(data.project.id)} />
          </div>

          {/* Upload Stats */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 fade-in" style={{ animationDelay: '0.4s' }}>
            {[
              { value: '10K+', label: 'Projects Converted', icon: '🚀' },
              { value: '50+', label: 'Framework Combinations', icon: '🔄' },
              { value: '99.9%', label: 'Success Rate', icon: '✨' }
            ].map((stat, index) => (
              <Card key={index} className="glass text-center p-6 hover:scale-105 transition-all duration-300 group">
                <CardContent className="p-0">
                  <div className="text-3xl mb-2 group-hover:scale-125 transition-transform duration-300">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Analysis Results Section */}
      {currentProject && (
        <section className="relative py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 fade-in">
              <h2 className="text-4xl font-bold mb-4">
                <span className="gradient-text">Analysis Complete!</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Here's what we discovered about your project
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="fade-in" style={{ animationDelay: '0.1s' }}>
                <AnalysisResults projectId={currentProject} />
              </div>

              <div className="space-y-6 fade-in" style={{ animationDelay: '0.3s' }}>
                <ConversionPanel
                  projectId={currentProject}
                  frameworks={frameworks || []}
                  onConversionStarted={setActiveConversionJob}
                />
                
                {activeConversionJob && (
                  <ConversionProgress 
                    jobId={activeConversionJob}
                    projectId={currentProject}
                  />
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section id="features-section" className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="gradient-text">Why Choose DocuGen?</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We don't just convert code — we transform your entire development experience 
              with intelligent, structure-preserving transpilation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🧠',
                title: 'AI-Powered Intelligence',
                description: 'Advanced pattern recognition understands your code structure and preserves business logic across frameworks.',
                gradient: 'from-purple-400 to-pink-400'
              },
              {
                icon: '⚡',
                title: 'Lightning Fast Conversion',
                description: 'Process entire codebases in seconds, not hours. Our optimized engine handles projects of any size.',
                gradient: 'from-yellow-400 to-orange-400'
              },
              {
                icon: '🎯',
                title: 'Structure Preservation',
                description: 'Maintain your component hierarchy, state management patterns, and architectural decisions.',
                gradient: 'from-green-400 to-blue-400'
              },
              {
                icon: '🔄',
                title: 'Universal Support',
                description: 'Convert between React, Vue, Angular, Flutter, Android, and more — any framework to any framework.',
                gradient: 'from-blue-400 to-purple-400'
              },
              {
                icon: '🛡️',
                title: 'Production Ready',
                description: 'Generated code follows best practices and is ready for deployment without manual fixes.',
                gradient: 'from-red-400 to-pink-400'
              },
              {
                icon: '🎨',
                title: 'Style Preservation',
                description: 'CSS, themes, and styling are intelligently converted to target framework equivalents.',
                gradient: 'from-indigo-400 to-cyan-400'
              }
            ].map((feature, index) => (
              <Card 
                key={index} 
                className="glass-strong group hover:scale-105 transition-all duration-500 relative overflow-hidden fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Glow effect */}
                <div className={`
                  absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-500
                  bg-gradient-to-r ${feature.gradient}
                `} />
                
                <CardContent className="p-8 relative z-10">
                  <div className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:gradient-text transition-all duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-strong rounded-3xl p-12 relative overflow-hidden fade-in">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }} />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="gradient-text">Ready to Get Started?</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of developers who've already transformed their projects. 
                Convert your first codebase today — it's free!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => scrollToSection('upload-section')}
                  size="lg"
                  className="btn-magic text-lg px-12 py-4 h-auto"
                >
                  Start Converting Now
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-lg px-12 py-4 h-auto border border-primary/20 hover:border-primary/50"
                >
                  <i className="fab fa-github mr-2"></i>
                  View on GitHub
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-4 border-t border-primary/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                  <i className="fas fa-code text-white text-sm"></i>
                </div>
                <span className="font-bold">DocuGen</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The most advanced universal code transpiler for modern development teams.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2">
                <a href="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Features</a>
                <a href="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Pricing</a>
                <a href="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Documentation</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <div className="space-y-2">
                <a href="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Blog</a>
                <a href="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Examples</a>
                <a href="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Community</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <i className="fab fa-github text-xl"></i>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <i className="fab fa-twitter text-xl"></i>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <i className="fab fa-discord text-xl"></i>
                </a>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-primary/10 text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 DocuGen. Built with ❤️ for developers worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}