import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface TechStackAnalysis {
  languages: Array<{
    language: string;
    percentage: number;
    files: number;
    icon: string;
    purpose: string;
  }>;
  frameworks: string[];
  totalFiles: number;
  totalLines: number;
}

interface AnalysisResultsProps {
  projectId: string;
}

export default function AnalysisResults({ projectId }: AnalysisResultsProps) {
  const { data: project, isLoading } = useQuery({
    queryKey: ['/api/projects', projectId],
    enabled: !!projectId,
  });

  if (isLoading) {
    return (
      <Card data-testid="card-analysis-loading">
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-chart-pie text-secondary mr-2"></i>
            Tech Stack Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!project?.originalTechStack) {
    return null;
  }

  const analysis = project.originalTechStack as TechStackAnalysis;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  function getLanguageColor(language: string, index: number): string {
    const colorMap: Record<string, string> = {
      'JavaScript': '#f7df1e',
      'TypeScript': '#3178c6',
      'Python': '#3776ab',
      'React': '#61dafb',
      'HTML': '#e34c26',
      'CSS': '#1572b6',
    };
    return colorMap[language] || COLORS[index % COLORS.length];
  }

  // Prepare data for pie chart
  const chartData = analysis.languages.map((lang, index) => ({
    name: lang.language,
    value: lang.percentage,
    files: lang.files,
    color: getLanguageColor(lang.language, index),
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-2 border-blue-200 rounded-xl shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-4 h-4 rounded-full border-2 border-white shadow-sm" 
              style={{ backgroundColor: data.color }}
            />
            <p className="font-bold text-gray-800 text-lg">{data.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-blue-700 font-medium">
              <span className="text-xl font-bold">{data.value}%</span> of codebase
            </p>
            <p className="text-sm text-purple-700">
              {data.files} {data.files === 1 ? 'file' : 'files'}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card data-testid="card-analysis-results">
      <CardHeader>
        <CardTitle className="flex items-center">
          <i className="fas fa-chart-pie text-secondary mr-2"></i>
          Tech Stack Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Language Distribution Chart */}
        <div className="mb-6 h-80" data-testid="chart-tech-stack">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
                label={({ name, value, cx, cy, midAngle, innerRadius, outerRadius }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  return value > 5 ? (
                    <text 
                      x={x} 
                      y={y} 
                      fill="white" 
                      textAnchor={x > cx ? 'start' : 'end'} 
                      dominantBaseline="central"
                      fontSize="12"
                      fontWeight="bold"
                    >
                      {`${value}%`}
                    </text>
                  ) : null;
                }}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry) => (
                  <span style={{ color: entry.color || '#000', fontWeight: 'bold' }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Detected Technologies */}
        <div className="space-y-3" data-testid="list-detected-languages">
          {analysis.languages.map((lang, index) => (
            <div 
              key={index}
              className="flex items-center justify-between"
              data-testid={`language-item-${index}`}
            >
              <div className="flex items-center">
                <i className={`${lang.icon} mr-2`}></i>
                <div>
                  <span className="font-medium" data-testid={`language-name-${index}`}>
                    {lang.language}
                  </span>
                  <div className="text-xs text-muted-foreground">{lang.purpose}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500" data-testid={`language-files-${index}`}>
                  {lang.files} files
                </span>
                <span className="text-sm text-gray-500" data-testid={`language-percentage-${index}`}>
                  {lang.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Project Statistics */}
        <div className="mt-6 pt-4 border-t grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary" data-testid="text-total-files">
              {analysis.totalFiles}
            </div>
            <div className="text-sm text-gray-600">Total Files</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-secondary" data-testid="text-total-lines">
              {analysis.totalLines.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Lines</div>
          </div>
        </div>

        {/* Detected Frameworks */}
        {analysis.frameworks.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="font-medium text-gray-900 mb-3">Frameworks & Libraries</h4>
            <div className="flex flex-wrap gap-2" data-testid="list-frameworks">
              {analysis.frameworks.map((framework, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  data-testid={`framework-badge-${index}`}
                >
                  {framework}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
