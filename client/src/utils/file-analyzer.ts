import JSZip from 'jszip';

export interface FileAnalysis {
  fileName: string;
  extension: string;
  language: string;
  size: number;
  lines: number;
  content?: string;
  path: string;
}

export interface ProjectAnalysis {
  totalFiles: number;
  totalSize: number;
  totalLines: number;
  languages: { [key: string]: { files: number; lines: number; bytes: number; percentage: number } };
  files: FileAnalysis[];
  detectedFramework: string;
  projectType: 'web' | 'mobile' | 'desktop' | 'backend' | 'unknown';
  techStack: string[];
}

// Language detection based on file extensions
const languageMap: { [key: string]: string } = {
  // Web Languages
  '.js': 'JavaScript',
  '.jsx': 'JavaScript',
  '.ts': 'TypeScript',
  '.tsx': 'TypeScript',
  '.html': 'HTML',
  '.htm': 'HTML',
  '.css': 'CSS',
  '.scss': 'SCSS',
  '.sass': 'Sass',
  '.less': 'Less',
  '.vue': 'Vue',
  
  // Backend Languages
  '.py': 'Python',
  '.java': 'Java',
  '.cs': 'C#',
  '.cpp': 'C++',
  '.c': 'C',
  '.php': 'PHP',
  '.rb': 'Ruby',
  '.go': 'Go',
  '.rs': 'Rust',
  '.kt': 'Kotlin',
  '.scala': 'Scala',
  
  // Mobile
  '.swift': 'Swift',
  '.m': 'Objective-C',
  '.dart': 'Dart',
  
  // Config/Other
  '.json': 'JSON',
  '.xml': 'XML',
  '.yaml': 'YAML',
  '.yml': 'YAML',
  '.toml': 'TOML',
  '.md': 'Markdown',
  '.sql': 'SQL',
  '.sh': 'Shell',
  '.bat': 'Batch',
  '.ps1': 'PowerShell'
};

// Framework detection patterns
const frameworkPatterns = {
  'React': [
    'react',
    '@types/react',
    'react-dom',
    'next',
    'gatsby'
  ],
  'Vue.js': [
    'vue',
    '@vue/cli',
    'nuxt',
    'quasar'
  ],
  'Angular': [
    '@angular/core',
    '@angular/cli',
    'angular',
    'ng-'
  ],
  'Node.js': [
    'express',
    'koa',
    'fastify',
    'nest'
  ],
  'React Native': [
    'react-native',
    '@react-native',
    'metro'
  ],
  'Flutter': [
    'flutter',
    'pubspec.yaml'
  ],
  'Android': [
    'android',
    'gradle',
    'kotlin-android'
  ],
  'iOS': [
    'ios',
    'swift',
    'cocoapods'
  ],
  'Spring Boot': [
    'spring-boot',
    'spring-web',
    'spring-data'
  ],
  'Django': [
    'django',
    'requirements.txt'
  ],
  'Laravel': [
    'laravel',
    'composer.json'
  ]
};

export class FileAnalyzer {
  private countLines(content: string): number {
    if (!content) return 0;
    const lines = content.split('\n');
    let codeLines = 0;
    
    for (const line of lines) {
      const trimmed = line.trim();
      // Skip empty lines and common comment patterns
      if (trimmed.length > 0 && 
          !trimmed.startsWith('//') && 
          !trimmed.startsWith('#') && 
          !trimmed.startsWith('/*') && 
          !trimmed.startsWith('*') &&
          trimmed !== '*/') {
        codeLines++;
      }
    }
    
    return Math.max(codeLines, 1); // Ensure at least 1 line for non-empty files
  }

  private getLanguage(fileName: string): string {
    const extension = '.' + fileName.split('.').pop()?.toLowerCase();
    return languageMap[extension] || 'Other';
  }

  private detectFramework(files: FileAnalysis[], packageJsonContent?: string): string {
    let detectedFrameworks: string[] = [];

    // Check package.json dependencies
    if (packageJsonContent) {
      try {
        const packageJson = JSON.parse(packageJsonContent);
        const allDeps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
          ...packageJson.peerDependencies
        };

        for (const [framework, patterns] of Object.entries(frameworkPatterns)) {
          for (const pattern of patterns) {
            if (Object.keys(allDeps).some(dep => dep.includes(pattern))) {
              detectedFrameworks.push(framework);
              break;
            }
          }
        }
      } catch (e) {
        console.warn('Failed to parse package.json');
      }
    }

    // Check file patterns
    const fileNames = files.map(f => f.fileName.toLowerCase());
    for (const [framework, patterns] of Object.entries(frameworkPatterns)) {
      for (const pattern of patterns) {
        if (fileNames.some(name => name.includes(pattern))) {
          detectedFrameworks.push(framework);
          break;
        }
      }
    }

