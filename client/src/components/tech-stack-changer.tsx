import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface TechStack {
  frontend?: FrameworkInfo;
  backend?: FrameworkInfo;
  mobile?: FrameworkInfo;
  database?: FrameworkInfo;
}

interface FrameworkInfo {
  name: string;
  version?: string;
  language: string;
  features: string[];
}

interface ConversionOptions {
  preserveStructure: boolean;
  maintainState: boolean;
  addTypeAnnotations: boolean;
  convertApiCalls: boolean;
  generateTests: boolean;
  preserveComments: boolean;
}

interface TechStackChangerProps {
  projectId: string;
  currentAnalysis: any;
  onConversionComplete: () => void;
}

export default function TechStackChanger({ 
  projectId, 
  currentAnalysis, 
  onConversionComplete 
}: TechStackChangerProps) {
  const [currentStack, setCurrentStack] = useState<TechStack>({});
  const [targetStack, setTargetStack] = useState<TechStack>({});
  const [activeTab, setActiveTab] = useState('frontend');
  const [options, setOptions] = useState<ConversionOptions>({
    preserveStructure: true,
    maintainState: true,
    addTypeAnnotations: false,
    convertApiCalls: true,
    generateTests: false,
    preserveComments: true,
  });

  const { toast } = useToast();

  // Fetch available tech stacks
  const { data: techStacks, isLoading: techStacksLoading } = useQuery({
    queryKey: ['/api/tech-stacks'],
  });

  // Initialize current stack from analysis
  useEffect(() => {
    if (currentAnalysis) {
      const detectedStack: TechStack = {};
      
      // Detect frontend framework
      if (currentAnalysis.frameworks?.includes('React')) {
        detectedStack.frontend = {
          name: 'React',
          language: 'typescript',
          features: ['hooks', 'jsx', 'virtual-dom']
        };
      } else if (currentAnalysis.frameworks?.includes('Vue')) {
        detectedStack.frontend = {
          name: 'Vue',
          language: 'javascript',
          features: ['composition-api', 'reactive']
        };
      } else if (currentAnalysis.frameworks?.includes('Angular')) {
        detectedStack.frontend = {
          name: 'Angular',
          language: 'typescript',
          features: ['components', 'services']
        };
      }
      
      // Detect backend framework
      if (currentAnalysis.frameworks?.includes('Express.js')) {
        detectedStack.backend = {
          name: 'Node.js',
          language: 'javascript',
          features: ['express', 'async']
        };
      } else if (currentAnalysis.frameworks?.includes('FastAPI')) {
        detectedStack.backend = {
          name: 'Python',
          language: 'python',
          features: ['fastapi', 'async']
        };
      }

      setCurrentStack(detectedStack);
    }
  }, [currentAnalysis]);

  const conversionMutation = useMutation({
    mutationFn: async () => {
      const conversionRequest = {
        projectId,
        currentStack,
        targetStack,
        conversionOptions: options
      };

      const response = await apiRequest('POST', `/api/projects/${projectId}/convert-stack`, conversionRequest);
      
      // Handle ZIP download
      if (response.headers.get('content-type')?.includes('application/zip')) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.headers.get('content-disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'converted_stack.zip';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return { success: true };
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Tech Stack Conversion Complete!",
        description: "Your project has been converted and downloaded as a ZIP file.",
      });
      onConversionComplete();
    },
    onError: (error: any) => {
      toast({
        title: "Conversion Failed",
        description: error.message || "Failed to convert tech stack",
        variant: "destructive",
      });
    },
  });

  const handleConversion = () => {
    if (Object.keys(targetStack).length === 0) {
      toast({
        title: "No Target Stack Selected",
        description: "Please select at least one target framework to convert to.",
        variant: "destructive",
      });
      return;
    }

    conversionMutation.mutate();
  };

  const updateTargetStack = (category: keyof TechStack, framework: FrameworkInfo | null) => {
    setTargetStack(prev => ({
      ...prev,
      [category]: framework
    }));
  };

  if (techStacksLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🔄 Tech Stack Converter</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading available tech stacks...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔄 Tech Stack Converter
          <Badge variant="secondary">Advanced</Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Convert your project to different frameworks while preserving UI structure, logic, and routes
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Stack Display */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Current Tech Stack</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(currentStack).map(([category, info]) => (
              <div key={category} className="bg-gray-50 p-3 rounded-lg">
                <div className="font-medium text-sm text-gray-600 mb-1">
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </div>
                <div className="font-semibold">{info.name}</div>
                <div className="text-xs text-gray-500">{info.language}</div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {info.features.slice(0, 2).map((feature: string) => (
                    <Badge key={feature} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Target Stack Selection */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Convert To</h3>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="frontend">Frontend</TabsTrigger>
              <TabsTrigger value="backend">Backend</TabsTrigger>
              <TabsTrigger value="mobile">Mobile</TabsTrigger>
            </TabsList>

            {/* Frontend Tab */}
            <TabsContent value="frontend" className="mt-4">
              <FrameworkSelector
                category="frontend"
                currentFramework={targetStack.frontend}
                availableFrameworks={(techStacks as any)?.frontend || []}
                onSelect={(framework) => updateTargetStack('frontend', framework)}
              />
            </TabsContent>

            {/* Backend Tab */}
            <TabsContent value="backend" className="mt-4">
              <FrameworkSelector
                category="backend"
                currentFramework={targetStack.backend}
                availableFrameworks={(techStacks as any)?.backend || []}
                onSelect={(framework) => updateTargetStack('backend', framework)}
              />
            </TabsContent>

            {/* Mobile Tab */}
            <TabsContent value="mobile" className="mt-4">
              <FrameworkSelector
                category="mobile"
                currentFramework={targetStack.mobile}
                availableFrameworks={(techStacks as any)?.mobile || []}
                onSelect={(framework) => updateTargetStack('mobile', framework)}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Selected Target Stack Preview */}
        {Object.keys(targetStack).length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-3">Target Tech Stack</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(targetStack).map(([category, info]) => (
                  <div key={category} className="bg-blue-50 p-3 rounded-lg border-2 border-blue-200">
                    <div className="font-medium text-sm text-blue-600 mb-1">
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </div>
                    <div className="font-semibold">{info.name}</div>
                    <div className="text-xs text-gray-500">{info.language}</div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {info.features.slice(0, 2).map((feature: string) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Conversion Options */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Conversion Options</h3>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center space-x-2">
              <Checkbox
                checked={options.preserveStructure}
                onCheckedChange={(checked) =>
                  setOptions(prev => ({ ...prev, preserveStructure: !!checked }))
                }
              />
              <span className="text-sm">Preserve component structure</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <Checkbox
                checked={options.maintainState}
                onCheckedChange={(checked) =>
                  setOptions(prev => ({ ...prev, maintainState: !!checked }))
                }
              />
              <span className="text-sm">Maintain state management</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <Checkbox
                checked={options.addTypeAnnotations}
                onCheckedChange={(checked) =>
                  setOptions(prev => ({ ...prev, addTypeAnnotations: !!checked }))
                }
              />
              <span className="text-sm">Add type annotations</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <Checkbox
                checked={options.convertApiCalls}
                onCheckedChange={(checked) =>
                  setOptions(prev => ({ ...prev, convertApiCalls: !!checked }))
                }
              />
              <span className="text-sm">Convert API calls</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <Checkbox
                checked={options.generateTests}
                onCheckedChange={(checked) =>
                  setOptions(prev => ({ ...prev, generateTests: !!checked }))
                }
              />
              <span className="text-sm">Generate test files</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <Checkbox
                checked={options.preserveComments}
                onCheckedChange={(checked) =>
                  setOptions(prev => ({ ...prev, preserveComments: !!checked }))
                }
              />
              <span className="text-sm">Preserve comments</span>
            </label>
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => {
              setTargetStack({});
              setOptions({
                preserveStructure: true,
                maintainState: true,
                addTypeAnnotations: false,
                convertApiCalls: true,
                generateTests: false,
                preserveComments: true,
              });
            }}
          >
            Reset
          </Button>
          
          <Button
            onClick={handleConversion}
            disabled={Object.keys(targetStack).length === 0 || conversionMutation.isPending}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            {conversionMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Converting...
              </>
            ) : (
              <>
                🚀 Convert Tech Stack
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface FrameworkSelectorProps {
  category: string;
  currentFramework?: FrameworkInfo;
  availableFrameworks: FrameworkInfo[];
  onSelect: (framework: FrameworkInfo | null) => void;
}

function FrameworkSelector({ 
  category, 
  currentFramework, 
  availableFrameworks, 
  onSelect 
}: FrameworkSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Select {category} framework:
        </label>
        <Select
          value={currentFramework?.name || ''}
          onValueChange={(value) => {
            const framework = availableFrameworks.find(f => f.name === value);
            onSelect(framework || null);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder={`Choose ${category} framework...`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {availableFrameworks.map((framework) => (
              <SelectItem key={framework.name} value={framework.name}>
                <div className="flex items-center justify-between w-full">
                  <div>
                    <span className="font-medium">{framework.name}</span>
                    <span className="text-xs text-gray-500 ml-2">({framework.language})</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {framework.version}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {currentFramework && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="font-medium text-sm mb-2">Features:</div>
          <div className="flex flex-wrap gap-2">
            {currentFramework.features.map((feature: string) => (
              <Badge key={feature} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}