import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ProjectAnalysis, fileAnalyzer } from '@/utils/file-analyzer';
import { Button } from '@/components/ui/button';
import UploadStep from './upload-step';
import AnalysisStep from './analysis-step';
import ConversionOptionsStep from './conversion-options-step';
import ProcessingStep from './processing-step';

export type UploadFlowStep = 'upload' | 'analyzing' | 'analysis' | 'conversion-options' | 'processing' | 'complete';

export interface ConversionSettings {
  conversionType: 'partial' | 'complete-migration';
  targetTechStack?: string;
  specificChanges?: string[];
  preserveStructure: boolean;
  maintainFunctionality: boolean;
  addModernFeatures: boolean;
}

interface UploadFlowProps {
  onComplete?: (analysis: ProjectAnalysis, settings: ConversionSettings) => void;
  onBack?: () => void;
}

export default function UploadFlow({ onComplete, onBack }: UploadFlowProps) {
  const [currentStep, setCurrentStep] = useState<UploadFlowStep>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [projectAnalysis, setProjectAnalysis] = useState<ProjectAnalysis | null>(null);
  const [conversionSettings, setConversionSettings] = useState<ConversionSettings>({
    conversionType: 'partial',
    preserveStructure: true,
    maintainFunctionality: true,
    addModernFeatures: false
  });
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.zip')) {
      setError('Please upload a ZIP file containing your project');
      return;
    }

    setError(null);
    setUploadedFile(file);
    setCurrentStep('analyzing');
    
    try {
      // Simulate analysis progress
      setAnalysisProgress(0);
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      const analysis = await fileAnalyzer.analyzeZipFile(file);
      
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      setProjectAnalysis(analysis);
      
      // Wait a moment to show 100% completion
      setTimeout(() => {
        setCurrentStep('analysis');
      }, 1000);
    } catch (err) {
      setError('Failed to analyze the uploaded file. Please ensure it\'s a valid ZIP file.');
      setCurrentStep('upload');
      console.error('Analysis error:', err);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip'],
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    maxFiles: 1,
  });

  const handleAnalysisNext = () => {
    setCurrentStep('conversion-options');
  };

  const handleConversionOptionsNext = (settings: ConversionSettings) => {
    setConversionSettings(settings);
    setCurrentStep('processing');
    
    // Simulate processing
    setTimeout(() => {
      setCurrentStep('complete');
      if (onComplete && projectAnalysis) {
        onComplete(projectAnalysis, settings);
      }
    }, 3000);
  };

  const handleRestart = () => {
    setCurrentStep('upload');
    setUploadedFile(null);
    setProjectAnalysis(null);
    setAnalysisProgress(0);
    setError(null);
  };

  const getStepNumber = (step: UploadFlowStep): number => {
    const steps = { upload: 1, analyzing: 1, analysis: 2, 'conversion-options': 3, processing: 4, complete: 4 };
    return steps[step] || 1;
  };

  return (
    <div className="upload-flow">
      {/* Header with Progress */}
      <div className="flow-header">
        <div className="flow-progress">
          <div className="progress-steps">
            {[
              { step: 1, label: 'Upload', active: getStepNumber(currentStep) >= 1, completed: getStepNumber(currentStep) > 1 },
              { step: 2, label: 'Analysis', active: getStepNumber(currentStep) >= 2, completed: getStepNumber(currentStep) > 2 },
              { step: 3, label: 'Options', active: getStepNumber(currentStep) >= 3, completed: getStepNumber(currentStep) > 3 },
              { step: 4, label: 'Convert', active: getStepNumber(currentStep) >= 4, completed: false }
            ].map((item, index) => (
              <div key={item.step} className="progress-step">
                <div className={`step-circle ${item.completed ? 'completed' : item.active ? 'active' : ''}`}>
                  {item.completed ? (
                    <i className="fas fa-check"></i>
                  ) : (
                    <span>{item.step}</span>
                  )}
                </div>
                <span className="step-label">{item.label}</span>
                {index < 3 && <div className={`step-connector ${item.completed ? 'completed' : ''}`}></div>}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Step Content */}
      <div className="flow-content">
        {currentStep === 'upload' && (
          <UploadStep 
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            isDragActive={isDragActive}
            error={error}
          />
        )}

        {currentStep === 'analyzing' && (
          <div className="analyzing-step">
            <div className="analyzing-content">
              <div className="analyzing-icon">
                <i className="fas fa-atom animate-spin"></i>
              </div>
              <h2>Analyzing Your Project</h2>
              <p>Processing files and detecting technologies...</p>
              
              <div className="analysis-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${analysisProgress}%` }}
                  ></div>
                </div>
                <span className="progress-text">{Math.round(analysisProgress)}%</span>
              </div>

              {uploadedFile && (
                <div className="file-info">
                  <i className="fas fa-file-archive"></i>
                  <span>{uploadedFile.name}</span>
                  <span className="file-size">
                    {(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {currentStep === 'analysis' && projectAnalysis && (
          <AnalysisStep 
            analysis={projectAnalysis}
            onNext={handleAnalysisNext}
            onRestart={handleRestart}
          />
        )}

        {currentStep === 'conversion-options' && projectAnalysis && (
          <ConversionOptionsStep
            analysis={projectAnalysis}
            onNext={handleConversionOptionsNext}
            onBack={() => setCurrentStep('analysis')}
          />
        )}

        {currentStep === 'processing' && (
          <ProcessingStep 
            analysis={projectAnalysis}
            settings={conversionSettings}
          />
        )}

        {currentStep === 'complete' && (
          <div className="complete-step">
            <div className="complete-content">
              <div className="success-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <h2>Conversion Complete!</h2>
              <p>Your project has been successfully transformed.</p>
              
              <div className="complete-actions">
                <Button className="download-btn">
                  <i className="fas fa-download mr-2"></i>
                  Download Converted Project
                </Button>
                <Button variant="outline" onClick={handleRestart}>
                  <i className="fas fa-upload mr-2"></i>
                  Upload Another Project
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}