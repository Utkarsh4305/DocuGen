import { useState } from 'react';
import { ProjectAnalysis } from '@/utils/file-analyzer';
import { ConversionSettings } from './upload-flow';
import { Button } from '@/components/ui/button';

interface ConversionOptionsStepProps {
  analysis: ProjectAnalysis;
  onNext: (settings: ConversionSettings) => void;
  onBack: () => void;
}

const techStackMigrations = {
  web: [
    { from: 'React', to: 'Vue.js', description: 'Component-based to Vue ecosystem' },
    { from: 'React', to: 'Angular', description: 'React components to Angular modules' },
    { from: 'Vue.js', to: 'React', description: 'Vue components to React ecosystem' },
    { from: 'Angular', to: 'React', description: 'Angular modules to React components' },
    { from: 'jQuery', to: 'React', description: 'Legacy jQuery to modern React' },
    { from: 'Vanilla JS', to: 'React', description: 'Plain JavaScript to React framework' }
  ],
  mobile: [
    { from: 'React Native', to: 'Flutter', description: 'Cross-platform React to Flutter/Dart' },
    { from: 'Flutter', to: 'React Native', description: 'Flutter/Dart to React Native' },
    { from: 'Android (Java)', to: 'Flutter', description: 'Native Android to cross-platform Flutter' },
    { from: 'iOS (Swift)', to: 'Flutter', description: 'Native iOS to cross-platform Flutter' },
    { from: 'Web App', to: 'React Native', description: 'Convert web app to mobile app' },
    { from: 'Web App', to: 'Flutter', description: 'Convert web app to mobile app' }
  ],
  backend: [
    { from: 'Express.js', to: 'FastAPI', description: 'Node.js Express to Python FastAPI' },
    { from: 'Django', to: 'Express.js', description: 'Python Django to Node.js Express' },
    { from: 'Spring Boot', to: 'Express.js', description: 'Java Spring Boot to Node.js' },
    { from: 'PHP Laravel', to: 'Express.js', description: 'PHP Laravel to Node.js Express' },
    { from: 'Ruby on Rails', to: 'Express.js', description: 'Ruby on Rails to Node.js' }
  ]
};

const partialChangeOptions = [
  {
    id: 'components',
    title: 'Component Updates',
    description: 'Update specific components while keeping the same framework',
    icon: 'fas fa-puzzle-piece',
    examples: ['Add TypeScript', 'Update to latest syntax', 'Add responsive design']
  },
  {
    id: 'styling',
    title: 'Styling System',
    description: 'Modernize CSS and styling approach',
    icon: 'fas fa-paint-brush',
    examples: ['CSS to Tailwind CSS', 'SCSS to CSS-in-JS', 'Bootstrap to Material-UI']
  },
  {
    id: 'state-management',
    title: 'State Management',
    description: 'Update state management solutions',
    icon: 'fas fa-database',
    examples: ['Redux to Zustand', 'Context API to Redux', 'Local state to global store']
  },
  {
    id: 'build-tools',
    title: 'Build & Tooling',
    description: 'Modernize build system and development tools',
    icon: 'fas fa-tools',
    examples: ['Webpack to Vite', 'Babel to SWC', 'Jest to Vitest']
  }
];

