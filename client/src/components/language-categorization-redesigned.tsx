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

export default function LanguageCategorizationRedesigned({ frameworks, className = '' }: LanguageCategorizationProps) {
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
    <div className="framework-showcase">
      {/* Header Section */}
      <div className="showcase-header">
        <div className="header-content">
          <div className="header-icon">
            <div className="icon-orb">
              <i className="fas fa-layer-group"></i>
              <div className="orb-glow"></div>
            </div>
          </div>
          
          <div className="header-text">
            <h2 className="showcase-title">
              <span className="gradient-text">Technology Ecosystem</span>
            </h2>
            <p className="showcase-subtitle">
              Comprehensive framework and language support for modern development
            </p>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="search-container">
          <div className="search-input-wrapper">
            <i className="fas fa-search search-icon"></i>
            <input
              placeholder="Search technologies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="clear-search"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        {Object.entries(languageCategories).map(([key, category], index) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`category-tab ${activeCategory === key ? 'active' : ''}`}
            style={{ '--tab-delay': `${index * 0.1}s` } as React.CSSProperties}
          >
            <div className="tab-icon">
              <i className={category.icon}></i>
              <div className="icon-glow"></div>
            </div>
            <div className="tab-content">
              <span className="tab-name">{category.shortName || category.name}</span>
              <span className="tab-count">
                {getFrameworksByCategory(key).length} frameworks
              </span>
            </div>
            {activeCategory === key && (
              <div className="active-indicator">
                <div className="indicator-line"></div>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Category Content */}
      {Object.entries(languageCategories).map(([key, category]) => 
        activeCategory === key ? (
          <div key={key} className="category-content">
            {/* Category Description */}
            <div className="category-overview">
              <div className="overview-content">
                <div className="overview-icon">
                  <i className={category.icon}></i>
                  <div className="icon-bg"></div>
                </div>
                <div className="overview-text">
                  <h3 className="overview-title">{category.name}</h3>
                  <p className="overview-description">{category.description}</p>
                </div>
              </div>
              
              <div className="overview-tags">
                {category.tags.map((tag, index) => (
                  <div
                    key={index}
                    className="overview-tag"
                    style={{ '--tag-delay': `${index * 0.05}s` } as React.CSSProperties}
                  >
                    {tag}
                  </div>
                ))}
              </div>
            </div>

            {/* Frameworks Grid */}
            <div className="frameworks-grid">
              {filterFrameworks(getFrameworksByCategory(key)).map((framework, index) => (
                <div 
                  key={framework.id}
                  className="framework-card"
                  style={{ '--card-delay': `${index * 0.1}s` } as React.CSSProperties}
                >
                  <div className="card-header">
                    <div className="framework-icon">
                      <i className={framework.icon}></i>
                      <div className="icon-glow"></div>
                    </div>
                    <div className="framework-info">
                      <h4 className="framework-name">{framework.name}</h4>
                      <p className="framework-category">
                        {framework.category.split(' ')[0]} Framework
                      </p>
                    </div>
                    {framework.bidirectionalSupport && (
                      <div className="bidirectional-badge">
                        <i className="fas fa-exchange-alt" title="Bidirectional support"></i>
                      </div>
                    )}
                  </div>

                  <p className="framework-description">
                    {framework.description}
                  </p>

                  <div className="framework-tags">
                    {framework.frameworks.slice(0, 3).map((tag, tagIndex) => (
                      <span key={tagIndex} className="framework-tag">
                        {tag}
                      </span>
                    ))}
                    {framework.frameworks.length > 3 && (
                      <span className="framework-tag more">
                        +{framework.frameworks.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="framework-stats">
                    <div className="stat-item">
                      <div className={`stat-badge ${framework.maturity.toLowerCase()}`}>
                        <i className="fas fa-star"></i>
                        <span>{framework.maturity}</span>
                      </div>
                      <span className="stat-label">Maturity</span>
                    </div>
                    <div className="stat-item">
                      <div className={`stat-badge ${framework.difficulty.toLowerCase()}`}>
                        <i className="fas fa-chart-line"></i>
                        <span>{framework.difficulty}</span>
                      </div>
                      <span className="stat-label">Difficulty</span>
                    </div>
                  </div>

                  <div className="framework-support">
                    <span className="support-label">Conversion Support</span>
                    <div className={`support-status ${framework.bidirectionalSupport ? 'full' : 'partial'}`}>
                      <i className={`fas ${framework.bidirectionalSupport ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                      <span>{framework.bidirectionalSupport ? 'Full' : 'Partial'}</span>
                    </div>
                  </div>

                  <div className="card-overlay"></div>
                </div>
              ))}

              {/* No Results */}
              {filterFrameworks(getFrameworksByCategory(key)).length === 0 && (
                <div className="no-results">
                  <div className="no-results-icon">
                    <i className="fas fa-search"></i>
                  </div>
                  <h3 className="no-results-title">
                    {searchTerm ? 'No matches found' : 'No frameworks available'}
                  </h3>
                  <p className="no-results-description">
                    {searchTerm 
                      ? `No frameworks found matching "${searchTerm}"` 
                      : "No frameworks available in this category"
                    }
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="clear-search-btn"
                    >
                      <i className="fas fa-times mr-2"></i>
                      Clear search
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Category Statistics */}
            {getFrameworksByCategory(key).length > 0 && (
              <div className="category-stats">
                <h3 className="stats-title">
                  <span className="gradient-text">Category Overview</span>
                </h3>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-number primary">
                      {getFrameworksByCategory(key).length}
                    </div>
                    <div className="stat-label">Total Frameworks</div>
                    <div className="stat-indicator primary"></div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number success">
                      {getFrameworksByCategory(key).filter(f => f.bidirectionalSupport).length}
                    </div>
                    <div className="stat-label">Bidirectional</div>
                    <div className="stat-indicator success"></div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number secondary">
                      {getFrameworksByCategory(key).filter(f => f.maturity === 'High').length}
                    </div>
                    <div className="stat-label">Mature</div>
                    <div className="stat-indicator secondary"></div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number accent">
                      {getFrameworksByCategory(key).filter(f => f.difficulty === 'Low').length}
                    </div>
                    <div className="stat-label">Beginner Friendly</div>
                    <div className="stat-indicator accent"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null
      )}
    </div>
  );
}