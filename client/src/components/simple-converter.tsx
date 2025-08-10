import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowRight, Download } from "lucide-react";
import ConversionProgress from "./conversion-progress";

interface SimpleConverterProps {
  projectId: string;
  techStackAnalysis: {
    languages: Array<{
      language: string;
      percentage: number;
      files: number;
      icon: string;
      purpose: string;
    }>;
    frameworks: string[];
  };
}

export default function SimpleConverter({ projectId, techStackAnalysis }: SimpleConverterProps) {
  const [sourceLanguage, setSourceLanguage] = useState<string>("");
  const [targetLanguage, setTargetLanguage] = useState<string>("");
  const [isConverting, setIsConverting] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const { toast } = useToast();
  
  // Calculate total files for progress tracking
  const totalFiles = techStackAnalysis.languages.reduce((total, lang) => total + lang.files, 0);

  const availableConversions = [
    { from: "react", to: "flutter", label: "React → Flutter" },
    { from: "react", to: "kotlin", label: "React → Kotlin" },
    { from: "javascript", to: "typescript", label: "JavaScript → TypeScript" },
    { from: "javascript", to: "flutter", label: "JavaScript → Flutter" },
    { from: "typescript", to: "flutter", label: "TypeScript → Flutter" },
    { from: "typescript", to: "kotlin", label: "TypeScript → Kotlin" },
  ];

  const conversionMutation = useMutation({
    mutationFn: async () => {
      setIsConverting(true);
      setShowProgress(true);
      
      const response = await apiRequest('POST', `/api/projects/${projectId}/convert`, {
        fromFramework: sourceLanguage,
        toFramework: targetLanguage,
        options: {
          preserveStructure: true,
          maintainState: true,
          addTypeAnnotations: true,
          convertApiCalls: true,
          fileByFile: true,
          preserveSpacing: true,
          preserveUI: true
        }
      });
      
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
    onSuccess: () => {
      // Progress component will handle completion message
      setIsConverting(false);
    },
    onError: (error) => {
      toast({
        title: "Conversion failed",
        description: error.message,
        variant: "destructive",
      });
      setIsConverting(false);
      setShowProgress(false);
    },
  });

  const handleConvert = () => {
    if (!sourceLanguage || !targetLanguage) {
      toast({
        title: "Selection required",
        description: "Please select both source and target languages.",
        variant: "destructive",
      });
      return;
    }
    conversionMutation.mutate();
  };

  const getLanguageOptions = (type: 'source' | 'target') => {
    if (type === 'source') {
      return techStackAnalysis.languages.map(lang => ({
        value: lang.language.toLowerCase(),
        label: `${lang.language} (${lang.purpose})`,
        percentage: lang.percentage
      }));
    } else {
      // Target language options based on what we can convert to
      return [
        { value: "flutter", label: "Flutter (Mobile)" },
        { value: "kotlin", label: "Kotlin (Android)" },
        { value: "typescript", label: "TypeScript (Full-stack)" },
        { value: "python", label: "Python (Backend)" },
        { value: "nodejs", label: "Node.js (Backend)" },
        { value: "react", label: "React (Frontend)" },
      ];
    }
  };

  return (
    <div className="space-y-6">
      {/* Show progress during conversion */}
      {showProgress && (
        <ConversionProgress
          isActive={isConverting}
          fromFramework={sourceLanguage}
          toFramework={targetLanguage}
          totalFiles={totalFiles}
          onComplete={() => {
            setShowProgress(false);
            toast({
              title: "Conversion completed!",
              description: `Successfully converted ${totalFiles} files from ${sourceLanguage} to ${targetLanguage}. Your project has been downloaded.`,
            });
          }}
        />
      )}
      
      {/* Main conversion interface */}
      <Card data-testid="card-simple-converter" className={showProgress ? 'opacity-50' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ArrowRight className="mr-2 h-5 w-5" />
            File-by-File Code Conversion
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Convert each source file individually while preserving original UI, logic, and spacing.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
        {/* Current Tech Stack */}
        <div>
          <h4 className="font-medium mb-2">Current Languages Detected:</h4>
          <div className="flex flex-wrap gap-2">
            {techStackAnalysis.languages.map((lang, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {lang.language}: {lang.percentage}% ({lang.purpose})
              </Badge>
            ))}
          </div>
        </div>

        {/* Conversion Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-2">From Language:</label>
            <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
              <SelectTrigger data-testid="select-source-language">
                <SelectValue placeholder="Select source language" />
              </SelectTrigger>
              <SelectContent>
                {getLanguageOptions('source').map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">To Language:</label>
            <Select value={targetLanguage} onValueChange={setTargetLanguage}>
              <SelectTrigger data-testid="select-target-language">
                <SelectValue placeholder="Select target language" />
              </SelectTrigger>
              <SelectContent>
                {getLanguageOptions('target').map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Conversion Button */}
        <div className="flex justify-center pt-4">
          <Button 
            onClick={() => {
              // Ask for user confirmation before conversion
              const isWebToMobile = sourceLanguage === 'react' && (targetLanguage === 'flutter' || targetLanguage === 'kotlin');
              
              if (isWebToMobile) {
                const confirmed = window.confirm(
                  `You're about to convert a ${sourceLanguage} web project to ${targetLanguage} ${targetLanguage === 'flutter' ? 'mobile' : 'Android'} project.\n\n` +
                  `This will:\n` +
                  `• Convert each file individually while preserving UI and logic\n` +
                  `• Create proper mobile project structure\n` +
                  `• Generate working ${targetLanguage === 'flutter' ? 'Flutter' : 'Android'} code\n\n` +
                  `Do you want to continue with this conversion?`
                );
                
                if (!confirmed) return;
              }
              
              handleConvert();
            }} 
            disabled={!sourceLanguage || !targetLanguage || isConverting}
            className="w-full md:w-auto"
            data-testid="button-convert"
          >
            {isConverting ? (
              <>Converting...</>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Convert & Download ZIP
              </>
            )}
          </Button>
        </div>

        {/* Popular Conversions */}
        <div>
          <h4 className="font-medium mb-2 text-sm">Popular Conversions:</h4>
          <div className="grid grid-cols-2 gap-2">
            {availableConversions.slice(0, 4).map((conversion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  setSourceLanguage(conversion.from);
                  setTargetLanguage(conversion.to);
                }}
              >
                {conversion.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}