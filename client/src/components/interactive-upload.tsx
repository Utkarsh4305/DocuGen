import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface InteractiveUploadProps {
  onUploadSuccess?: (data: any) => void;
  onProjectCreated?: (projectId: string) => void;
  className?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

export default function InteractiveUpload({ onUploadSuccess, onProjectCreated, className = '' }: InteractiveUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const particleIdRef = useRef(0);
  const { toast } = useToast();

  // Particle system for magical effects
  const createParticles = useCallback((x: number, y: number, count: number = 15) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: particleIdRef.current++,
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4 - 2,
        life: 60,
        maxLife: 60,
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  // Animate particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      setParticles(prev => {
        const updated = prev.map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vy: particle.vy + 0.1, // gravity
          life: particle.life - 1,
        })).filter(particle => particle.life > 0);

        // Render particles
        updated.forEach(particle => {
          const alpha = particle.life / particle.maxLife;
          const size = (particle.life / particle.maxLife) * 6;
          
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
          
          // Gradient fill
          const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, size
          );
          gradient.addColorStop(0, '#667eea');
          gradient.addColorStop(0.5, '#764ba2');
          gradient.addColorStop(1, 'transparent');
          
          ctx.fillStyle = gradient;
          ctx.fill();
        });

        ctx.globalAlpha = 1;
        return updated;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      // Simulate upload progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 100);

      try {
        const response = await apiRequest('POST', '/api/projects/upload-zip', formData);
        clearInterval(progressInterval);
        setUploadProgress(100);
        return response.json();
      } catch (error) {
        clearInterval(progressInterval);
        throw error;
      }
    },
    onSuccess: (data) => {
      setUploadProgress(100);
      toast({
        title: "🎉 Upload Complete!",
        description: "Your project has been analyzed successfully.",
      });
      onUploadSuccess?.(data);
      onProjectCreated?.(data.id);
      
      // Create celebration particles
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            createParticles(
              Math.random() * canvas.width, 
              Math.random() * canvas.height, 
              20
            );
          }, i * 100);
        }
      }
    },
    onError: (error: any) => {
      setUploadProgress(0);
      toast({
        title: "Upload Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!isDragging) {
      setIsDragging(true);
      // Create particles on drag enter
      createParticles(e.clientX, e.clientY, 10);
    }
  }, [isDragging, createParticles]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    // Only set dragging to false if mouse is outside the drop zone
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const zipFile = files.find(file => file.name.endsWith('.zip'));

    if (!zipFile) {
      toast({
        title: "Invalid File",
        description: "Please upload a ZIP file containing your project.",
        variant: "destructive",
      });
      return;
    }

    // Create explosion particles at drop location
    createParticles(e.clientX, e.clientY, 25);

    const formData = new FormData();
    formData.append('zipFile', zipFile);
    formData.append('name', zipFile.name.replace('.zip', ''));

    setFileName(zipFile.name);
    setUploadProgress(0);
    uploadMutation.mutate(formData);
  }, [uploadMutation, toast, createParticles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.zip')) {
      toast({
        title: "Invalid File",
        description: "Please select a ZIP file containing your project.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('zipFile', file);
    formData.append('name', file.name.replace('.zip', ''));

    setFileName(file.name);
    setUploadProgress(0);
    uploadMutation.mutate(formData);
  }, [uploadMutation, toast]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Particle Canvas */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-10"
        style={{ width: '100%', height: '100%' }}
      />
      
      <Card 
        className={`
          relative overflow-hidden transition-all duration-500 ease-out cursor-pointer
          ${isDragging ? 'scale-105 shadow-2xl border-primary/50 bg-primary/5' : 'hover:scale-[1.02] hover:shadow-xl'}
          ${uploadMutation.isPending ? 'pointer-events-none' : ''}
          glass-strong border-2 border-dashed
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!uploadMutation.isPending ? handleClick : undefined}
      >
        {/* Animated Background Gradient */}
        <div className={`
          absolute inset-0 opacity-0 transition-opacity duration-500
          ${isDragging ? 'opacity-100' : ''}
          bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20
        `} />
        
        {/* Shimmer Effect */}
        <div className={`
          absolute inset-0 -translate-x-full transition-transform duration-1000
          ${isDragging ? 'translate-x-full' : ''}
          bg-gradient-to-r from-transparent via-white/10 to-transparent
        `} />

        <div className="relative z-20 p-12 text-center">
          {uploadMutation.isPending ? (
            <div className="space-y-6">
              {/* Animated Upload Icon */}
              <div className="mx-auto w-24 h-24 relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-secondary animate-spin" />
                <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold gradient-text">Uploading Your Project</h3>
                {fileName && (
                  <p className="text-sm text-muted-foreground font-mono">{fileName}</p>
                )}
                
                {/* Beautiful Progress Bar */}
                <div className="space-y-2">
                  <div className="relative h-3 bg-secondary/20 rounded-full overflow-hidden">
                    <div 
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary via-secondary to-accent transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                    <div className="absolute left-0 top-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                  </div>
                  <div className="text-sm text-center font-medium">
                    {uploadProgress}% Complete
                  </div>
                </div>

                <div className="loading-dots justify-center">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Interactive Upload Icon */}
              <div className={`
                mx-auto w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500
                ${isDragging ? 'scale-110 rotate-12' : 'hover:scale-105'}
                bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur
              `}>
                <svg 
                  className={`w-12 h-12 transition-all duration-500 ${isDragging ? 'text-primary scale-110' : 'text-primary/70'}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                  />
                </svg>
              </div>

              <div className="space-y-3">
                <h3 className={`
                  text-2xl font-bold transition-all duration-300
                  ${isDragging ? 'gradient-text scale-105' : 'text-foreground'}
                `}>
                  {isDragging ? 'Release to Upload!' : 'Upload Your Project'}
                </h3>
                
                <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Drag and drop your ZIP file here, or click to browse. 
                  We'll analyze your codebase and prepare it for conversion.
                </p>
              </div>

              {/* Supported Formats */}
              <div className="flex justify-center space-x-4 text-xs text-muted-foreground">
                <span className="px-3 py-1 bg-primary/10 rounded-full">
                  📁 ZIP Files
                </span>
                <span className="px-3 py-1 bg-secondary/10 rounded-full">
                  ⚡ Up to 100MB
                </span>
                <span className="px-3 py-1 bg-accent/10 rounded-full">
                  🚀 Instant Analysis
                </span>
              </div>

              {/* Action Button */}
              <Button
                variant="ghost"
                size="sm"
                className="mt-4 text-primary hover:text-primary hover:bg-primary/10 transition-all duration-300"
              >
                Choose File
              </Button>
            </div>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".zip"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Floating Orbs */}
        {!uploadMutation.isPending && (
          <>
            <div className="absolute top-4 right-4 w-3 h-3 bg-primary/30 rounded-full animate-pulse" />
            <div className="absolute bottom-4 left-4 w-2 h-2 bg-secondary/40 rounded-full animate-pulse delay-300" />
            <div className="absolute top-1/2 left-8 w-1 h-1 bg-accent/50 rounded-full animate-pulse delay-700" />
          </>
        )}
      </Card>
    </div>
  );
}