import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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

export default function ConversionPanel({ 
  projectId, 
  frameworks, 
  onConversionStarted 
}: ConversionPanelProps) {
  const [activeTab, setActiveTab] = useState("frontend");
  const [sourceFramework, setSourceFramework] = useState<string>("");
  const [targetFramework, setTargetFramework] = useState<string>("");
  const [showAdvanced, setShowAdvanced] = useState(false);
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
      
      // Handle ZIP download
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
          title: "Conversion completed!",
          description: "Your converted project has been downloaded as a ZIP file.",
        });
      } else {
        onConversionStarted(data.conversionJob?.id || "unknown");
        toast({
          title: "Conversion started",
          description: "Your project conversion has been initiated.",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Conversion failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStartConversion = () => {
    if (!projectId || !sourceFramework || !targetFramework) {
      toast({
        title: "Missing information",
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

  const getFrameworkIcon = (frameworkId: string) => {
    const framework = frameworks.find(f => f.id === frameworkId);
    return framework?.icon || "fas fa-code";
  };

  const getFrameworkName = (frameworkId: string) => {
    const framework = frameworks.find(f => f.id === frameworkId);
    return framework?.name || frameworkId;
  };

  return (
    <Card data-testid="card-conversion-panel">
      <CardHeader>
        <CardTitle className="flex items-center">
          <i className="fas fa-exchange-alt text-primary mr-2"></i>
          Conversion Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Conversion Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="frontend" data-testid="tab-frontend">Frontend</TabsTrigger>
            <TabsTrigger value="backend" data-testid="tab-backend">Backend</TabsTrigger>
            <TabsTrigger value="database" data-testid="tab-database">Database</TabsTrigger>
          </TabsList>

          <TabsContent value="frontend" className="mt-6">
            <ConversionTabContent 
              category="frontend"
              frameworks={getFrameworksByCategory("frontend")}
              sourceFramework={sourceFramework}
              targetFramework={targetFramework}
              onSourceChange={setSourceFramework}
              onTargetChange={setTargetFramework}
              getFrameworkIcon={getFrameworkIcon}
              getFrameworkName={getFrameworkName}
            />
          </TabsContent>

          <TabsContent value="backend" className="mt-6">
            <ConversionTabContent 
              category="backend"
              frameworks={getFrameworksByCategory("backend")}
              sourceFramework={sourceFramework}
              targetFramework={targetFramework}
              onSourceChange={setSourceFramework}
              onTargetChange={setTargetFramework}
              getFrameworkIcon={getFrameworkIcon}
              getFrameworkName={getFrameworkName}
            />
          </TabsContent>

          <TabsContent value="database" className="mt-6">
            <ConversionTabContent 
              category="database"
              frameworks={getFrameworksByCategory("database")}
              sourceFramework={sourceFramework}
              targetFramework={targetFramework}
              onSourceChange={setSourceFramework}
              onTargetChange={setTargetFramework}
              getFrameworkIcon={getFrameworkIcon}
              getFrameworkName={getFrameworkName}
            />
          </TabsContent>
        </Tabs>

        {/* Advanced Options */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-between p-0 h-auto"
              data-testid="button-advanced-options"
            >
              <span className="flex items-center text-sm text-gray-600 hover:text-gray-900">
                <i className="fas fa-cog mr-2"></i>
                Advanced Conversion Options
              </span>
              <i className={`fas fa-chevron-${showAdvanced ? 'up' : 'down'} ml-2`}></i>
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4 space-y-4" data-testid="section-advanced-options">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center space-x-2">
                <Checkbox 
                  checked={options.preserveStructure}
                  onCheckedChange={(checked) => 
                    setOptions(prev => ({ ...prev, preserveStructure: !!checked }))
                  }
                  data-testid="checkbox-preserve-structure"
                />
                <span className="text-sm text-gray-700">Preserve component structure</span>
              </label>

              <label className="flex items-center space-x-2">
                <Checkbox 
                  checked={options.maintainState}
                  onCheckedChange={(checked) => 
                    setOptions(prev => ({ ...prev, maintainState: !!checked }))
                  }
                  data-testid="checkbox-maintain-state"
                />
                <span className="text-sm text-gray-700">Maintain state management</span>
              </label>

              <label className="flex items-center space-x-2">
                <Checkbox 
                  checked={options.addTypeAnnotations}
                  onCheckedChange={(checked) => 
                    setOptions(prev => ({ ...prev, addTypeAnnotations: !!checked }))
                  }
                  data-testid="checkbox-add-types"
                />
                <span className="text-sm text-gray-700">Add type annotations</span>
              </label>

              <label className="flex items-center space-x-2">
                <Checkbox 
                  checked={options.convertApiCalls}
                  onCheckedChange={(checked) => 
                    setOptions(prev => ({ ...prev, convertApiCalls: !!checked }))
                  }
                  data-testid="checkbox-convert-api"
                />
                <span className="text-sm text-gray-700">Convert API calls</span>
              </label>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-8">
          <Button 
            variant="outline"
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
            data-testid="button-reset"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Reset
          </Button>
          
          <Button
            onClick={handleStartConversion}
            disabled={!projectId || !sourceFramework || !targetFramework || conversionMutation.isPending}
            data-testid="button-start-conversion"
          >
            <i className="fas fa-exchange-alt mr-2"></i>
            {conversionMutation.isPending ? "Starting..." : "Start Conversion"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface ConversionTabContentProps {
  category: string;
  frameworks: SupportedFramework[];
  sourceFramework: string;
  targetFramework: string;
  onSourceChange: (value: string) => void;
  onTargetChange: (value: string) => void;
  getFrameworkIcon: (id: string) => string;
  getFrameworkName: (id: string) => string;
}

function ConversionTabContent({
  frameworks,
  sourceFramework,
  targetFramework,
  onSourceChange,
  onTargetChange,
  getFrameworkIcon,
  getFrameworkName,
}: ConversionTabContentProps) {
  const selectedSource = frameworks.find(f => f.id === sourceFramework);
  const selectedTarget = frameworks.find(f => f.id === targetFramework);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Source Framework */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <i className="fas fa-arrow-right text-gray-400 mr-1"></i>
          From (Source)
        </label>
        
        {selectedSource ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center">
            <i className={`${selectedSource.icon} text-2xl mr-3`}></i>
            <div>
              <div className="font-medium text-gray-900">{selectedSource.name}</div>
              <div className="text-xs text-gray-500">{selectedSource.description}</div>
            </div>
          </div>
        ) : (
          <Select value={sourceFramework} onValueChange={onSourceChange}>
            <SelectTrigger data-testid="select-source-framework">
              <SelectValue placeholder="Select source framework..." />
            </SelectTrigger>
            <SelectContent>
              {frameworks.map((framework) => (
                <SelectItem key={framework.id} value={framework.id}>
                  <div className="flex items-center">
                    <i className={`${framework.icon} mr-2`}></i>
                    {framework.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Target Framework */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <i className="fas fa-arrow-left text-gray-400 mr-1"></i>
          To (Target)
        </label>
        
        <Select value={targetFramework} onValueChange={onTargetChange}>
          <SelectTrigger data-testid="select-target-framework">
            <SelectValue placeholder="Select target framework..." />
          </SelectTrigger>
          <SelectContent>
            {frameworks.map((framework) => (
              <SelectItem key={framework.id} value={framework.id}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <i className={`${framework.icon} mr-2`}></i>
                    {framework.name}
                  </div>
                  <div className="flex space-x-1">
                    <Badge variant="outline" className="text-xs">
                      {framework.maturity}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {framework.difficulty}
                    </Badge>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
