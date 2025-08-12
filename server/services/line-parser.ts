import { 
  ParsedProjectStructure, 
  ComponentDefinition, 
  PageDefinition,
  LayoutDefinition,
  StyleDefinition,
  ServiceDefinition,
  StoreDefinition,
  RouteDefinition,
  ModelDefinition,
  UIStructure,
  LogicStructure,
  RouteStructure,
  DataStructure,
  ConfigStructure,
  ImportDefinition,
  ExportDefinition,
  PropertyDefinition,
  StateDefinition,
  HookUsage,
  EventHandler,
  MethodDefinition,
  ParameterDefinition
} from "@shared/stack-conversion-schema";

export class LineByLineParser {
  private fileContents: Map<string, string[]> = new Map();
  private currentStack: string = '';

  parseProject(files: Array<{ path: string; content: string }>, framework: string): ParsedProjectStructure {
    this.currentStack = framework;
    
    // Store file contents as line arrays for easy parsing
    files.forEach(file => {
      this.fileContents.set(file.path, file.content.split('\n'));
    });

    const structure: ParsedProjectStructure = {
      ui: this.parseUIStructure(files),
      logic: this.parseLogicStructure(files),
      routes: this.parseRouteStructure(files),
      data: this.parseDataStructure(files),
      config: this.parseConfigStructure(files)
    };

    return structure;
  }

  private parseUIStructure(files: Array<{ path: string; content: string }>): UIStructure {
    const uiFiles = files.filter(f => this.isUIFile(f.path));
    
    return {
      components: this.parseComponents(uiFiles),
      pages: this.parsePages(uiFiles),
      layouts: this.parseLayouts(uiFiles),
      styles: this.parseStyles(files.filter(f => this.isStyleFile(f.path)))
    };
  }

  private parseLogicStructure(files: Array<{ path: string; content: string }>): LogicStructure {
    const logicFiles = files.filter(f => this.isLogicFile(f.path));
    
    return {
      services: this.parseServices(logicFiles),
      utilities: [],
      stores: this.parseStores(logicFiles),
      middleware: [],
      validators: [],
      constants: []
    };
  }

  private parseRouteStructure(files: Array<{ path: string; content: string }>): RouteStructure {
    const routeFiles = files.filter(f => this.isRouteFile(f.path));
    
    return {
      routes: this.parseRoutes(routeFiles),
      guards: [],
      middleware: [],
      navigation: { type: 'history', config: {} }
    };
  }

  private parseDataStructure(files: Array<{ path: string; content: string }>): DataStructure {
    const dataFiles = files.filter(f => this.isDataFile(f.path));
    
    return {
      models: this.parseModels(dataFiles),
      schemas: [],
      migrations: [],
      seeders: [],
      queries: []
    };
  }

  private parseConfigStructure(files: Array<{ path: string; content: string }>): ConfigStructure {
    const configFiles = files.filter(f => this.isConfigFile(f.path));
    
    return {
      environment: [],
      build: { bundler: '', entry: [], output: '', plugins: [], filePath: '' },
      deployment: { platform: '', config: {}, filePath: '' },
      dependencies: this.parseDependencies(configFiles)
    };
  }

  private parseComponents(files: Array<{ path: string; content: string }>): ComponentDefinition[] {
    const components: ComponentDefinition[] = [];

    for (const file of files) {
      const lines = this.fileContents.get(file.path) || [];
      const imports = this.parseImports(lines);
      const exports = this.parseExports(lines);

      // Detect React components
      if (this.currentStack === 'react') {
        const reactComponents = this.parseReactComponents(file.path, lines);
        components.push(...reactComponents);
      }
      // Detect Vue components
      else if (this.currentStack === 'vue') {
        const vueComponents = this.parseVueComponents(file.path, lines);
        components.push(...vueComponents);
      }
      // Detect Angular components
      else if (this.currentStack === 'angular') {
        const angularComponents = this.parseAngularComponents(file.path, lines);
        components.push(...angularComponents);
      }
    }

    return components;
  }