export default function ConversionOptionsStep({ analysis, onNext, onBack }: ConversionOptionsStepProps) {
  const [conversionType, setConversionType] = useState<'partial' | 'complete-migration'>('partial');
  const [selectedMigration, setSelectedMigration] = useState<string>('');
  const [selectedPartialChanges, setSelectedPartialChanges] = useState<string[]>([]);
  const [preserveStructure, setPreserveStructure] = useState(true);
  const [maintainFunctionality, setMaintainFunctionality] = useState(true);
  const [addModernFeatures, setAddModernFeatures] = useState(false);

  const currentMigrations = techStackMigrations[analysis.projectType] || [];

  const handleSubmit = () => {
    const settings: ConversionSettings = {
      conversionType,
      targetTechStack: selectedMigration,
      specificChanges: selectedPartialChanges,
      preserveStructure,
      maintainFunctionality,
      addModernFeatures
    };
    onNext(settings);
  };

  const togglePartialChange = (changeId: string) => {
    setSelectedPartialChanges(prev => 
      prev.includes(changeId) 
        ? prev.filter(id => id !== changeId)
        : [...prev, changeId]
    );
  };

  return (
    <div className="conversion-options-step">
      <div className="options-header">
        <div className="options-icon">
          <i className="fas fa-cogs"></i>
        </div>
        <div className="options-title">
          <h1>Choose Conversion Type</h1>
          <p>Select how you'd like to transform your {analysis.detectedFramework} project</p>
        </div>
      </div>

      {/* Conversion Type Selection */}
      <div className="conversion-type-selection">
        <div 
          className={`conversion-option ${conversionType === 'partial' ? 'selected' : ''}`}
          onClick={() => setConversionType('partial')}
        >
          <div className="option-header">
            <div className="option-icon partial">
              <i className="fas fa-wrench"></i>
            </div>
            <div className="option-content">
              <h3>Partial Updates</h3>
              <p>Improve specific parts while keeping the same framework</p>
            </div>
            <div className="option-radio">
              <div className={`radio ${conversionType === 'partial' ? 'selected' : ''}`}></div>
            </div>
          </div>
          
          {conversionType === 'partial' && (
            <div className="option-details">
              <div className="partial-changes-grid">
                {partialChangeOptions.map(option => (
                  <div 
                    key={option.id}
                    className={`partial-change-card ${selectedPartialChanges.includes(option.id) ? 'selected' : ''}`}
                    onClick={() => togglePartialChange(option.id)}
                  >
                    <div className="change-icon">
                      <i className={option.icon}></i>
                    </div>
                    <div className="change-content">
                      <h4>{option.title}</h4>
                      <p>{option.description}</p>
                      <div className="change-examples">
                        {option.examples.map((example, index) => (
                          <span key={index} className="example-tag">{example}</span>
                        ))}
                      </div>
                    </div>
                    <div className="change-checkbox">
                      <i className={`fas ${selectedPartialChanges.includes(option.id) ? 'fa-check-square' : 'fa-square'}`}></i>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div 
          className={`conversion-option ${conversionType === 'complete-migration' ? 'selected' : ''}`}
          onClick={() => setConversionType('complete-migration')}
        >
          <div className="option-header">
            <div className="option-icon complete">
              <i className="fas fa-rocket"></i>
            </div>
            <div className="option-content">
              <h3>Complete Migration</h3>
              <p>Transform to a completely different tech stack</p>
            </div>
            <div className="option-radio">
              <div className={`radio ${conversionType === 'complete-migration' ? 'selected' : ''}`}></div>
            </div>
          </div>

          {conversionType === 'complete-migration' && (
            <div className="option-details">
              <div className="migration-options">
                <h4>Available Migrations for {analysis.projectType} projects:</h4>
                <div className="migration-grid">
                  {currentMigrations.map((migration, index) => (
                    <div 
                      key={index}
                      className={`migration-card ${selectedMigration === `${migration.from}-to-${migration.to}` ? 'selected' : ''}`}
                      onClick={() => setSelectedMigration(`${migration.from}-to-${migration.to}`)}
                    >
                      <div className="migration-flow">
                        <div className="tech-from">{migration.from}</div>
                        <div className="migration-arrow">
                          <i className="fas fa-arrow-right"></i>
                        </div>
                        <div className="tech-to">{migration.to}</div>
                      </div>
                      <p className="migration-description">{migration.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Conversion Settings */}
      <div className="conversion-settings">
        <h3>Conversion Settings</h3>
        <div className="settings-grid">
          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-icon">
                <i className="fas fa-sitemap"></i>
              </div>
              <div className="setting-content">
                <h4>Preserve Structure</h4>
                <p>Keep the original project folder structure</p>
              </div>
            </div>
            <div className="setting-toggle">
              <label className="toggle">
                <input 
                  type="checkbox" 
                  checked={preserveStructure}
                  onChange={(e) => setPreserveStructure(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <div className="setting-content">
                <h4>Maintain Functionality</h4>
                <p>Ensure all existing features continue to work</p>
              </div>
            </div>
            <div className="setting-toggle">
              <label className="toggle">
                <input 
                  type="checkbox" 
                  checked={maintainFunctionality}
                  onChange={(e) => setMaintainFunctionality(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-icon">
                <i className="fas fa-plus-circle"></i>
              </div>
              <div className="setting-content">
                <h4>Add Modern Features</h4>
                <p>Include latest best practices and optimizations</p>
              </div>
            </div>
            <div className="setting-toggle">
              <label className="toggle">
                <input 
                  type="checkbox" 
                  checked={addModernFeatures}
                  onChange={(e) => setAddModernFeatures(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Summary */}
      <div className="conversion-summary">
        <h3>Conversion Summary</h3>
        <div className="summary-content">
          <div className="summary-item">
            <span className="summary-label">Type:</span>
            <span className="summary-value">
              {conversionType === 'partial' ? 'Partial Updates' : 'Complete Migration'}
            </span>
          </div>
          
          {conversionType === 'partial' && selectedPartialChanges.length > 0 && (
            <div className="summary-item">
              <span className="summary-label">Changes:</span>
              <div className="summary-tags">
                {selectedPartialChanges.map(changeId => {
                  const option = partialChangeOptions.find(o => o.id === changeId);
                  return option ? (
                    <span key={changeId} className="summary-tag">{option.title}</span>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {conversionType === 'complete-migration' && selectedMigration && (
            <div className="summary-item">
              <span className="summary-label">Migration:</span>
              <span className="summary-value">{selectedMigration.replace('-to-', ' → ')}</span>
            </div>
          )}

          <div className="summary-item">
            <span className="summary-label">Settings:</span>
            <div className="summary-settings">
              {preserveStructure && <span className="setting-badge">Preserve Structure</span>}
              {maintainFunctionality && <span className="setting-badge">Maintain Functionality</span>}
              {addModernFeatures && <span className="setting-badge">Add Modern Features</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="options-actions">
        <Button variant="outline" onClick={onBack} className="back-btn">
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Analysis
        </Button>
        <Button 
          onClick={handleSubmit} 
          className="start-conversion-btn"
          disabled={
            conversionType === 'partial' 
              ? selectedPartialChanges.length === 0 
              : !selectedMigration
          }
        >
          Start Conversion
          <i className="fas fa-arrow-right ml-2"></i>
        </Button>
      </div>
    </div>
  );
}