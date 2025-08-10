import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ASTVisualizationProps {
  projectId: string;
}

interface ComponentInfo {
  name: string;
  type: 'function' | 'class' | 'arrow';
  props: string[];
  state: string[];
  hooks: string[];
  jsx: boolean;
}

interface ASTAnalysis {
  components: ComponentInfo[];
  imports: Array<{
    source: string;
    specifiers: Array<{
      imported: string;
      local: string;
      type: 'default' | 'named' | 'namespace';
    }>;
  }>;
  exports: Array<{
    name: string;
    type: 'default' | 'named';
  }>;
  hooks: Array<{
    name: string;
    type: string;
    dependencies?: string[];
  }>;
  functions: Array<{
    name: string;
    params: string[];
    async: boolean;
  }>;
  classes: Array<{
    name: string;
    superClass?: string;
    methods: string[];
    properties: string[];
  }>;
}

export default function ASTVisualization({ projectId }: ASTVisualizationProps) {
  const [activeTab, setActiveTab] = useState("ast");

  const { data: project, isLoading } = useQuery({
    queryKey: ['/api/projects', projectId],
    enabled: !!projectId,
  });

  if (isLoading) {
    return (
      <Card data-testid="card-ast-loading">
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-sitemap text-secondary mr-2"></i>
            AST & UIR Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-full mb-4" />
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!project?.astData) {
    return null;
  }

  const astData = project.astData as ASTAnalysis;
  const uirData = project.uirData;

  const generateSampleAST = () => {
    return {
      type: "Program",
      body: [
        {
          type: "ImportDeclaration",
          specifiers: [
            {
              type: "ImportDefaultSpecifier",
              local: { name: "React" }
            }
          ],
          source: { value: "react" }
        },
        {
          type: "FunctionDeclaration",
          id: { name: "App" },
          body: {
            type: "BlockStatement",
            body: [
              {
                type: "ReturnStatement",
                argument: {
                  type: "JSXElement",
                  openingElement: {
                    name: { name: "div" },
                    attributes: []
                  }
                }
              }
            ]
          }
        }
      ]
    };
  };

  const generateSampleUIR = () => {
    return {
      version: "1.0.0",
      metadata: {
        originalFramework: "react",
        generatedAt: new Date().toISOString()
      },
      nodes: astData.components.map(component => ({
        id: Math.random().toString(36).substr(2, 9),
        type: "Component",
        name: component.name,
        props: {
          componentType: component.type,
          hasJSX: component.jsx,
          props: component.props,
          state: component.state,
          hooks: component.hooks
        },
        metadata: {
          complexity: component.hooks.length > 2 ? "high" : component.hooks.length > 0 ? "medium" : "low"
        }
      })),
      dependencies: {}
    };
  };

  const sampleAST = generateSampleAST();
  const sampleUIR = generateSampleUIR();

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'bg-green-50 border-green-400 text-green-800';
      case 'medium': return 'bg-yellow-50 border-yellow-400 text-yellow-800';
      case 'high': return 'bg-red-50 border-red-400 text-red-800';
      default: return 'bg-gray-50 border-gray-400 text-gray-800';
    }
  };

  const getComponentTypeIcon = (type: string) => {
    switch (type) {
      case 'function': return 'fas fa-function text-blue-500';
      case 'class': return 'fas fa-cube text-green-500';
      case 'arrow': return 'fas fa-arrow-right text-purple-500';
      default: return 'fas fa-code text-gray-500';
    }
  };

  return (
    <Card data-testid="card-ast-visualization">
      <CardHeader>
        <CardTitle className="flex items-center">
          <i className="fas fa-sitemap text-secondary mr-2"></i>
          AST & UIR Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* AST/UIR Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList>
            <TabsTrigger value="ast" data-testid="tab-ast">AST Tree</TabsTrigger>
            <TabsTrigger value="uir" data-testid="tab-uir">UIR Schema</TabsTrigger>
            <TabsTrigger value="components" data-testid="tab-components">Components</TabsTrigger>
          </TabsList>

          <TabsContent value="ast" className="mt-4">
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto" data-testid="ast-visualization">
              <ScrollArea className="h-80">
                <pre className="text-green-400 text-xs font-mono whitespace-pre-wrap">
                  {JSON.stringify(sampleAST, null, 2)}
                </pre>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="uir" className="mt-4">
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto" data-testid="uir-visualization">
              <ScrollArea className="h-80">
                <pre className="text-blue-400 text-xs font-mono whitespace-pre-wrap">
                  {JSON.stringify(sampleUIR, null, 2)}
                </pre>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="components" className="mt-4">
            {/* Component Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="component-analysis">
              {/* Detected Components */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Detected Components</h4>
                <div className="space-y-2">
                  {astData.components.length > 0 ? (
                    astData.components.map((component, index) => (
                      <div 
                        key={index}
                        className={`border-l-4 p-3 text-sm ${getComplexityColor(
                          component.hooks.length > 2 ? "high" : 
                          component.hooks.length > 0 ? "medium" : "low"
                        )}`}
                        data-testid={`component-detected-${index}`}
                      >
                        <div className="flex items-center mb-1">
                          <i className={`${getComponentTypeIcon(component.type)} mr-2`}></i>
                          <div className="font-mono font-medium">{component.name}</div>
                        </div>
                        <div className="text-gray-600">
                          {component.type === 'class' ? 'Class Component' : 'Function Component'}
                          {component.props.length > 0 && (
                            <span className="ml-2">• {component.props.length} props</span>
                          )}
                          {component.state.length > 0 && (
                            <span className="ml-2">• {component.state.length} state vars</span>
                          )}
                          {component.hooks.length > 0 && (
                            <span className="ml-2">• {component.hooks.length} hooks</span>
                          )}
                        </div>
                        {component.hooks.length > 0 && (
                          <div className="mt-2">
                            <div className="text-xs text-gray-500 mb-1">Hooks used:</div>
                            <div className="flex flex-wrap gap-1">
                              {component.hooks.map((hook, hookIndex) => (
                                <Badge 
                                  key={hookIndex} 
                                  variant="outline" 
                                  className="text-xs"
                                  data-testid={`hook-badge-${index}-${hookIndex}`}
                                >
                                  {hook}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500" data-testid="no-components">
                      No React components detected
                    </div>
                  )}
                </div>
              </div>

              {/* Conversion Mapping */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Conversion Mapping</h4>
                <div className="space-y-2">
                  {astData.components.length > 0 ? (
                    astData.components.map((component, index) => (
                      <div 
                        key={index}
                        className="bg-purple-50 border-l-4 border-purple-400 p-3 text-sm"
                        data-testid={`component-mapping-${index}`}
                      >
                        <div className="font-mono font-medium">
                          {component.name}.tsx
                        </div>
                        <div className="text-gray-600">
                          Function Component + TypeScript Types
                        </div>
                        <div className="mt-2 text-xs text-purple-700">
                          <i className="fas fa-arrow-right mr-1"></i>
                          Will generate: Interface definitions, typed props, typed state
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500" data-testid="no-mappings">
                      No conversion mappings available
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Analysis Summary */}
        {astData.components.length > 0 && (
          <div className="mt-6 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-blue-600" data-testid="stat-components">
                {astData.components.length}
              </div>
              <div className="text-xs text-gray-600">Components</div>
            </div>
            <div>
              <div className="text-xl font-bold text-green-600" data-testid="stat-functions">
                {astData.functions.length}
              </div>
              <div className="text-xs text-gray-600">Functions</div>
            </div>
            <div>
              <div className="text-xl font-bold text-purple-600" data-testid="stat-hooks">
                {astData.hooks.length}
              </div>
              <div className="text-xs text-gray-600">Hooks</div>
            </div>
            <div>
              <div className="text-xl font-bold text-orange-600" data-testid="stat-imports">
                {astData.imports.length}
              </div>
              <div className="text-xs text-gray-600">Imports</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
