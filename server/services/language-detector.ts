import { TechStackAnalysis } from "@shared/schema";

interface FileAnalysis {
  path: string;
  content: string;
  language: string;
  framework?: string;
  lines: number;
}

export class LanguageDetector {
  private languagePatterns = {
    javascript: /\.(js|jsx)$/,
    typescript: /\.(ts|tsx)$/,
    python: /\.py$/,
    dart: /\.dart$/,
    go: /\.go$/,
    html: /\.(html|htm)$/,
    css: /\.(css|scss|sass|less)$/,
    json: /\.json$/,
    yaml: /\.(yml|yaml)$/,
    markdown: /\.(md|markdown)$/,
  };

  private frameworkDetectors = {
    react: {
      patterns: [/import.*react/i, /from\s+['"]react['"]/, /<[A-Z]\w*/, /jsx/i],
      files: [/\.jsx?$/, /\.tsx?$/],
    },
    nodejs: {
      patterns: [/require\s*\(/, /module\.exports/, /express/, /app\.listen/],
      files: [/package\.json$/, /server\.js$/, /index\.js$/],
    },
    typescript: {
      patterns: [/interface\s+\w+/, /type\s+\w+\s*=/, /:\s*\w+/, /as\s+\w+/],
      files: [/\.ts$/, /\.tsx$/, /tsconfig\.json$/],
    },
    python: {
      patterns: [/from\s+\w+\s+import/, /def\s+\w+\(/, /class\s+\w+/, /if\s+__name__\s*==\s*['""]__main__['""]:/],
      files: [/\.py$/, /requirements\.txt$/, /setup\.py$/],
    },
    flutter: {
      patterns: [/import\s+['"]flutter/, /StatelessWidget/, /StatefulWidget/, /Widget\s+build/],
      files: [/\.dart$/, /pubspec\.yaml$/],
    },
    fastapi: {
      patterns: [/from\s+fastapi/, /@app\.(get|post|put|delete)/, /FastAPI\(\)/],
      files: [/\.py$/],
    },
    express: {
      patterns: [/require\(['"]express['"]/, /app\.use\(/, /app\.(get|post|put|delete)/],
      files: [/\.js$/, /package\.json$/],
    },
  };

  detectLanguage(filename: string, content: string): string {
    // Check file extension patterns
    for (const [language, pattern] of Object.entries(this.languagePatterns)) {
      if (pattern.test(filename)) {
        return language;
      }
    }

    // Fallback to content analysis
    if (content.includes('def ') || content.includes('import ')) {
      return 'python';
    }
    if (content.includes('function') || content.includes('const ') || content.includes('let ')) {
      return 'javascript';
    }

    return 'unknown';
  }

  detectFrameworks(files: Array<{ path: string; content: string }>): string[] {
    const detectedFrameworks = new Set<string>();

    for (const file of files) {
      for (const [framework, detector] of Object.entries(this.frameworkDetectors)) {
        // Check file patterns
        const matchesFile = detector.files.some(pattern => pattern.test(file.path));
        
        // Check content patterns
        const matchesContent = detector.patterns.some(pattern => pattern.test(file.content));
        
        if (matchesFile && matchesContent) {
          detectedFrameworks.add(framework);
        }
      }
    }

    return Array.from(detectedFrameworks);
  }

  private getLanguagePurpose(language: string, files: Array<{ path: string; content: string }>): string {
    const purposes: Record<string, string[]> = {
      javascript: ["Frontend", "Backend", "Full-stack"],
      typescript: ["Frontend", "Backend", "Full-stack"],
      python: ["Backend", "Data Science", "Machine Learning"],
      dart: ["Mobile Frontend", "Flutter Apps"],
      go: ["Backend", "Microservices", "System Programming"],
      html: ["Frontend", "Web UI"],
      css: ["Frontend", "Styling"],
      json: ["Configuration", "Data"],
      yaml: ["Configuration", "DevOps"],
      markdown: ["Documentation"]
    };

    // Analyze files to determine specific purpose
    const fileContents = files.map(f => f.content.toLowerCase()).join(' ');
    const filePaths = files.map(f => f.path.toLowerCase()).join(' ');

    if (language === 'javascript' || language === 'typescript') {
      if (filePaths.includes('server') || filePaths.includes('api') || fileContents.includes('express') || fileContents.includes('app.listen')) {
        return 'Backend';
      } else if (fileContents.includes('react') || fileContents.includes('component') || filePaths.includes('client')) {
        return 'Frontend';
      }
      return 'Full-stack';
    }

    if (language === 'python') {
      if (fileContents.includes('fastapi') || fileContents.includes('flask') || fileContents.includes('django')) {
        return 'Backend API';
      } else if (fileContents.includes('pandas') || fileContents.includes('numpy') || fileContents.includes('sklearn')) {
        return 'Data Science';
      }
      return 'Backend';
    }

    return purposes[language]?.[0] || 'General';
  }

  analyzeProject(files: Array<{ path: string; content: string }>): TechStackAnalysis {
    const fileAnalyses: FileAnalysis[] = files.map(file => ({
      ...file,
      language: this.detectLanguage(file.path, file.content),
      lines: file.content.split('\n').length,
    }));

    // Calculate language distribution
    const languageCounts = new Map<string, { files: number; lines: number }>();
    let totalFiles = 0;
    let totalLines = 0;

    for (const analysis of fileAnalyses) {
      if (analysis.language === 'unknown') continue;
      
      const current = languageCounts.get(analysis.language) || { files: 0, lines: 0 };
      languageCounts.set(analysis.language, {
        files: current.files + 1,
        lines: current.lines + analysis.lines,
      });
      
      totalFiles++;
      totalLines += analysis.lines;
    }

    // Convert to percentage-based results with purposes
    const languages = Array.from(languageCounts.entries()).map(([language, stats]) => ({
      language: this.getLanguageDisplayName(language),
      percentage: Math.round((stats.lines / totalLines) * 100 * 10) / 10,
      files: stats.files,
      icon: this.getLanguageIcon(language),
      purpose: this.getLanguagePurpose(language, files.filter(f => this.detectLanguage(f.path, f.content) === language))
    })).sort((a, b) => b.percentage - a.percentage);

    // Detect frameworks
    const frameworks = this.detectFrameworks(files);

    return {
      languages,
      frameworks: frameworks.map(f => this.getFrameworkDisplayName(f)),
      totalFiles,
      totalLines,
    };
  }

  private getLanguageDisplayName(language: string): string {
    const displayNames: Record<string, string> = {
      javascript: 'JavaScript',
      typescript: 'TypeScript',
      python: 'Python',
      dart: 'Dart',
      go: 'Go',
      html: 'HTML',
      css: 'CSS',
      json: 'JSON',
      yaml: 'YAML',
      markdown: 'Markdown',
    };
    return displayNames[language] || language;
  }

  private getLanguageIcon(language: string): string {
    const icons: Record<string, string> = {
      javascript: 'fab fa-js-square',
      typescript: 'fab fa-js-square',
      python: 'fab fa-python',
      dart: 'fas fa-mobile-alt',
      go: 'fas fa-code',
      html: 'fab fa-html5',
      css: 'fab fa-css3-alt',
      json: 'fas fa-file-code',
      yaml: 'fas fa-file-code',
      markdown: 'fab fa-markdown',
    };
    return icons[language] || 'fas fa-file-code';
  }

  private getFrameworkDisplayName(framework: string): string {
    const displayNames: Record<string, string> = {
      react: 'React',
      nodejs: 'Node.js',
      typescript: 'TypeScript',
      python: 'Python',
      flutter: 'Flutter',
      fastapi: 'FastAPI',
      express: 'Express.js',
    };
    return displayNames[framework] || framework;
  }
}
