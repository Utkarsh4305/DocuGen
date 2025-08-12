import { useState } from "react";
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
  className?: string;
}

export default function LanguageCategorizationOptimized({ frameworks, className = '' }: LanguageCategorizationProps) {
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

  return (
    <div className="framework-showcase-simple">
      {/* Simple Header */}
      <div className="simple-header">
        <div className="header-content">
          <div className="header-icon">
            <i className="fas fa-layer-group"></i>
          </div>
          <div className="header-text">
            <h2 className="showcase-title">
              <span className="gradient-text">Technology Ecosystem</span>
            </h2>
            <p className="showcase-subtitle">
              Comprehensive framework and language support
            </p>
          </div>
        </div>
        
        {/* Simple Search */}
        <div className="simple-search">
          <i className="fas fa-search search-icon"></i>
          <input
            placeholder="Search technologies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="clear-btn">
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      </div>

      {/* Simple Tabs */}
      <div className="simple-tabs">
        {Object.entries(languageCategories).map(([key, category]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`simple-tab ${activeCategory === key ? 'active' : ''}`}
          >
            <i className={category.icon}></i>
            <span>{category.shortName || category.name}</span>
            <span className="count">({getFrameworksByCategory(key).length})</span>
          </button>
        ))}
      </div>

      {/* Simple Content */}
      {Object.entries(languageCategories).map(([key, category]) => 
        activeCategory === key ? (
          <div key={key} className="simple-content">
            {/* Simple Overview */}
            <div className="simple-overview">
              <div className="overview-header">
                <i className={category.icon}></i>
                <h3>{category.name}</h3>
              </div>
              <p>{category.description}</p>
              <div className="simple-tags">
                {category.tags.map((tag, index) => (
                  <span key={index} className="simple-tag">{tag}</span>
                ))}
              </div>
            </div>

            {/* Simple Framework Grid */}
            <div className="simple-grid">
              {filterFrameworks(getFrameworksByCategory(key)).map((framework) => (
                <div key={framework.id} className="simple-card">
                  <div className="card-header">
                    <i className={framework.icon}></i>
                    <div className="framework-info">
                      <h4>{framework.name}</h4>
                      <p>{framework.category.split(' ')[0]} Framework</p>
                    </div>
                    {framework.bidirectionalSupport && (
                      <div className="bidirectional-icon">
                        <i className="fas fa-exchange-alt"></i>
                      </div>
                    )}
                  </div>

                  <p className="card-description">{framework.description}</p>

                  <div className="card-tags">
                    {framework.frameworks.slice(0, 3).map((tag, tagIndex) => (
                      <span key={tagIndex} className="card-tag">{tag}</span>
                    ))}
                    {framework.frameworks.length > 3 && (
                      <span className="card-tag more">+{framework.frameworks.length - 3}</span>
                    )}
                  </div>

                  <div className="card-stats">
                    <div className="stat">
                      <span className={`badge ${framework.maturity.toLowerCase()}`}>
                        {framework.maturity}
                      </span>
                      <small>Maturity</small>
                    </div>
                    <div className="stat">
                      <span className={`badge ${framework.difficulty.toLowerCase()}`}>
                        {framework.difficulty}
                      </span>
                      <small>Difficulty</small>
                    </div>
                  </div>

                  <div className="card-support">
                    <span>Conversion Support:</span>
                    <span className={`support ${framework.bidirectionalSupport ? 'full' : 'partial'}`}>
                      {framework.bidirectionalSupport ? 'Full' : 'Partial'}
                    </span>
                  </div>
                </div>
              ))}

              {/* No Results */}
              {filterFrameworks(getFrameworksByCategory(key)).length === 0 && (
                <div className="no-results">
                  <i className="fas fa-search"></i>
                  <h3>{searchTerm ? 'No matches found' : 'No frameworks available'}</h3>
                  <p>
                    {searchTerm 
                      ? `No frameworks found matching "${searchTerm}"` 
                      : "No frameworks available in this category"
                    }
                  </p>
                  {searchTerm && (
                    <button onClick={() => setSearchTerm("")} className="clear-btn">
                      Clear search
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Simple Stats */}
            {getFrameworksByCategory(key).length > 0 && (
              <div className="simple-stats">
                <div className="stat-item">
                  <div className="stat-number">{getFrameworksByCategory(key).length}</div>
                  <div className="stat-label">Total</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">
                    {getFrameworksByCategory(key).filter(f => f.bidirectionalSupport).length}
                  </div>
                  <div className="stat-label">Bidirectional</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">
                    {getFrameworksByCategory(key).filter(f => f.maturity === 'High').length}
                  </div>
                  <div className="stat-label">Mature</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">
                    {getFrameworksByCategory(key).filter(f => f.difficulty === 'Low').length}
                  </div>
                  <div className="stat-label">Beginner</div>
                </div>
              </div>
            )}
          </div>
        ) : null
      )}
    </div>
  );
}