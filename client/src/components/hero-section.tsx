import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

interface FloatingElement {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  color: string;
}

export default function HeroSection() {
  const [elements, setElements] = useState<FloatingElement[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate floating elements
  useEffect(() => {
    const generateElements = () => {
      const newElements: FloatingElement[] = [];
      const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'];
      
      for (let i = 0; i < 20; i++) {
        newElements.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 60 + 20,
          speed: Math.random() * 0.5 + 0.2,
          opacity: Math.random() * 0.3 + 0.1,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
      setElements(newElements);
    };

    generateElements();
    window.addEventListener('resize', generateElements);
    return () => window.removeEventListener('resize', generateElements);
  }, []);

  // Animate floating elements
  useEffect(() => {
    const animate = () => {
      setElements(prev => prev.map(element => ({
        ...element,
        x: element.x + Math.sin(element.y * 0.01) * 0.5,
        y: element.y < -element.size ? window.innerHeight + element.size : element.y - element.speed
      })));
    };

    const interval = setInterval(animate, 50);
    return () => clearInterval(interval);
  }, []);

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const scrollToUpload = () => {
    const uploadSection = document.getElementById('upload-section');
    uploadSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0">
        {elements.map((element) => (
          <div
            key={element.id}
            className="absolute rounded-full blur-sm"
            style={{
              left: element.x,
              top: element.y,
              width: element.size,
              height: element.size,
              background: `radial-gradient(circle, ${element.color}${Math.round(element.opacity * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
              transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)`,
              transition: 'transform 0.3s ease-out'
            }}
          />
        ))}
      </div>

      {/* Hero Content */}
      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
        {/* Main Title */}
        <div className="mb-8 fade-in">
          <h1 className="text-6xl md:text-8xl font-black leading-tight">
            <span className="block gradient-text mb-4">DocuGen</span>
            <span className="block text-4xl md:text-5xl font-light text-foreground/80">
              Universal Code Transpiler
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <div className="mb-12 fade-in" style={{ animationDelay: '0.2s' }}>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Transform your codebase between any frameworks with{' '}
            <span className="gradient-text font-semibold">intelligent line-by-line conversion</span>.
            From React to Flutter, Vue to Android, Angular to anything — 
            <span className="text-primary font-semibold"> preserve your logic, elevate your stack</span>.
          </p>
        </div>

        {/* Feature Pills */}
        <div className="mb-16 flex flex-wrap justify-center gap-4 fade-in" style={{ animationDelay: '0.4s' }}>
          {[
            { icon: '🧠', text: 'Smart Analysis' },
            { icon: '⚡', text: 'Lightning Fast' },
            { icon: '🎯', text: 'Structure Preserved' },
            { icon: '🔄', text: 'Any Framework' },
            { icon: '🚀', text: 'Production Ready' }
          ].map((feature, index) => (
            <div
              key={index}
              className="glass px-6 py-3 rounded-full hover:scale-105 transition-all duration-300 group cursor-pointer"
              style={{ animationDelay: `${0.6 + index * 0.1}s` }}
            >
              <span className="text-2xl mr-2 group-hover:scale-125 transition-transform duration-300">
                {feature.icon}
              </span>
              <span className="font-medium text-sm">{feature.text}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center fade-in" style={{ animationDelay: '0.6s' }}>
          <Button
            onClick={scrollToUpload}
            size="lg"
            className="btn-magic text-lg px-12 py-4 h-auto group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center">
              Start Converting
              <svg 
                className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Button>

          <Button
            variant="ghost"
            size="lg"
            className="text-lg px-12 py-4 h-auto border border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
          >
            <span className="flex items-center">
              <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1a3 3 0 013 3v1m-4-4V8a3 3 0 013-3h1M9 10V5a3 3 0 013-3h1" />
              </svg>
              View Demo
            </span>
          </Button>
        </div>

        {/* Tech Stack Preview */}
        <div className="mt-20 fade-in" style={{ animationDelay: '0.8s' }}>
          <div className="text-center mb-8">
            <h3 className="text-lg text-muted-foreground mb-4">Supported Frameworks</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6 max-w-4xl mx-auto">
            {[
              { name: 'React', icon: '⚛️', color: 'from-blue-400 to-cyan-400' },
              { name: 'Vue', icon: '💚', color: 'from-green-400 to-emerald-400' },
              { name: 'Angular', icon: '🅰️', color: 'from-red-400 to-pink-400' },
              { name: 'Flutter', icon: '🦋', color: 'from-blue-400 to-indigo-400' },
              { name: 'React Native', icon: '📱', color: 'from-purple-400 to-violet-400' },
              { name: 'Android', icon: '🤖', color: 'from-green-400 to-lime-400' },
              { name: 'Node.js', icon: '🟢', color: 'from-green-500 to-emerald-500' },
              { name: 'Python', icon: '🐍', color: 'from-yellow-400 to-orange-400' }
            ].map((tech, index) => (
              <div
                key={index}
                className="group cursor-pointer"
                style={{ animationDelay: `${1 + index * 0.1}s` }}
              >
                <div className={`
                  glass-strong rounded-2xl p-4 text-center transition-all duration-500 hover:scale-110 
                  hover:shadow-2xl relative overflow-hidden group-hover:-translate-y-2
                `}>
                  {/* Glow effect */}
                  <div className={`
                    absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500
                    bg-gradient-to-r ${tech.color}
                  `} />
                  
                  <div className="relative z-10">
                    <div className="text-3xl mb-2 group-hover:scale-125 transition-transform duration-300">
                      {tech.icon}
                    </div>
                    <div className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                      {tech.name}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 fade-in" style={{ animationDelay: '1.2s' }}>
          <div className="animate-bounce">
            <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>

      {/* Interactive Mouse Trail */}
      <div 
        className="fixed pointer-events-none z-20 w-8 h-8 rounded-full bg-gradient-to-r from-primary/30 to-secondary/30 blur-sm transition-all duration-300 ease-out"
        style={{
          left: mousePos.x * 50 + window.innerWidth / 2,
          top: mousePos.y * 50 + window.innerHeight / 2,
          transform: 'translate(-50%, -50%)'
        }}
      />
    </div>
  );
}