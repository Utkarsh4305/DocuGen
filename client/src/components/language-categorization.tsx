import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { languageCategories, type LanguageCategory } from "@/data/language-categories";

interface SupportedFramework {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  frameworks: string[];
  maturity: string;
  difficulty: string;
  bidirectionalSupport: boolean;
}

interface LanguageCategorizationProps {
  frameworks: SupportedFramework[];
}

export default function LanguageCategorization({ frameworks }: LanguageCategorizationProps) {
  const [activeCategory, setActiveCategory] = useState("frontend-web");
  const [searchTerm, setSearchTerm] = useState("");

  const getFrameworksByCategory = (categoryKey: string): SupportedFramework[] => {
    const category = languageCategories[categoryKey];
    if (!category) return [];
    
    return frameworks.filter(framework => 
      category.frameworks.some(catFramework => 
        catFramework.id === framework.id
      )
    );
  };

  const filterFrameworks = (frameworkList: SupportedFramework[]): SupportedFramework[] => {
    if (!searchTerm) return frameworkList;
    
    return frameworkList.filter(framework =>
      framework.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      framework.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      framework.frameworks.some(tag => 
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  const getMaturityColor = (maturity: string) => {
    switch (maturity.toLowerCase()) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': 
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard':
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card data-testid="card-language-categorization">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <i className="fas fa-database text-primary mr-2"></i>
            Supported Languages & Frameworks
          </div>
          <div className="w-64">
            <Input
              placeholder="Search frameworks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-sm"
              data-testid="input-framework-search"
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Category Tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6">
            {Object.entries(languageCategories).map(([key, category]) => (
              <TabsTrigger 
                key={key} 
                value={key} 
                className="text-xs whitespace-nowrap"
                data-testid={`tab-${key}`}
              >
                <i className={`${category.icon} mr-1`}></i>
                {category.shortName || category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(languageCategories).map(([key, category]) => (
            <TabsContent key={key} value={key}>
              {/* Category Description */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg" data-testid={`category-description-${key}`}>
                <h3 className="font-semibold text-gray-900 flex items-center mb-2">
                  <i className={`${category.icon} text-primary mr-2`}></i>
                  {category.name}
                </h3>
                <p className="text-gray-600 text-sm">{category.description}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {category.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Framework Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid={`framework-grid-${key}`}>
                {filterFrameworks(getFrameworksByCategory(key)).map((framework) => (
                  <div 
                    key={framework.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group"
                    data-testid={`framework-card-${framework.id}`}
                  >
                    {/* Framework Header */}
                    <div className="flex items-center mb-3">
                      <i className={`${framework.icon} text-2xl mr-3 group-hover:scale-110 transition-transform`}></i>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900" data-testid={`framework-name-${framework.id}`}>
                          {framework.name}
                        </h3>
                        <p className="text-xs text-gray-500 capitalize">
                          {framework.category.split(' ')[0]} Framework
                        </p>
                      </div>
                      {framework.bidirectionalSupport && (
                        <i className="fas fa-exchange-alt text-green-500 text-sm" title="Bidirectional support"></i>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2" data-testid={`framework-description-${framework.id}`}>
                      {framework.description}
                    </p>

                    {/* Framework Tags */}
                    <div className="flex flex-wrap gap-1 mb-3" data-testid={`framework-tags-${framework.id}`}>
                      {framework.frameworks.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {framework.frameworks.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{framework.frameworks.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Maturity and Difficulty */}
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">Maturity:</span>
                        <Badge 
                          className={`${getMaturityColor(framework.maturity)} text-xs`}
                          data-testid={`maturity-${framework.id}`}
                        >
                          {framework.maturity}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">Difficulty:</span>
                        <Badge 
                          className={`${getDifficultyColor(framework.difficulty)} text-xs`}
                          data-testid={`difficulty-${framework.id}`}
                        >
                          {framework.difficulty}
                        </Badge>
                      </div>
                    </div>

                    {/* Conversion Support Indicator */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Conversion Support</span>
                        <div className="flex items-center space-x-1">
                          {framework.bidirectionalSupport ? (
                            <>
                              <i className="fas fa-check-circle text-green-500"></i>
                              <span className="text-green-600 font-medium">Full</span>
                            </>
                          ) : (
                            <>
                              <i className="fas fa-exclamation-circle text-yellow-500"></i>
                              <span className="text-yellow-600 font-medium">Partial</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* No Results Message */}
                {filterFrameworks(getFrameworksByCategory(key)).length === 0 && (
                  <div className="col-span-full text-center py-12" data-testid={`no-results-${key}`}>
                    <i className="fas fa-search text-4xl text-gray-300 mb-4"></i>
                    <p className="text-gray-500">
                      {searchTerm 
                        ? `No frameworks found matching "${searchTerm}"` 
                        : "No frameworks available in this category"
                      }
                    </p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="text-primary hover:text-primary/80 mt-2 text-sm"
                        data-testid="button-clear-search"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Category Statistics */}
              {getFrameworksByCategory(key).length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary" data-testid={`stat-total-${key}`}>
                        {getFrameworksByCategory(key).length}
                      </div>
                      <div className="text-sm text-gray-600">Total Frameworks</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600" data-testid={`stat-bidirectional-${key}`}>
                        {getFrameworksByCategory(key).filter(f => f.bidirectionalSupport).length}
                      </div>
                      <div className="text-sm text-gray-600">Bidirectional</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600" data-testid={`stat-mature-${key}`}>
                        {getFrameworksByCategory(key).filter(f => f.maturity === 'High').length}
                      </div>
                      <div className="text-sm text-gray-600">Mature</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600" data-testid={`stat-beginner-${key}`}>
                        {getFrameworksByCategory(key).filter(f => f.difficulty === 'Low').length}
                      </div>
                      <div className="text-sm text-gray-600">Beginner Friendly</div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