  private parseReactComponents(filePath: string, lines: string[]): ComponentDefinition[] {
    const components: ComponentDefinition[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Function component pattern
      const funcComponentMatch = line.match(/^(?:export\s+)?(?:const|function)\s+([A-Z][a-zA-Z0-9]*)\s*[=:]?\s*(?:\([^)]*\))?\s*(?:=>)?\s*{?/);
      if (funcComponentMatch) {
        const componentName = funcComponentMatch[1];
        const component = this.parseReactComponent(filePath, lines, i, componentName, 'functional');
        if (component) components.push(component);
      }
      
      // Class component pattern
      const classComponentMatch = line.match(/^(?:export\s+)?class\s+([A-Z][a-zA-Z0-9]*)\s+extends\s+(?:React\.)?Component/);
      if (classComponentMatch) {
        const componentName = classComponentMatch[1];
        const component = this.parseReactComponent(filePath, lines, i, componentName, 'class');
        if (component) components.push(component);
      }
    }

    return components;
  }

  private parseReactComponent(
    filePath: string, 
    lines: string[], 
    startLine: number, 
    name: string, 
    type: 'functional' | 'class'
  ): ComponentDefinition | null {
    const endLine = this.findComponentEnd(lines, startLine, type);
    const componentLines = lines.slice(startLine, endLine + 1);
    
    return {
      id: `${filePath}:${name}`,
      name,
      filePath,
      lineStart: startLine + 1,
      lineEnd: endLine + 1,
      type,
      props: this.parseProps(componentLines),
      state: this.parseState(componentLines, type),
      hooks: this.parseHooks(componentLines),
      imports: this.parseImports(lines.slice(0, startLine)),
      exports: this.parseExports(lines.slice(endLine + 1)),
      events: this.parseEventHandlers(componentLines),
      children: this.parseComponentChildren(componentLines),
      styling: this.parseStyling(componentLines),
      dependencies: this.parseComponentDependencies(componentLines)
    };
  }

  private parseVueComponents(filePath: string, lines: string[]): ComponentDefinition[] {
    const components: ComponentDefinition[] = [];
    
    // Parse Vue SFC (Single File Component)
    const scriptMatch = this.findSectionBounds(lines, '<script', '</script>');
    const templateMatch = this.findSectionBounds(lines, '<template', '</template>');
    
    if (scriptMatch) {
      const componentName = this.extractVueComponentName(lines.slice(scriptMatch.start, scriptMatch.end));
      
      components.push({
        id: `${filePath}:${componentName}`,
        name: componentName,
        filePath,
        lineStart: scriptMatch.start + 1,
        lineEnd: scriptMatch.end + 1,
        type: 'functional',
        props: this.parseVueProps(lines.slice(scriptMatch.start, scriptMatch.end)),
        state: this.parseVueData(lines.slice(scriptMatch.start, scriptMatch.end)),
        hooks: this.parseVueLifecycle(lines.slice(scriptMatch.start, scriptMatch.end)),
        imports: this.parseImports(lines.slice(scriptMatch.start, scriptMatch.end)),
        exports: [],
        events: this.parseVueEvents(lines.slice(scriptMatch.start, scriptMatch.end)),
        children: this.parseVueTemplate(lines.slice(templateMatch?.start || 0, templateMatch?.end || 0)),
        styling: this.parseStyling(lines),
        dependencies: []
      });
    }

    return components;
  }

  private parseAngularComponents(filePath: string, lines: string[]): ComponentDefinition[] {
    const components: ComponentDefinition[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Angular component decorator pattern
      if (line.includes('@Component')) {
        const decoratorEnd = this.findDecoratorEnd(lines, i);
        const classStart = this.findClassStart(lines, decoratorEnd);
        
        if (classStart !== -1) {
          const classMatch = lines[classStart].match(/class\s+([A-Z][a-zA-Z0-9]*)/);
          if (classMatch) {
            const componentName = classMatch[1];
            const classEnd = this.findClassEnd(lines, classStart);
            
            components.push({
              id: `${filePath}:${componentName}`,
              name: componentName,
              filePath,
              lineStart: i + 1,
              lineEnd: classEnd + 1,
              type: 'class',
              props: this.parseAngularInputs(lines.slice(classStart, classEnd)),
              state: this.parseAngularProperties(lines.slice(classStart, classEnd)),
              hooks: this.parseAngularLifecycle(lines.slice(classStart, classEnd)),
              imports: this.parseImports(lines.slice(0, i)),
              exports: [],
              events: this.parseAngularEvents(lines.slice(classStart, classEnd)),
              children: [],
              styling: this.parseStyling(lines),
              dependencies: this.parseAngularDependencies(lines.slice(i, decoratorEnd))
            });
          }
        }
      }
    }

    return components;
  }

