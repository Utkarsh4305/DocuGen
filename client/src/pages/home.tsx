import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import UploadSection from "@/components/upload-section";
import AnalysisResults from "@/components/analysis-results";
import ConversionPanel from "@/components/conversion-panel";
import SimpleConverter from "@/components/simple-converter";
import ASTVisualization from "@/components/ast-visualization";
import ConversionProgress from "@/components/conversion-progress";
import LanguageCategorization from "@/components/language-categorization";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [currentProject, setCurrentProject] = useState<string | null>(null);
  const [activeConversionJob, setActiveConversionJob] = useState<string | null>(null);

  const { data: frameworks } = useQuery({
    queryKey: ['/api/frameworks'],
    enabled: true,
  });

  const { data: project } = useQuery({
    queryKey: ['/api/projects', currentProject],
    enabled: !!currentProject,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <i className="fas fa-code-branch text-2xl text-primary"></i>
              <h1 className="text-xl font-bold text-gray-900">Universal Code Transpiler</h1>
              <Badge variant="secondary" data-testid="badge-beta">Beta</Badge>
            </div>
            <nav className="flex items-center space-x-6">
              <Button variant="ghost" data-testid="button-docs">Docs</Button>
              <Button variant="ghost" data-testid="button-examples">Examples</Button>
              <Button data-testid="button-github">
                <i className="fab fa-github mr-2"></i>GitHub
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Workflow */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Upload Section */}
          <div className="lg:col-span-1 space-y-6">
            <UploadSection 
              onProjectCreated={setCurrentProject}
              data-testid="section-upload"
            />
            
            {currentProject && (
              <AnalysisResults 
                projectId={currentProject}
                data-testid="section-analysis"
              />
            )}
          </div>

          {/* Conversion Panel */}
          <div className="lg:col-span-2 space-y-6">
            {currentProject && (
              <div className="space-y-4">
                <SimpleConverter
                  projectId={currentProject}
                  techStackAnalysis={project?.originalTechStack || { languages: [], frameworks: [] }}
                />
                <ConversionPanel
                  projectId={currentProject}
                  frameworks={frameworks || []}
                  onConversionStarted={setActiveConversionJob}
                  data-testid="section-conversion"
                />
              </div>
            )}

            {currentProject && (
              <ASTVisualization 
                projectId={currentProject}
                data-testid="section-ast"
              />
            )}

            {activeConversionJob && (
              <ConversionProgress 
                jobId={activeConversionJob}
                projectId={currentProject}
                data-testid="section-progress"
              />
            )}
          </div>
        </div>

        {/* Language Categorization */}
        <div className="mt-12">
          <LanguageCategorization 
            frameworks={frameworks || []}
            data-testid="section-languages"
          />
        </div>
      </div>
    </div>
  );
}
