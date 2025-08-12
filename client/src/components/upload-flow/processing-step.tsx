import { useState, useEffect } from 'react';
import { ProjectAnalysis } from '@/utils/file-analyzer';
import { ConversionSettings } from './upload-flow';

interface ProcessingStepProps {
  analysis: ProjectAnalysis | null;
  settings: ConversionSettings;
}

interface ProcessingPhase {
  id: string;
  label: string;
  description: string;
  icon: string;
  completed: boolean;
  active: boolean;
  progress: number;
}

export default function ProcessingStep({ analysis, settings }: ProcessingStepProps) {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [phases, setPhases] = useState<ProcessingPhase[]>([
    {
      id: 'parse',
      label: 'Parsing Code',
      description: 'Analyzing source code and building AST',
      icon: 'fas fa-code',
      completed: false,
      active: true,
      progress: 0
    },
    {
      id: 'analyze',
      label: 'Code Analysis',
      description: 'Identifying patterns and dependencies',
      icon: 'fas fa-search',
      completed: false,
      active: false,
      progress: 0
    },
    {
      id: 'transform',
      label: 'Transformation',
      description: 'Converting code to target framework',
      icon: 'fas fa-magic',
      completed: false,
      active: false,
      progress: 0
    },
    {
      id: 'optimize',
      label: 'Optimization',
      description: 'Applying performance improvements',
      icon: 'fas fa-rocket',
      completed: false,
      active: false,
      progress: 0
    },
    {
      id: 'validate',
      label: 'Validation',
      description: 'Ensuring code quality and functionality',
      icon: 'fas fa-check-circle',
      completed: false,
      active: false,
      progress: 0
    }
  ]);

  const [processingStats, setProcessingStats] = useState({
    filesProcessed: 0,
    linesConverted: 0,
    componentsTransformed: 0,
    dependenciesResolved: 0
  });

  const [processingMessages, setProcessingMessages] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhases(prevPhases => {
        const newPhases = [...prevPhases];
        const currentPhase = newPhases[currentPhaseIndex];

        if (currentPhase && !currentPhase.completed) {
          // Update current phase progress
          const newProgress = Math.min(currentPhase.progress + Math.random() * 15, 100);
          currentPhase.progress = newProgress;

          // Update stats
          setProcessingStats(prev => ({
            filesProcessed: Math.min(prev.filesProcessed + Math.floor(Math.random() * 3), analysis?.totalFiles || 100),
            linesConverted: Math.min(prev.linesConverted + Math.floor(Math.random() * 50), analysis?.totalLines || 5000),
            componentsTransformed: Math.min(prev.componentsTransformed + Math.floor(Math.random() * 2), 25),
            dependenciesResolved: Math.min(prev.dependenciesResolved + Math.floor(Math.random() * 1), 15)
          }));

          // Add processing message
          if (Math.random() < 0.3) {
            const messages = getPhaseMessages(currentPhase.id);
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            setProcessingMessages(prev => {
              const newMessages = [...prev, randomMessage];
              return newMessages.slice(-5); // Keep only last 5 messages
            });
          }

          // If phase is complete, move to next
          if (newProgress >= 100) {
            currentPhase.completed = true;
            currentPhase.active = false;
            
            if (currentPhaseIndex < newPhases.length - 1) {
              setCurrentPhaseIndex(prev => prev + 1);
              newPhases[currentPhaseIndex + 1].active = true;
            }
          }
        }

        // Calculate overall progress
        const totalProgress = newPhases.reduce((sum, phase) => sum + phase.progress, 0);
        const avgProgress = totalProgress / newPhases.length;
        setOverallProgress(avgProgress);

        return newPhases;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [currentPhaseIndex, analysis?.totalFiles, analysis?.totalLines]);

  const getPhaseMessages = (phaseId: string): string[] => {
    const messages = {
      parse: [
        'Parsing JavaScript components...',
        'Building Abstract Syntax Tree...',
        'Identifying component structure...',
        'Processing imports and exports...',
        'Analyzing JSX elements...'
      ],
      analyze: [
        'Detecting component patterns...',
        'Mapping prop dependencies...',
        'Analyzing state management...',
        'Identifying lifecycle methods...',
        'Processing event handlers...'
      ],
      transform: [
        'Converting React components to Vue...',
        'Transforming JSX to Vue templates...',
        'Updating state management...',
        'Converting event handlers...',
        'Adapting styling approach...'
      ],
      optimize: [
        'Optimizing component performance...',
        'Applying modern syntax...',
        'Reducing bundle size...',
        'Improving code splitting...',
        'Adding TypeScript types...'
      ],
      validate: [
        'Running code validation...',
        'Checking type safety...',
        'Verifying component functionality...',
        'Testing import/export integrity...',
        'Finalizing conversion...'
      ]
    };
    return messages[phaseId as keyof typeof messages] || ['Processing...'];
  };

  const getConversionTypeDisplay = () => {
    if (settings.conversionType === 'partial') {
      return `Partial Updates (${settings.specificChanges?.length || 0} changes)`;
    }
    return `Complete Migration (${settings.targetTechStack?.replace('-to-', ' → ') || 'Unknown'})`;
  };

  return (
    <div className="processing-step">
      <div className="processing-header">
        <div className="processing-icon">
          <div className="icon-container">
            <i className="fas fa-cogs animate-spin"></i>
            <div className="progress-ring">
              <svg className="progress-ring-svg" width="80" height="80">
                <circle
                  className="progress-ring-circle-bg"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="3"
                  fill="transparent"
                  r="35"
                  cx="40"
                  cy="40"
                />
                <circle
                  className="progress-ring-circle"
                  stroke="url(#gradient)"
                  strokeWidth="3"
                  fill="transparent"
                  r="35"
                  cx="40"
                  cy="40"
                  style={{
                    strokeDasharray: `${2 * Math.PI * 35}`,
                    strokeDashoffset: `${2 * Math.PI * 35 * (1 - overallProgress / 100)}`,
                    transform: 'rotate(-90deg)',
                    transformOrigin: '40px 40px'
                  }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00f5ff" />
                    <stop offset="100%" stopColor="#b400ff" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
        <div className="processing-title">
          <h1>Converting Your Project</h1>
          <p>{getConversionTypeDisplay()}</p>
          <div className="overall-progress">
            <span className="progress-text">{Math.round(overallProgress)}% Complete</span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Processing Phases */}
      <div className="processing-phases">
        <div className="phases-header">
          <h2>Conversion Process</h2>
        </div>
        <div className="phases-list">
          {phases.map((phase, index) => (
            <div key={phase.id} className={`phase-item ${phase.active ? 'active' : ''} ${phase.completed ? 'completed' : ''}`}>
              <div className="phase-indicator">
                <div className="phase-icon">
                  {phase.completed ? (
                    <i className="fas fa-check"></i>
                  ) : (
                    <i className={phase.icon}></i>
                  )}
                </div>
                <div className="phase-progress">
                  <div 
                    className="phase-progress-fill"
                    style={{ width: `${phase.progress}%` }}
                  ></div>
                </div>
              </div>
              <div className="phase-content">
                <h3>{phase.label}</h3>
                <p>{phase.description}</p>
                {phase.active && (
                  <div className="phase-status">
                    <span className="status-text">In Progress...</span>
                    <span className="status-percent">{Math.round(phase.progress)}%</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Processing Stats */}
      <div className="processing-stats">
        <div className="stats-header">
          <h2>Conversion Statistics</h2>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-file-code"></i>
            </div>
            <div className="stat-content">
              <span className="stat-number">{processingStats.filesProcessed}</span>
              <span className="stat-label">Files Processed</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-code"></i>
            </div>
            <div className="stat-content">
              <span className="stat-number">{processingStats.linesConverted.toLocaleString()}</span>
              <span className="stat-label">Lines Converted</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-puzzle-piece"></i>
            </div>
            <div className="stat-content">
              <span className="stat-number">{processingStats.componentsTransformed}</span>
              <span className="stat-label">Components Transformed</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-cube"></i>
            </div>
            <div className="stat-content">
              <span className="stat-number">{processingStats.dependenciesResolved}</span>
              <span className="stat-label">Dependencies Resolved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Processing Log */}
      <div className="processing-log">
        <div className="log-header">
          <h2>Processing Log</h2>
          <div className="log-indicator">
            <div className="pulse-dot"></div>
            <span>Live Output</span>
          </div>
        </div>
        <div className="log-content">
          {processingMessages.length === 0 ? (
            <div className="log-empty">
              <p>Processing will begin shortly...</p>
            </div>
          ) : (
            <div className="log-messages">
              {processingMessages.map((message, index) => (
                <div key={index} className="log-message">
                  <span className="log-timestamp">
                    {new Date().toLocaleTimeString()}
                  </span>
                  <span className="log-text">{message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Project Info Card */}
      {analysis && (
        <div className="project-info-card">
          <div className="info-header">
            <h3>Project Information</h3>
          </div>
          <div className="info-content">
            <div className="info-item">
              <span className="info-label">Framework:</span>
              <span className="info-value">{analysis.detectedFramework}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Project Type:</span>
              <span className="info-value">{analysis.projectType}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Total Files:</span>
              <span className="info-value">{analysis.totalFiles.toLocaleString()}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Lines of Code:</span>
              <span className="info-value">{analysis.totalLines.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}