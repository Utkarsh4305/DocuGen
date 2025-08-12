import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface ConversionStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  progress: number;
}

interface AnimatedProgressProps {
  jobId: string;
  projectId: string;
  onComplete?: () => void;
}

export default function AnimatedProgress({ jobId, projectId, onComplete }: AnimatedProgressProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [steps, setSteps] = useState<ConversionStep[]>([
    {
      id: 'analyze',
      title: 'Analyzing Code Structure',
      description: 'Parsing files and detecting patterns...',
      icon: '🔍',
      status: 'pending',
      progress: 0
    },
    {
      id: 'extract',
      title: 'Extracting Components',
      description: 'Identifying UI components and logic...',
      icon: '🧩',
      status: 'pending',
      progress: 0
    },
    {
      id: 'convert',
      title: 'Converting Framework',
      description: 'Transforming to target framework...',
      icon: '🔄',
      status: 'pending',
      progress: 0
    },
    {
      id: 'optimize',
      title: 'Optimizing Output',
      description: 'Cleaning up and optimizing code...',
      icon: '⚡',
      status: 'pending',
      progress: 0
    },
    {
      id: 'finalize',
      title: 'Finalizing Project',
      description: 'Creating downloadable package...',
      icon: '📦',
      status: 'pending',
      progress: 0
    }
  ]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  // Simulate conversion progress (replace with real API calls)
  useEffect(() => {
    const simulateProgress = () => {
      let stepIndex = 0;
      let stepProgress = 0;

      const updateProgress = () => {
        if (stepIndex < steps.length) {
          setSteps(prev => prev.map((step, index) => {
            if (index < stepIndex) {
              return { ...step, status: 'completed', progress: 100 };
            } else if (index === stepIndex) {
              return { ...step, status: 'active', progress: stepProgress };
            }
            return step;
          }));

          setCurrentStep(stepIndex);
          setProgress((stepIndex * 100 + stepProgress) / steps.length);

          stepProgress += Math.random() * 8 + 2;
          
          if (stepProgress >= 100) {
            stepIndex++;
            stepProgress = 0;
          }

          if (stepIndex < steps.length) {
            setTimeout(updateProgress, 100 + Math.random() * 200);
          } else {
            setIsComplete(true);
            setProgress(100);
            onComplete?.();
          }
        }
      };

      setTimeout(updateProgress, 500);
    };

    simulateProgress();
  }, [onComplete, steps.length]);

  // Particle animation for active step
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      color: string;
    }> = [];

    const createParticle = () => {
      const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c'];
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 60,
        maxLife: 60,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    };

    const animate = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create new particles occasionally
      if (Math.random() < 0.1 && !isComplete) {
        createParticle();
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        const alpha = p.life / p.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 * alpha, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isComplete]);

  return (
    <Card className="glass-strong relative overflow-hidden">
      {/* Background Canvas for Particles */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-10"
        style={{ width: '100%', height: '100%' }}
      />

      <CardHeader className="relative z-20">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="relative mr-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                isComplete ? 'bg-success' : 'bg-primary animate-pulse'
              }`}>
                <i className={`fas ${isComplete ? 'fa-check' : 'fa-cog fa-spin'} text-white text-sm`}></i>
              </div>
              {!isComplete && (
                <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping"></div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                {isComplete ? '🎉 Conversion Complete!' : 'Converting Your Project'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isComplete ? 'Your project is ready for download' : `Step ${currentStep + 1} of ${steps.length}`}
              </p>
            </div>
          </div>
          <Badge 
            variant={isComplete ? "default" : "secondary"}
            className={isComplete ? "bg-success" : ""}
          >
            {Math.round(progress)}%
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="relative z-20">
        {/* Overall Progress Bar */}
        <div className="mb-8">
          <div className="relative h-3 bg-secondary/20 rounded-full overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary via-secondary to-accent transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
            <div className="absolute left-0 top-0 w-full h-full">
              <div 
                className="h-full w-8 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"
                style={{ 
                  transform: `translateX(${progress * 3}px)`,
                  transition: 'transform 0.5s ease-out'
                }}
              />
            </div>
          </div>
        </div>

        {/* Step Details */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`
                flex items-center p-4 rounded-xl transition-all duration-500
                ${step.status === 'active' ? 'glass-strong scale-105 shadow-lg' : 
                  step.status === 'completed' ? 'bg-success/10 border border-success/20' : 
                  'bg-muted/5'}
              `}
            >
              {/* Step Icon */}
              <div className={`
                relative w-12 h-12 rounded-full flex items-center justify-center mr-4 transition-all duration-500
                ${step.status === 'completed' ? 'bg-success' :
                  step.status === 'active' ? 'bg-primary animate-pulse' :
                  'bg-muted/20'}
              `}>
                <span className="text-xl">
                  {step.status === 'completed' ? '✅' : 
                   step.status === 'active' ? step.icon :
                   step.icon}
                </span>
                
                {step.status === 'active' && (
                  <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping"></div>
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1">
                <h4 className={`
                  font-semibold mb-1 transition-colors duration-300
                  ${step.status === 'active' ? 'gradient-text' : ''}
                `}>
                  {step.title}
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {step.description}
                </p>
                
                {step.status === 'active' && (
                  <div className="relative h-1 bg-primary/20 rounded-full overflow-hidden">
                    <div 
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                      style={{ width: `${step.progress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Status Indicator */}
              <div className="ml-4">
                {step.status === 'completed' && (
                  <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center">
                    <i className="fas fa-check text-white text-xs"></i>
                  </div>
                )}
                {step.status === 'active' && (
                  <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Completion Message */}
        {isComplete && (
          <div className="mt-6 p-6 glass rounded-xl text-center fade-in">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-xl font-bold gradient-text mb-2">
              Conversion Successful!
            </h3>
            <p className="text-muted-foreground mb-4">
              Your project has been successfully converted and is ready for download.
            </p>
            <div className="flex justify-center">
              <button className="btn-magic px-8 py-3">
                <i className="fas fa-download mr-2"></i>
                Download Project
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}