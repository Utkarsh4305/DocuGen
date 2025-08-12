import { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

// Lazy load heavy components for performance
const UploadFlow = lazy(() => import('@/components/upload-flow/upload-flow'));

export default function UploadPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    let timeoutId: number;
    const throttledMouseMove = (e: MouseEvent) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => handleMouseMove(e), 16); // ~60fps
    };
    
    window.addEventListener('mousemove', throttledMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', throttledMouseMove);
      clearTimeout(timeoutId);
    };
  }, [handleMouseMove]);

  return (
    <div className="min-h-screen bg-dark-gradient overflow-x-hidden">
      {/* Advanced Cursor Following Background */}
      <div 
        className="cursor-glow"
        style={{
          left: mousePosition.x - 200,
          top: mousePosition.y - 200,
        }}
      />
      
      {/* Minimal Particles */}
      <div className="particle-field">
        {Array.from({ length: 3 }).map((_, i) => (
          <div 
            key={i} 
            className="particle" 
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>

      {/* Revolutionary Header */}
      <header className="glass-header">
        <div className="container-fluid">
          <nav className="nav-container">
            <div className="brand-section">
              <div className="logo-container">
                <div className="logo-orb">
                  <div className="logo-core">
                    <i className="fas fa-atom text-2xl"></i>
                  </div>
                  <div className="logo-ring"></div>
                  <div className="logo-ring-2"></div>
                </div>
                <div className="brand-text">
                  <h1 className="brand-title">DocuGen</h1>
                  <span className="brand-subtitle">Code Transpiler</span>
                </div>
              </div>
              <div className="status-pill">
                <div className="pulse-dot"></div>
                <span>Upload Mode</span>
              </div>
            </div>

            <div className="nav-actions">
              <Link href="/">
                <Button variant="ghost" className="nav-btn">
                  <i className="fas fa-home mr-2"></i>
                  Home
                </Button>
              </Link>
              <Button variant="ghost" className="nav-btn">
                <i className="fas fa-book mr-2"></i>
                Docs
              </Button>
              <Button className="primary-btn">
                <i className="fab fa-github mr-2"></i>
                GitHub
                <div className="btn-shine"></div>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Minimal Upload Flow Section */}
      <main className="main-content pt-20">
        <div className="container-fluid">
          <div className="glass-panel max-w-4xl mx-auto p-6">
            <Suspense fallback={
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto"></div>
              </div>
            }>
              <UploadFlow />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}