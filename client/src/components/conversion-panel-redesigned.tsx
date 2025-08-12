import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SupportedFramework {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  maturity: string;
  difficulty: string;
}

interface ConversionPanelProps {
  projectId: string | null;
  frameworks: SupportedFramework[];
  onConversionStarted: (jobId: string) => void;
}

interface ConversionOptions {
  preserveStructure: boolean;
  maintainState: boolean;
  addTypeAnnotations: boolean;
  convertApiCalls: boolean;
}

export default function ConversionPanelRedesigned({ 
  projectId, 
  frameworks, 
  onConversionStarted 
}: ConversionPanelProps) {
  const [activeTab, setActiveTab] = useState("frontend");
  const [sourceFramework, setSourceFramework] = useState<string>("");
  const [targetFramework, setTargetFramework] = useState<string>("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [conversionStep, setConversionStep] = useState(0);
  const [options, setOptions] = useState<ConversionOptions>({
    preserveStructure: true,
    maintainState: true,
    addTypeAnnotations: false,
    convertApiCalls: true,
  });

  const { toast } = useToast();

  const conversionMutation = useMutation({
    mutationFn: async (conversionData: any) => {
      const response = await apiRequest('POST', `/api/projects/${projectId}/convert`, conversionData);
      
      if (response.headers.get('content-type')?.includes('application/zip')) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.headers.get('content-disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'converted_project.zip';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return { success: true };
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "🎉 Conversion Complete!",
          description: "Your transformed project is ready for download.",
        });
      } else {
        onConversionStarted(data.conversionJob?.id || "unknown");
        toast({
          title: "🚀 Conversion Started",
          description: "System is transforming your project...",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Conversion Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStartConversion = () => {
    if (!projectId || !sourceFramework || !targetFramework) {
      toast({
        title: "Missing Selection",
        description: "Please select both source and target frameworks.",
        variant: "destructive",
      });
      return;
    }

    conversionMutation.mutate({
      fromFramework: sourceFramework,
      toFramework: targetFramework,
      layer: activeTab,
      options,
    });
  };

  const getFrameworksByCategory = (category: string) => {
    const categoryMap: Record<string, string> = {
      frontend: "Frontend Web Development",
      backend: "Backend/API Development", 
      database: "Database Languages",
    };
    
    return frameworks.filter(f => f.category === categoryMap[category]);
  };

  const selectedSource = frameworks.find(f => f.id === sourceFramework);
  const selectedTarget = frameworks.find(f => f.id === targetFramework);

  const tabs = [
    { id: 'frontend', label: 'Frontend', icon: 'fas fa-palette', color: '#00f5ff' },
    { id: 'backend', label: 'Backend', icon: 'fas fa-server', color: '#b400ff' },
    { id: 'database', label: 'Database', icon: 'fas fa-database', color: '#00ff88' }
  ];

  return (
    <div className="conversion-panel">
      {/* Panel Header */}
      <div className="panel-header">
        <div className="header-icon">
          <div className="icon-container">
            <i className="fas fa-magic"></i>
            <div className="icon-glow"></div>
          </div>
        </div>
        
        <div className="header-text">
          <h2 className="panel-title">
            <span className="gradient-text">Code Transformation</span>
          </h2>
          <p className="panel-subtitle">
            Configure your framework conversion with precision
          </p>
        </div>
        
        <div className="conversion-status">
          <div className="status-indicator">
            <div className="status-dot"></div>
            <span>Ready</span>
          </div>
        </div>
      </div>

      {/* Advanced Tab System */}
      <div className="tab-system">
        <div className="tab-list">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              style={{ '--tab-color': tab.color } as React.CSSProperties}
            >
              <div className="tab-icon">
                <i className={tab.icon}></i>
              </div>
              <span className="tab-label">{tab.label}</span>
              <div className="tab-indicator"></div>
              {activeTab === tab.id && <div className="tab-glow"></div>}
            </button>
          ))}
        </div>
      </div>

      {/* Framework Selection */}
      <div className="framework-selection">
        <div className="selection-grid">
          {/* Source Framework */}
          <div className="framework-column">
            <div className="column-header">
              <div className="header-icon">
                <i className="fas fa-play"></i>
              </div>
              <h3>Source Framework</h3>
            </div>
            
            {selectedSource ? (
              <div className="selected-framework">
                <div className="framework-card selected">
                  <div className="framework-icon">
                    <i className={selectedSource.icon}></i>
                    <div className="icon-bg"></div>
                  </div>
                  <div className="framework-info">
                    <h4>{selectedSource.name}</h4>
                    <p>{selectedSource.description}</p>
                  </div>
                  <button 
                    className="change-btn"
                    onClick={() => setSourceFramework("")}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                </div>
              </div>
            ) : (
              <div className="framework-grid">
                {getFrameworksByCategory(activeTab).map((framework) => (
                  <button
                    key={framework.id}
                    onClick={() => setSourceFramework(framework.id)}
                    className="framework-card selectable"
                  >
                    <div className="framework-icon">
                      <i className={framework.icon}></i>
                      <div className="icon-bg"></div>
                    </div>
                    <div className="framework-info">
                      <h4>{framework.name}</h4>
                      <div className="framework-badges">
                        <span className={`badge ${framework.maturity.toLowerCase()}`}>
                          {framework.maturity}
                        </span>
                        <span className={`badge ${framework.difficulty.toLowerCase()}`}>
                          {framework.difficulty}
                        </span>
                      </div>
                    </div>
                    <div className="selection-overlay">
                      <i className="fas fa-check"></i>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Conversion Arrow */}
          <div className="conversion-arrow">
            <div className="arrow-container">
              <div className="arrow-line"></div>
              <div className="arrow-head">
                <i className="fas fa-arrow-right"></i>
              </div>
              <div className="arrow-glow"></div>
            </div>
          </div>

          {/* Target Framework */}
          <div className="framework-column">
            <div className="column-header">
              <div className="header-icon">
                <i className="fas fa-bullseye"></i>
              </div>
              <h3>Target Framework</h3>
            </div>
            
            <div className="framework-grid">
              {getFrameworksByCategory(activeTab).map((framework) => (
                <button
                  key={framework.id}
                  onClick={() => setTargetFramework(framework.id)}
                  className={`framework-card selectable ${targetFramework === framework.id ? 'selected' : ''}`}
                  disabled={framework.id === sourceFramework}
                >
                  <div className="framework-icon">
                    <i className={framework.icon}></i>
                    <div className="icon-bg"></div>
                  </div>
                  <div className="framework-info">
                    <h4>{framework.name}</h4>
                    <div className="framework-badges">
                      <span className={`badge ${framework.maturity.toLowerCase()}`}>
                        {framework.maturity}
                      </span>
                      <span className={`badge ${framework.difficulty.toLowerCase()}`}>
                        {framework.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="selection-overlay">
                    <i className="fas fa-check"></i>
                  </div>
                  {framework.id === sourceFramework && (
                    <div className="disabled-overlay">
                      <i className="fas fa-ban"></i>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Options */}
      <div className="advanced-section">
        <button 
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="advanced-toggle"
        >
          <div className="toggle-icon">
            <i className="fas fa-sliders-h"></i>
          </div>
          <span>Advanced Configuration</span>
          <div className="toggle-arrow">
            <i className={`fas fa-chevron-${showAdvanced ? 'up' : 'down'}`}></i>
          </div>
        </button>
        
        {showAdvanced && (
          <div className="advanced-options">
            <div className="options-grid">
              {[
                { 
                  key: 'preserveStructure', 
                  label: 'Preserve Structure', 
                  desc: 'Keep original file organization',
                  icon: 'fas fa-sitemap'
                },
                { 
                  key: 'maintainState', 
                  label: 'Maintain State', 
                  desc: 'Preserve state management patterns',
                  icon: 'fas fa-memory'
                },
                { 
                  key: 'addTypeAnnotations', 
                  label: 'Add Types', 
                  desc: 'Include TypeScript annotations',
                  icon: 'fas fa-code'
                },
                { 
                  key: 'convertApiCalls', 
                  label: 'Convert APIs', 
                  desc: 'Transform HTTP requests',
                  icon: 'fas fa-exchange-alt'
                }
              ].map((option) => (
                <label key={option.key} className="option-card">
                  <div className="option-content">
                    <div className="option-icon">
                      <i className={option.icon}></i>
                    </div>
                    <div className="option-info">
                      <h4>{option.label}</h4>
                      <p>{option.desc}</p>
                    </div>
                  </div>
                  <div className="option-switch">
                    <input
                      type="checkbox"
                      checked={options[option.key as keyof ConversionOptions]}
                      onChange={(e) => 
                        setOptions(prev => ({ ...prev, [option.key]: e.target.checked }))
                      }
                    />
                    <div className="switch-slider"></div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="action-section">
        <button 
          onClick={() => {
            setSourceFramework("");
            setTargetFramework("");
            setOptions({
              preserveStructure: true,
              maintainState: true,
              addTypeAnnotations: false,
              convertApiCalls: true,
            });
          }}
          className="reset-btn"
        >
          <i className="fas fa-undo mr-2"></i>
          Reset
        </button>
        
        <button
          onClick={handleStartConversion}
          disabled={!projectId || !sourceFramework || !targetFramework || conversionMutation.isPending}
          className="convert-btn"
        >
          <div className="btn-content">
            <i className={`fas ${conversionMutation.isPending ? 'fa-spinner animate-spin' : 'fa-magic'} mr-2`}></i>
            <span>{conversionMutation.isPending ? "Transforming..." : "Start Transformation"}</span>
          </div>
          <div className="btn-glow"></div>
          <div className="btn-shine"></div>
        </button>
      </div>
    </div>
  );
}