  private parseServices(files: Array<{ path: string; content: string }>): ServiceDefinition[] {
    const services: ServiceDefinition[] = [];

    for (const file of files) {
      const lines = this.fileContents.get(file.path) || [];
      
      // Look for service patterns
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Class-based service
        const classMatch = line.match(/^(?:export\s+)?class\s+([A-Z][a-zA-Z0-9]*Service)/);
        if (classMatch) {
          const serviceName = classMatch[1];
          const endLine = this.findClassEnd(lines, i);
          
          services.push({
            id: `${file.path}:${serviceName}`,
            name: serviceName,
            filePath: file.path,
            lineStart: i + 1,
            lineEnd: endLine + 1,
            type: 'api',
            methods: this.parseMethods(lines.slice(i, endLine + 1)),
            dependencies: [],
            exports: []
          });
        }
      }
    }

    return services;
  }

  private parseStores(files: Array<{ path: string; content: string }>): StoreDefinition[] {
    const stores: StoreDefinition[] = [];

    for (const file of files) {
      const lines = this.fileContents.get(file.path) || [];
      
      // Redux store pattern
      if (file.path.includes('store') || file.path.includes('redux')) {
        const storeName = this.extractFileName(file.path);
        
        stores.push({
          id: `${file.path}:${storeName}`,
          name: storeName,
          filePath: file.path,
          lineStart: 1,
          lineEnd: lines.length,
          type: 'redux',
          state: this.parseReduxState(lines),
          actions: this.parseReduxActions(lines),
          selectors: [],
          middleware: []
        });
      }
    }

    return stores;
  }

  private parseRoutes(files: Array<{ path: string; content: string }>): RouteDefinition[] {
    const routes: RouteDefinition[] = [];

    for (const file of files) {
      const lines = this.fileContents.get(file.path) || [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // React Router pattern
        const routeMatch = line.match(/<Route\s+path=["']([^"']+)["']\s+component=\{([^}]+)\}/);
        if (routeMatch) {
          routes.push({
            id: `${file.path}:${i}`,
            path: routeMatch[1],
            filePath: file.path,
            lineStart: i + 1,
            lineEnd: i + 1,
            component: routeMatch[2],
            method: 'GET',
            guards: [],
            middleware: [],
            params: this.extractRouteParams(routeMatch[1]),
            query: [],
            meta: {}
          });
        }
      }
    }

    return routes;
  }

  private parseModels(files: Array<{ path: string; content: string }>): ModelDefinition[] {
    const models: ModelDefinition[] = [];

    for (const file of files) {
      const lines = this.fileContents.get(file.path) || [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Mongoose/Sequelize model pattern
        const modelMatch = line.match(/const\s+([A-Z][a-zA-Z0-9]*)\s*=\s*(?:mongoose\.model|sequelize\.define)/);
        if (modelMatch) {
          const modelName = modelMatch[1];
          const endLine = this.findStatementEnd(lines, i);
          
          models.push({
            id: `${file.path}:${modelName}`,
            name: modelName,
            filePath: file.path,
            lineStart: i + 1,
            lineEnd: endLine + 1,
            fields: this.parseModelFields(lines.slice(i, endLine + 1)),
            relations: [],
            indexes: [],
            validations: []
          });
        }
      }
    }

    return models;
  }

  // Helper methods for parsing
  private parsePages(files: Array<{ path: string; content: string }>): PageDefinition[] {
    return files
      .filter(f => this.isPageFile(f.path))
      .map((file, index) => ({
        id: `${file.path}:page`,
        name: this.extractFileName(file.path),
        filePath: file.path,
        route: this.inferRouteFromPath(file.path),
        lineStart: 1,
        lineEnd: (this.fileContents.get(file.path) || []).length,
        components: [],
        layout: undefined,
        meta: { title: this.extractFileName(file.path) },
        auth: { required: false }
      }));
  }

  private parseLayouts(files: Array<{ path: string; content: string }>): LayoutDefinition[] {
    return files
      .filter(f => this.isLayoutFile(f.path))
      .map(file => ({
        id: `${file.path}:layout`,
        name: this.extractFileName(file.path),
        filePath: file.path,
        lineStart: 1,
        lineEnd: (this.fileContents.get(file.path) || []).length,
        components: [],
        slots: []
      }));
  }

  private parseStyles(files: Array<{ path: string; content: string }>): StyleDefinition[] {
    return files.map(file => ({
      id: `${file.path}:styles`,
      filePath: file.path,
      type: this.getStyleType(file.path) as any,
      selectors: [],
      variables: [],
      themes: []
    }));
  }

  private parseDependencies(files: Array<{ path: string; content: string }>): any[] {
    const packageJson = files.find(f => f.path.endsWith('package.json'));
    if (!packageJson) return [];

    try {
      const pkg = JSON.parse(packageJson.content);
      const deps: any[] = [];
      
      if (pkg.dependencies) {
        Object.entries(pkg.dependencies).forEach(([name, version]) => {
          deps.push({
            name,
            version: version as string,
            type: 'dependency',
            required: true
          });
        });
      }

      return deps;
    } catch {
      return [];
    }
  }

  // Utility methods
  private isUIFile(path: string): boolean {
    const uiExtensions = ['.jsx', '.tsx', '.vue', '.svelte'];
    const uiPatterns = ['/components/', '/pages/', '/views/', '/layouts/'];
    
    return uiExtensions.some(ext => path.endsWith(ext)) ||
           uiPatterns.some(pattern => path.includes(pattern));
  }

  private isLogicFile(path: string): boolean {
    const logicPatterns = ['/services/', '/utils/', '/stores/', '/api/', '/lib/'];
    return logicPatterns.some(pattern => path.includes(pattern));
  }

  private isRouteFile(path: string): boolean {
    const routePatterns = ['/routes/', '/router/', 'routing'];
    return routePatterns.some(pattern => path.includes(pattern));
  }

  private isDataFile(path: string): boolean {
    const dataPatterns = ['/models/', '/schemas/', '/database/', '/db/'];
    return dataPatterns.some(pattern => path.includes(pattern));
  }

  private isConfigFile(path: string): boolean {
    const configFiles = ['package.json', 'webpack.config.js', 'vite.config.js', 'tsconfig.json'];
    return configFiles.some(file => path.endsWith(file));
  }

  private isStyleFile(path: string): boolean {
    const styleExtensions = ['.css', '.scss', '.sass', '.less'];
    return styleExtensions.some(ext => path.endsWith(ext));
  }

  private isPageFile(path: string): boolean {
    return path.includes('/pages/') || path.includes('/views/');
  }

  private isLayoutFile(path: string): boolean {
    return path.includes('/layouts/') || path.includes('/templates/');
  }

  private extractFileName(path: string): string {
    return path.split('/').pop()?.split('.')[0] || 'unknown';
  }

  private getStyleType(path: string): string {
    if (path.endsWith('.scss')) return 'scss';
    if (path.endsWith('.sass')) return 'sass';
    if (path.endsWith('.less')) return 'less';
    return 'css';
  }

  private inferRouteFromPath(path: string): string {
    const segments = path.split('/');
    const pageIndex = segments.findIndex(s => s === 'pages');
    if (pageIndex !== -1) {
      const route = segments.slice(pageIndex + 1).join('/');
      return '/' + route.replace(/\.(jsx?|tsx?|vue)$/, '');
    }
    return '/';
  }

  private findComponentEnd(lines: string[], startLine: number, type: 'functional' | 'class'): number {
    let braceCount = 0;
    let inFunction = false;
    
    for (let i = startLine; i < lines.length; i++) {
      const line = lines[i];
      
      for (const char of line) {
        if (char === '{') {
          braceCount++;
          inFunction = true;
        } else if (char === '}') {
          braceCount--;
          if (braceCount === 0 && inFunction) {
            return i;
          }
        }
      }
    }
    
    return lines.length - 1;
  }

  private findSectionBounds(lines: string[], startTag: string, endTag: string): { start: number; end: number } | null {
    const startIndex = lines.findIndex(line => line.includes(startTag));
    if (startIndex === -1) return null;
    
    const endIndex = lines.findIndex((line, i) => i > startIndex && line.includes(endTag));
    if (endIndex === -1) return null;
    
    return { start: startIndex, end: endIndex };
  }

  private findDecoratorEnd(lines: string[], start: number): number {
    for (let i = start; i < lines.length; i++) {
      if (lines[i].includes(')') && !lines[i].includes('(')) {
        return i;
      }
    }
    return start;
  }

  private findClassStart(lines: string[], start: number): number {
    for (let i = start; i < lines.length; i++) {
      if (lines[i].includes('class')) {
        return i;
      }
    }
    return -1;
  }

  private findClassEnd(lines: string[], start: number): number {
    let braceCount = 0;
    let foundStart = false;
    
    for (let i = start; i < lines.length; i++) {
      const line = lines[i];
      
      for (const char of line) {
        if (char === '{') {
          braceCount++;
          foundStart = true;
        } else if (char === '}') {
          braceCount--;
          if (braceCount === 0 && foundStart) {
            return i;
          }
        }
      }
    }
    
    return lines.length - 1;
  }

  private findStatementEnd(lines: string[], start: number): number {
    for (let i = start; i < lines.length; i++) {
      if (lines[i].includes(';') || lines[i].includes('}')) {
        return i;
      }
    }
    return start;
  }

  // Parsing helper methods that return empty arrays for now
  // These would be implemented based on specific framework patterns
  private parseImports(lines: string[]): ImportDefinition[] {
    const imports: ImportDefinition[] = [];
    
    lines.forEach((line, index) => {
      const importMatch = line.match(/import\s+(?:\{([^}]+)\}|([^,\s]+))(?:\s*,\s*\{([^}]+)\})?\s+from\s+['"]([^'"]+)['"]/);
      if (importMatch) {
        const [, namedImports, defaultImport, additionalNamed, module] = importMatch;
        
        if (defaultImport) {
          imports.push({
            module,
            imports: [defaultImport.trim()],
            isDefault: true,
            lineNumber: index + 1
          });
        }
        
        if (namedImports) {
          imports.push({
            module,
            imports: namedImports.split(',').map(imp => imp.trim()),
            isDefault: false,
            lineNumber: index + 1
          });
        }
      }
    });
    
    return imports;
  }

  private parseExports(lines: string[]): ExportDefinition[] {
    const exports: ExportDefinition[] = [];
    
    lines.forEach((line, index) => {
      if (line.includes('export default')) {
        const match = line.match(/export\s+default\s+([^;]+)/);
        if (match) {
          exports.push({
            name: match[1].trim(),
            type: 'default',
            lineNumber: index + 1
          });
        }
      } else if (line.includes('export')) {
        const match = line.match(/export\s+(?:const|let|var|function|class)\s+([^=\s(]+)/);
        if (match) {
          exports.push({
            name: match[1].trim(),
            type: 'named',
            lineNumber: index + 1
          });
        }
      }
    });
    
    return exports;
  }

  private parseProps(lines: string[]): PropertyDefinition[] { return []; }
  private parseState(lines: string[], type: string): StateDefinition[] { return []; }
  private parseHooks(lines: string[]): HookUsage[] { return []; }
  private parseEventHandlers(lines: string[]): EventHandler[] { return []; }
  private parseComponentChildren(lines: string[]): any[] { return []; }
  private parseStyling(lines: string[]): any { 
    return { type: 'css', classes: [], styles: {}, lineNumbers: [] }; 
  }
  private parseComponentDependencies(lines: string[]): string[] { return []; }
  private parseVueProps(lines: string[]): PropertyDefinition[] { return []; }
  private parseVueData(lines: string[]): StateDefinition[] { return []; }
  private parseVueLifecycle(lines: string[]): HookUsage[] { return []; }
  private parseVueEvents(lines: string[]): EventHandler[] { return []; }
  private parseVueTemplate(lines: string[]): any[] { return []; }
  private parseAngularInputs(lines: string[]): PropertyDefinition[] { return []; }
  private parseAngularProperties(lines: string[]): StateDefinition[] { return []; }
  private parseAngularLifecycle(lines: string[]): HookUsage[] { return []; }
  private parseAngularEvents(lines: string[]): EventHandler[] { return []; }
  private parseAngularDependencies(lines: string[]): string[] { return []; }
  private parseMethods(lines: string[]): MethodDefinition[] { return []; }
  private parseReduxState(lines: string[]): StateDefinition[] { return []; }
  private parseReduxActions(lines: string[]): any[] { return []; }
  private parseModelFields(lines: string[]): any[] { return []; }
  private extractVueComponentName(lines: string[]): string { return 'Component'; }
  private extractRouteParams(path: string): any[] { return []; }
}