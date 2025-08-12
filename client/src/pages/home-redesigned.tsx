import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import UploadSection from "@/components/upload-section";
import AnalysisResults from "@/components/analysis-results";
import ConversionPanel from "@/components/conversion-panel";
import ASTVisualization from "@/components/ast-visualization";
import ConversionProgress from "@/components/conversion-progress";
import LanguageCategorization from "@/components/language-categorization";
import { Button } from "@/components/ui/button";

export default function HomeRedesigned() {
  const [currentProject, setCurrentProject] = useState<string | null>(null);
  const [activeConversionJob, setActiveConversionJob] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const { data: frameworks } = useQuery({
    queryKey: ['/api/frameworks'],
    enabled: true,
  });

  const { data: project } = useQuery({
    queryKey: ['/api/projects', currentProject],
    enabled: !!currentProject,
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
      
      {/* Floating Particles */}
      <div className="particle-field">
        {Array.from({ length: 50 }).map((_, i) => (
          <div 
            key={i} 
            className="particle" 
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${20 + Math.random() * 20}s`
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
                  <span className="brand-subtitle">AI Code Transpiler</span>
                </div>
              </div>
              <div className="status-pill">
                <div className="pulse-dot"></div>
                <span>v2.0 Beta</span>
              </div>
            </div>

            <div className="nav-actions">
              <Button variant="ghost" className="nav-btn">
                <i className="fas fa-book mr-2"></i>
                Docs
              </Button>
              <Button variant="ghost" className="nav-btn">
                <i className="fas fa-code mr-2"></i>
                Examples  
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

      {/* Hero Section - Next Level */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>
        
        <div className="container-fluid">
          <div className="hero-content">
            <div className="hero-badge">
              <i className="fas fa-magic"></i>
              <span>Powered by Advanced AI</span>
            </div>
            
            <h1 className="hero-title">
              <span className="title-line">Transform Code</span>
              <span className="title-line gradient-text">Between Any</span>
              <span className="title-line">Framework</span>
            </h1>
            
            <p className="hero-description">
              Experience the future of code conversion with our revolutionary AI-powered transpiler.
              Upload, analyze, and transform your projects with unprecedented accuracy and speed.
            </p>

            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">50K+</div>
                <div className="stat-label">Projects Converted</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-number">25+</div>
                <div className="stat-label">Frameworks</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-number">99.8%</div>
                <div className="stat-label">Accuracy Rate</div>
              </div>
            </div>

            <div className="hero-actions">
              <Button className="hero-btn primary">
                <i className="fas fa-rocket mr-2"></i>
                Start Converting
                <div className="btn-glow"></div>
              </Button>
              <Button variant="outline" className="hero-btn secondary">
                <i className="fas fa-play mr-2"></i>
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - Redesigned Layout */}
      <main className="main-content">
        <div className="container-fluid">
          {!currentProject ? (
            <div className="workflow-section">
              <div className="section-header">
                <h2 className="section-title">
                  <span className="gradient-text">How It Works</span>
                </h2>
                <p className="section-description">
                  Transform your code in three simple steps with our advanced AI technology
                </p>
              </div>

              <div className="workflow-grid">
                <div className="workflow-card">
                  <div className="workflow-icon">
                    <i className="fas fa-upload"></i>
                    <div className="icon-bg"></div>
                  </div>
                  <div className="workflow-content">
                    <h3>1. Upload Project</h3>
                    <p>Drag and drop your project files or browse to upload</p>
                  </div>
                  <div className="workflow-connector"></div>
                </div>

                <div className="workflow-card">
                  <div className="workflow-icon">
                    <i className="fas fa-brain"></i>
                    <div className="icon-bg"></div>
                  </div>
                  <div className="workflow-content">
                    <h3>2. AI Analysis</h3>
                    <p>Our AI analyzes your code structure and dependencies</p>
                  </div>
                  <div className="workflow-connector"></div>
                </div>

                <div className="workflow-card">
                  <div className="workflow-icon">
                    <i className="fas fa-magic"></i>
                    <div className="icon-bg"></div>
                  </div>
                  <div className="workflow-content">
                    <h3>3. Transform</h3>
                    <p>Get your converted project with preserved functionality</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="project-workspace">
              <div className="workspace-grid">
                <div className="workspace-sidebar">
                  <div className="glass-panel">
                    <UploadSection 
                      onProjectCreated={setCurrentProject}
                    />
                  </div>
                  
                  {currentProject && (
                    <div className="glass-panel">
                      <AnalysisResults projectId={currentProject} />
                    </div>
                  )}
                </div>

                <div className="workspace-main">
                  {currentProject && (
                    <>
                      <div className="glass-panel">
                        <ConversionPanel
                          projectId={currentProject}
                          frameworks={(frameworks as any) || []}
                          onConversionStarted={setActiveConversionJob}
                        />
                      </div>

                      <div className="glass-panel">
                        <ASTVisualization projectId={currentProject} />
                      </div>

                      {activeConversionJob && (
                        <div className="glass-panel">
                          <ConversionProgress 
                            jobId={activeConversionJob}
                            projectId={currentProject}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Framework Showcase */}
          <div className="frameworks-section">
            <div className="section-header">
              <h2 className="section-title">
                <span className="gradient-text">Supported Technologies</span>
              </h2>
              <p className="section-description">
                Convert between the most popular frameworks and languages
              </p>
            </div>

            <div className="glass-panel">
              <LanguageCategorization frameworks={(frameworks as any) || []} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}