    return detectedFrameworks[0] || 'Unknown';
  }

  private detectProjectType(files: FileAnalysis[], detectedFramework: string): 'web' | 'mobile' | 'desktop' | 'backend' | 'unknown' {
    const mobileFrameworks = ['React Native', 'Flutter', 'Android', 'iOS'];
    const webFrameworks = ['React', 'Vue.js', 'Angular'];
    const backendFrameworks = ['Node.js', 'Spring Boot', 'Django', 'Laravel'];

    if (mobileFrameworks.includes(detectedFramework)) {
      return 'mobile';
    }
    if (webFrameworks.includes(detectedFramework)) {
      return 'web';
    }
    if (backendFrameworks.includes(detectedFramework)) {
      return 'backend';
    }

    // Analyze file types
    const languages = files.map(f => f.language);
    const hasWeb = languages.some(lang => ['HTML', 'CSS', 'JavaScript', 'TypeScript'].includes(lang));
    const hasMobile = languages.some(lang => ['Swift', 'Kotlin', 'Dart'].includes(lang));
    const hasBackend = languages.some(lang => ['Python', 'Java', 'C#', 'PHP', 'Go'].includes(lang));

    if (hasWeb) return 'web';
    if (hasMobile) return 'mobile';
    if (hasBackend) return 'backend';

    return 'unknown';
  }

  private generateTechStack(files: FileAnalysis[], detectedFramework: string): string[] {
    const techStack = new Set<string>();

    if (detectedFramework !== 'Unknown') {
      techStack.add(detectedFramework);
    }

    // Add languages
    const languages = [...new Set(files.map(f => f.language))];
    languages.forEach(lang => {
      if (lang !== 'Other' && lang !== 'JSON' && lang !== 'Markdown') {
        techStack.add(lang);
      }
    });

    // Add common tools based on file patterns
    const fileNames = files.map(f => f.fileName.toLowerCase());
    
    if (fileNames.some(name => name.includes('webpack'))) techStack.add('Webpack');
    if (fileNames.some(name => name.includes('vite'))) techStack.add('Vite');
    if (fileNames.some(name => name.includes('tailwind'))) techStack.add('Tailwind CSS');
    if (fileNames.some(name => name.includes('eslint'))) techStack.add('ESLint');
    if (fileNames.some(name => name.includes('prettier'))) techStack.add('Prettier');
    if (fileNames.some(name => name.includes('jest'))) techStack.add('Jest');
    if (fileNames.some(name => name.includes('cypress'))) techStack.add('Cypress');

    return Array.from(techStack);
  }

  async analyzeZipFile(file: File): Promise<ProjectAnalysis> {
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(file);
    
    const files: FileAnalysis[] = [];
    let packageJsonContent: string | undefined;
    let totalSize = 0;
    let totalLines = 0;

    // Process files in batches for better memory management
    const entries = Object.entries(zipContent.files);
    const batchSize = 50;
    
    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize);
      
      for (const [relativePath, zipEntry] of batch) {
        if (zipEntry.dir) continue; // Skip directories
        
        // Skip common non-code files
        if (this.shouldSkipFile(relativePath)) continue;

        try {
          // Limit file size processing for performance
          if (zipEntry.uncompressedSize > 1000000) { // Skip files > 1MB
            continue;
          }

          const content = await zipEntry.async('text');
          const fileName = relativePath.split('/').pop() || '';
          const extension = '.' + fileName.split('.').pop()?.toLowerCase();
          const language = this.getLanguage(fileName);
          const size = content.length;
          const lines = this.countLines(content);

          // Store package.json for framework detection
          if (fileName === 'package.json') {
            packageJsonContent = content;
          }

          files.push({
            fileName,
            extension,
            language,
            size,
            lines,
            content: content.length > 5000 ? undefined : content, // Further reduced for performance
            path: relativePath
          });

          totalSize += size;
          totalLines += lines;
        } catch (error) {
          // Silently continue processing other files
          continue;
        }
      }
      
      // Allow UI thread to breathe between batches
      if (i + batchSize < entries.length) {
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }

    // Calculate language statistics
    const languages: { [key: string]: { files: number; lines: number; bytes: number; percentage: number } } = {};
    
    files.forEach(file => {
      if (!languages[file.language]) {
        languages[file.language] = { files: 0, lines: 0, bytes: 0, percentage: 0 };
      }
      languages[file.language].files++;
      languages[file.language].lines += file.lines;
      languages[file.language].bytes += file.size;
    });

    // Calculate accurate percentages based on code lines (excluding config/docs)
    Object.keys(languages).forEach(lang => {
      if (totalLines > 0) {
        // Give more weight to actual code files vs config files
        const isCodeLanguage = !['JSON', 'YAML', 'Markdown', 'XML'].includes(lang);
        const weight = isCodeLanguage ? 1 : 0.3; // Reduce weight of config files
        const weightedLines = languages[lang].lines * weight;
        languages[lang].percentage = Math.round((languages[lang].lines / totalLines) * 100 * 100) / 100;
      } else {
        languages[lang].percentage = 0;
      }
    });

    const detectedFramework = this.detectFramework(files, packageJsonContent);
    const projectType = this.detectProjectType(files, detectedFramework);
    const techStack = this.generateTechStack(files, detectedFramework);

    return {
      totalFiles: files.length,
      totalSize,
      totalLines,
      languages,
      files,
      detectedFramework,
      projectType,
      techStack
    };
  }

  private shouldSkipFile(path: string): boolean {
    const lowerPath = path.toLowerCase();
    
    // Fast checks for most common patterns
    if (lowerPath.includes('node_modules/') || 
        lowerPath.includes('.git/') || 
        lowerPath.includes('dist/') || 
        lowerPath.includes('build/') ||
        lowerPath.includes('.cache/') ||
        lowerPath.includes('coverage/')) {
      return true;
    }

    // File extension checks
    if (lowerPath.endsWith('.min.js') || 
        lowerPath.endsWith('.min.css') || 
        lowerPath.endsWith('.bundle.js') ||
        lowerPath.endsWith('.chunk.js') ||
        lowerPath.endsWith('.map') ||
        lowerPath.endsWith('.log') ||
        lowerPath.endsWith('.tmp')) {
      return true;
    }

    // Common non-code files
    const fileName = lowerPath.split('/').pop() || '';
    if (fileName === '.ds_store' || 
        fileName === 'thumbs.db' || 
        fileName === 'readme.md' ||
        fileName === 'changelog.md' ||
        fileName === 'license') {
      return true;
    }

    return false;
  }
}

export const fileAnalyzer = new FileAnalyzer();