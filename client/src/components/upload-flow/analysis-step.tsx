import { ProjectAnalysis } from '@/utils/file-analyzer';
import { Button } from '@/components/ui/button';

interface AnalysisStepProps {
  analysis: ProjectAnalysis;
  onNext: () => void;
  onRestart: () => void;
}

const languageColors: { [key: string]: string } = {
  'JavaScript': '#f1e05a',
  'TypeScript': '#2b7489',
  'HTML': '#e34c26',
  'CSS': '#563d7c',
  'SCSS': '#c6538c',
  'Python': '#3572A5',
  'Java': '#b07219',
  'C#': '#239120',
  'C++': '#f34b7d',
  'PHP': '#4F5D95',
  'Ruby': '#701516',
  'Go': '#00ADD8',
  'Rust': '#dea584',
  'Swift': '#ffac45',
  'Kotlin': '#F18E33',
  'Dart': '#00B4AB',
  'JSON': '#292929',
  'YAML': '#cb171e',
  'Markdown': '#083fa1',
  'Other': '#ededed'
};

export default function AnalysisStep({ analysis, onNext, onRestart }: AnalysisStepProps) {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  const getProjectTypeIcon = (type: string) => {
    const icons = {
      web: 'fas fa-globe',
      mobile: 'fas fa-mobile-alt',
      desktop: 'fas fa-desktop',
      backend: 'fas fa-server',
      unknown: 'fas fa-question-circle'
    };
    return icons[type as keyof typeof icons] || icons.unknown;
  };

  const sortedLanguages = Object.entries(analysis.languages)
    .sort(([, a], [, b]) => b.percentage - a.percentage)
    .filter(([, data]) => data.percentage > 0);

  return (
    <div className="analysis-step">
      {/* Header */}
      <div className="analysis-header">
        <div className="analysis-icon">
          <i className="fas fa-chart-pie"></i>
        </div>
        <div className="analysis-title">
          <h1>Project Analysis Complete</h1>
          <p>Here's what we discovered about your project</p>
        </div>
      </div>

      {/* Project Overview Cards */}
      <div className="overview-cards">
        <div className="overview-card">
          <div className="card-icon project-type">
            <i className={getProjectTypeIcon(analysis.projectType)}></i>
          </div>
          <div className="card-content">
            <h3>Project Type</h3>
            <p className="card-value">{analysis.projectType === 'unknown' ? 'Mixed/Other' : analysis.projectType.charAt(0).toUpperCase() + analysis.projectType.slice(1)}</p>
            <span className="card-subtitle">Detected platform</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon framework">
            <i className="fas fa-cube"></i>
          </div>
          <div className="card-content">
            <h3>Framework</h3>
            <p className="card-value">{analysis.detectedFramework}</p>
            <span className="card-subtitle">Primary technology</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon files">
            <i className="fas fa-file-code"></i>
          </div>
          <div className="card-content">
            <h3>Files</h3>
            <p className="card-value">{formatNumber(analysis.totalFiles)}</p>
            <span className="card-subtitle">Total files analyzed</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon size">
            <i className="fas fa-hdd"></i>
          </div>
          <div className="card-content">
            <h3>Size</h3>
            <p className="card-value">{formatBytes(analysis.totalSize)}</p>
            <span className="card-subtitle">Total project size</span>
          </div>
        </div>
      </div>

      {/* Language Breakdown - GitHub Style */}
      <div className="language-breakdown">
        <div className="breakdown-header">
          <h2>
            <i className="fas fa-code mr-2"></i>
            Language Breakdown
          </h2>
          <span className="total-lines">{formatNumber(analysis.totalLines)} lines of code</span>
        </div>

        {/* Language Bar */}
        <div className="language-bar">
          {sortedLanguages.map(([language, data]) => (
            <div
              key={language}
              className="language-segment"
              style={{
                width: `${data.percentage}%`,
                backgroundColor: languageColors[language] || languageColors.Other
              }}
              title={`${language}: ${data.percentage}%`}
            />
          ))}
        </div>

        {/* Language List */}
        <div className="language-list">
          {sortedLanguages.map(([language, data]) => (
            <div key={language} className="language-item">
              <div className="language-info">
                <div 
                  className="language-color"
                  style={{ backgroundColor: languageColors[language] || languageColors.Other }}
                />
                <span className="language-name">{language}</span>
              </div>
              <div className="language-stats">
                <span className="percentage">{data.percentage}%</span>
                <span className="details">
                  {formatNumber(data.lines)} lines, {data.files} files
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="tech-stack">
        <h2>
          <i className="fas fa-layer-group mr-2"></i>
          Detected Technologies
        </h2>
        <div className="tech-tags">
          {analysis.techStack.map((tech, index) => (
            <div key={index} className="tech-tag">
              <span>{tech}</span>
            </div>
          ))}
        </div>
      </div>

      {/* File Structure Preview */}
      <div className="file-structure">
        <div className="structure-header">
          <h2>
            <i className="fas fa-folder-tree mr-2"></i>
            Project Structure Preview
          </h2>
          <span className="file-count">Showing top files by size</span>
        </div>
        
        <div className="file-list">
          {analysis.files
            .sort((a, b) => b.size - a.size)
            .slice(0, 8)
            .map((file, index) => (
              <div key={index} className="file-item">
                <div className="file-icon">
                  <i className={getFileIcon(file.language)}></i>
                </div>
                <div className="file-details">
                  <span className="file-name">{file.fileName}</span>
                  <span className="file-path">{file.path}</span>
                </div>
                <div className="file-stats">
                  <span className="file-size">{formatBytes(file.size)}</span>
                  <span className="file-lines">{formatNumber(file.lines)} lines</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Actions */}
      <div className="analysis-actions">
        <Button variant="outline" onClick={onRestart} className="restart-btn">
          <i className="fas fa-upload mr-2"></i>
          Upload Different Project
        </Button>
        <Button onClick={onNext} className="continue-btn">
          Continue to Conversion Options
          <i className="fas fa-arrow-right ml-2"></i>
        </Button>
      </div>
    </div>
  );
}

function getFileIcon(language: string): string {
  const icons: { [key: string]: string } = {
    'JavaScript': 'fab fa-js-square text-yellow-400',
    'TypeScript': 'fab fa-js-square text-blue-400',
    'HTML': 'fab fa-html5 text-orange-500',
    'CSS': 'fab fa-css3-alt text-blue-500',
    'Python': 'fab fa-python text-green-500',
    'Java': 'fab fa-java text-red-500',
    'PHP': 'fab fa-php text-purple-500',
    'JSON': 'fas fa-file-code text-gray-400',
    'Markdown': 'fab fa-markdown text-blue-600',
  };
  return icons[language] || 'fas fa-file-code text-gray-400';
}