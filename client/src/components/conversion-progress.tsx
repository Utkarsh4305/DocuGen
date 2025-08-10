import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, FileText, Loader2 } from "lucide-react";

interface ConversionStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  details?: string;
}

interface ConversionProgressProps {
  isActive: boolean;
  fromFramework: string;
  toFramework: string;
  totalFiles: number;
  onComplete?: () => void;
}

export default function ConversionProgress({ 
  isActive, 
  fromFramework, 
  toFramework, 
  totalFiles,
  onComplete 
}: ConversionProgressProps) {
  const [steps, setSteps] = useState<ConversionStep[]>([
    {
      id: 'analyze',
      name: 'Analyzing Project Structure',
      description: 'Reading and parsing all source files',
      status: 'pending',
      progress: 0,
    },
    {
      id: 'parse',
      name: 'Converting to JSON Intermediate',
      description: 'Creating universal representation of each file',
      status: 'pending',
      progress: 0,
    },
    {
      id: 'transform',
      name: 'Generating Target Code',
      description: `Converting JSON to ${toFramework} while preserving UI and logic`,
      status: 'pending',
      progress: 0,
    },
    {
      id: 'structure',
      name: 'Building Project Structure',
      description: `Creating proper ${toFramework} project layout`,
      status: 'pending',
      progress: 0,
    },
    {
      id: 'finalize',
      name: 'Finalizing Conversion',
      description: 'Adding configuration files and documentation',
      status: 'pending',
      progress: 0,
    },
  ]);

  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    let currentStep = 0;
    let currentFile = 0;

    const progressTimer = setInterval(() => {
      setSteps(prevSteps => {
        const newSteps = [...prevSteps];
        
        if (currentStep < newSteps.length) {
          const step = newSteps[currentStep];
          
          // Start processing current step
          if (step.status === 'pending') {
            step.status = 'processing';
          }
          
          // Update step progress
          if (step.status === 'processing') {
            step.progress += 20;
            
            // Update file-specific details
            if (step.id === 'parse' || step.id === 'transform') {
              step.details = `Processing file ${currentFile + 1} of ${totalFiles}`;
              setCurrentFileIndex(currentFile);
              
              if (step.progress >= 100) {
                currentFile = Math.min(currentFile + 1, totalFiles - 1);
              }
            }
            
            // Complete current step and move to next
            if (step.progress >= 100) {
              step.status = 'completed';
              step.progress = 100;
              currentStep++;
              
              // Add slight delay between steps
              setTimeout(() => {}, 500);
            }
          }
        }
        
        return newSteps;
      });
      
      // Update overall progress
      const completedSteps = steps.filter(s => s.status === 'completed').length;
      const processingSteps = steps.filter(s => s.status === 'processing').length * 0.5;
      const progress = ((completedSteps + processingSteps) / steps.length) * 100;
      setOverallProgress(progress);
      
      // Complete conversion
      if (completedSteps === steps.length) {
        clearInterval(progressTimer);
        setTimeout(() => {
          onComplete?.();
        }, 1000);
      }
      
    }, 800); // Slower interval for better user experience

    return () => clearInterval(progressTimer);
  }, [isActive, steps.length, totalFiles, onComplete]);

  if (!isActive) return null;

  const getStepIcon = (step: ConversionStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Converting {fromFramework} → {toFramework}
        </CardTitle>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Processing {totalFiles} files
          </span>
          <Badge variant="outline" className="text-xs">
            {Math.round(overallProgress)}% Complete
          </Badge>
        </div>
        <Progress value={overallProgress} className="w-full" />
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-start gap-3 p-3 rounded-lg border ${
                step.status === 'processing'
                  ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950'
                  : step.status === 'completed'
                  ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                  : 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950'
              }`}
            >
              <div className="mt-0.5">
                {getStepIcon(step)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-sm">{step.name}</h4>
                  <span className="text-xs text-muted-foreground">
                    {step.progress}%
                  </span>
                </div>
                
                <p className="text-xs text-muted-foreground mb-2">
                  {step.description}
                </p>
                
                {step.status === 'processing' && (
                  <Progress value={step.progress} className="h-1 mb-1" />
                )}
                
                {step.details && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    {step.details}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Estimated time remaining:
            </span>
            <span className="font-medium">
              {overallProgress < 100 ? `${Math.max(1, Math.ceil((100 - overallProgress) / 10))} minutes` : 'Complete!'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}