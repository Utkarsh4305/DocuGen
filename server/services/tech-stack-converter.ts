import { LineByLineParser } from './line-parser';
import { TranspilerService } from './transpiler';
import { 
  TechStackConversionRequest,
  TechStackConversionResult,
  ParsedProjectStructure,
  TechStack,
  ConvertedFile,
  LineMapping,
  ConversionError,
  ConversionWarning,
  ConversionSummary
} from "@shared/stack-conversion-schema";

export class TechStackConverter {
  private lineParser: LineByLineParser;
  private transpiler: TranspilerService;

  constructor() {
    this.lineParser = new LineByLineParser();
    this.transpiler = new TranspilerService();
  }

  async convertTechStack(
    request: TechStackConversionRequest,
    files: Array<{ path: string; content: string }>
  ): Promise<TechStackConversionResult> {
    const startTime = Date.now();
    
    try {
      console.log(`🚀 Starting tech stack conversion from ${JSON.stringify(request.currentStack)} to ${JSON.stringify(request.targetStack)}`);

      // Step 1: Parse the current project structure line by line
      const currentFramework = this.detectPrimaryFramework(request.currentStack);
      const targetFramework = this.detectPrimaryFramework(request.targetStack);
      
      console.log(`📄 Parsing project structure with ${currentFramework} framework...`);
      const parsedStructure = this.lineParser.parseProject(files, currentFramework);
      
      // Step 2: Perform intelligent tech stack conversion
      console.log(`🔄 Converting from ${currentFramework} to ${targetFramework}...`);
      const conversionResult = await this.performConversion(
        parsedStructure,
        request.currentStack,
        request.targetStack,
        request.conversionOptions,
        files
      );

      // Step 3: Generate line mappings for traceability
      const lineMappings = this.generateLineMappings(files, conversionResult.files);

      // Step 4: Validate conversion and collect errors/warnings
      const { errors, warnings } = this.validateConversion(conversionResult.files, request.targetStack);

      const endTime = Date.now();
      const conversionTime = endTime - startTime;

      return {
        success: errors.length === 0,
        convertedProject: parsedStructure,
        files: conversionResult.files,
        lineMappings,
        errors,
        warnings,
        summary: this.generateConversionSummary(
          files,
          conversionResult.files,
          conversionTime,
          request.currentStack,
          request.targetStack
        )
      };

    } catch (error) {
      console.error('❌ Tech stack conversion failed:', error);
      return {
        success: false,
        convertedProject: {
          ui: { components: [], pages: [], layouts: [], styles: [] },
          logic: { services: [], utilities: [], stores: [], middleware: [], validators: [], constants: [] },
          routes: { routes: [], guards: [], middleware: [], navigation: { type: 'history', config: {} } },
          data: { models: [], schemas: [], migrations: [], seeders: [], queries: [] },
          config: { environment: [], build: { bundler: '', entry: [], output: '', plugins: [], filePath: '' }, deployment: { platform: '', config: {}, filePath: '' }, dependencies: [] }
        },
        files: [],
        lineMappings: [],
        errors: [{
          file: 'system',
          line: 0,
          message: `Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          severity: 'error',
          originalCode: ''
        }],
        warnings: [],
        summary: {
          totalFiles: 0,
          convertedFiles: 0,
          skippedFiles: 0,
          generatedFiles: 0,
          totalLines: 0,
          convertedLines: 0,
          generatedLines: 0,
          conversionTime: 0,
          frameworks: {
            from: request.currentStack,
            to: request.targetStack
          }
        }
      };
    }
  }

  private async performConversion(
    parsedStructure: ParsedProjectStructure,
    currentStack: TechStack,
    targetStack: TechStack,
    options: any,
    originalFiles: Array<{ path: string; content: string }>
  ): Promise<{ files: ConvertedFile[] }> {
    const convertedFiles: ConvertedFile[] = [];

    // Convert UI components
    if (targetStack.frontend) {
      console.log(`🎨 Converting UI components to ${targetStack.frontend.name}...`);
      const uiFiles = await this.convertUIComponents(parsedStructure.ui, targetStack.frontend, options);
      convertedFiles.push(...uiFiles);
    }

    // Convert backend services
    if (targetStack.backend) {
      console.log(`⚙️ Converting backend services to ${targetStack.backend.name}...`);
      const backendFiles = await this.convertBackendServices(parsedStructure.logic, targetStack.backend, options);
      convertedFiles.push(...backendFiles);
    }

    // Convert database models
    if (targetStack.database) {
      console.log(`🗄️ Converting database models to ${targetStack.database.name}...`);
      const dataFiles = await this.convertDataModels(parsedStructure.data, targetStack.database, options);
      convertedFiles.push(...dataFiles);
    }

    // Convert routes and navigation
    console.log(`🛣️ Converting routes and navigation...`);
    const routeFiles = await this.convertRoutes(parsedStructure.routes, targetStack, options);
    convertedFiles.push(...routeFiles);

    // Generate configuration files for new stack
    console.log(`⚙️ Generating configuration files...`);
    const configFiles = await this.generateConfigFiles(targetStack, options);
    convertedFiles.push(...configFiles);

    // Generate package.json with new dependencies
    console.log(`📦 Updating dependencies...`);
    const packageFile = await this.generatePackageJson(currentStack, targetStack, options);
    if (packageFile) {
      convertedFiles.push(packageFile);
    }

    return { files: convertedFiles };
  }

  private async convertUIComponents(
    uiStructure: any,
    targetFramework: any,
    options: any
  ): Promise<ConvertedFile[]> {
    const files: ConvertedFile[] = [];

    for (const component of uiStructure.components) {
      const convertedFile = await this.convertComponent(component, targetFramework, options);
      if (convertedFile) {
        files.push(convertedFile);
      }
    }

    return files;
  }

  private async convertComponent(component: any, targetFramework: any, options: any): Promise<ConvertedFile | null> {
    const targetLang = targetFramework.language;
    
    if (targetLang === 'dart' && targetFramework.name === 'Flutter') {
      return this.convertToFlutter(component, options);
    } else if (targetLang === 'kotlin' && targetFramework.name === 'Android') {
      return this.convertToKotlin(component, options);
    } else if (targetLang === 'javascript' || targetLang === 'typescript') {
      return this.convertToReact(component, targetFramework, options);
    } else if (targetFramework.name === 'Vue') {
      return this.convertToVue(component, options);
    } else if (targetFramework.name === 'Angular') {
      return this.convertToAngular(component, options);
    }

    return null;
  }

  private convertToFlutter(component: any, options: any): ConvertedFile {
    const className = component.name;
    const hasState = component.state && component.state.length > 0;
    
    let content = `import 'package:flutter/material.dart';\n\n`;
    
    if (hasState) {
      content += `class ${className} extends StatefulWidget {\n`;
      content += `  const ${className}({Key? key}) : super(key: key);\n\n`;
      content += `  @override\n`;
      content += `  State<${className}> createState() => _${className}State();\n`;
      content += `}\n\n`;
      content += `class _${className}State extends State<${className}> {\n`;
      
      // Add state variables
      component.state.forEach((state: any) => {
        content += `  ${this.mapTypeToFlutter(state.type)} ${state.name} = ${this.mapValueToFlutter(state.initialValue)};\n`;
      });
      
      content += `\n  @override\n`;
      content += `  Widget build(BuildContext context) {\n`;
      content += `    return Container(\n`;
      content += `      child: Text('${className}'),\n`;
      content += `    );\n`;
      content += `  }\n`;
      content += `}\n`;
    } else {
      content += `class ${className} extends StatelessWidget {\n`;
      content += `  const ${className}({Key? key}) : super(key: key);\n\n`;
      content += `  @override\n`;
      content += `  Widget build(BuildContext context) {\n`;
      content += `    return Container(\n`;
      content += `      child: Text('${className}'),\n`;
      content += `    );\n`;
      content += `  }\n`;
      content += `}\n`;
    }

    return {
      originalPath: component.filePath,
      newPath: `lib/widgets/${component.name.toLowerCase()}.dart`,
      content,
      type: 'widget',
      language: 'dart',
      lineCount: content.split('\n').length
    };
  }

  private convertToKotlin(component: any, options: any): ConvertedFile {
    const componentName = component.name;
    
    let content = `package com.example.app.ui.components\n\n`;
    content += `import androidx.compose.foundation.layout.*\n`;
    content += `import androidx.compose.material3.*\n`;
    content += `import androidx.compose.runtime.*\n`;
    content += `import androidx.compose.ui.Alignment\n`;
    content += `import androidx.compose.ui.Modifier\n`;
    content += `import androidx.compose.ui.unit.dp\n\n`;
    
    content += `@Composable\n`;
    content += `fun ${componentName}(\n`;
    content += `    modifier: Modifier = Modifier\n`;
    content += `) {\n`;
    
    // Add state variables
    component.state?.forEach((state: any) => {
      content += `    var ${state.name} by remember { mutableStateOf(${this.mapValueToKotlin(state.initialValue)}) }\n`;
    });
    
    content += `\n    Column(\n`;
    content += `        modifier = modifier.fillMaxWidth(),\n`;
    content += `        horizontalAlignment = Alignment.CenterHorizontally\n`;
    content += `    ) {\n`;
    content += `        Text("${componentName}")\n`;
    content += `    }\n`;
    content += `}\n`;

    return {
      originalPath: component.filePath,
      newPath: `app/src/main/java/com/example/app/ui/components/${componentName}.kt`,
      content,
      type: 'composable',
      language: 'kotlin',
      lineCount: content.split('\n').length
    };
  }

  private convertToReact(component: any, targetFramework: any, options: any): ConvertedFile {
    const componentName = component.name;
    const isTypeScript = targetFramework.language === 'typescript';
    const extension = isTypeScript ? 'tsx' : 'jsx';
    
    let content = `import React${component.state?.length > 0 ? ', { useState }' : ''} from 'react';\n\n`;
    
    // Props interface for TypeScript
    if (isTypeScript && component.props?.length > 0) {
      content += `interface ${componentName}Props {\n`;
      component.props.forEach((prop: any) => {
        content += `  ${prop.name}${prop.required ? '' : '?'}: ${this.mapTypeToTypeScript(prop.type)};\n`;
      });
      content += `}\n\n`;
    }
    
    const propsParam = component.props?.length > 0 
      ? (isTypeScript ? `props: ${componentName}Props` : 'props') 
      : '';
      
    content += `const ${componentName}${isTypeScript ? ': React.FC' + (component.props?.length > 0 ? `<${componentName}Props>` : '') : ''} = (${propsParam}) => {\n`;
    
    // State hooks
    component.state?.forEach((state: any) => {
      const typeAnnotation = isTypeScript ? `<${this.mapTypeToTypeScript(state.type)}>` : '';
      content += `  const [${state.name}, set${state.name.charAt(0).toUpperCase() + state.name.slice(1)}] = useState${typeAnnotation}(${this.mapValueToTypeScript(state.initialValue)});\n`;
    });
    
    content += `\n  return (\n`;
    content += `    <div>\n`;
    content += `      <h1>${componentName}</h1>\n`;
    content += `    </div>\n`;
    content += `  );\n`;
    content += `};\n\n`;
    content += `export default ${componentName};\n`;

    return {
      originalPath: component.filePath,
      newPath: `src/components/${componentName}.${extension}`,
      content,
      type: 'component',
      language: isTypeScript ? 'typescript' : 'javascript',
      lineCount: content.split('\n').length
    };
  }

  private convertToVue(component: any, options: any): ConvertedFile {
    const componentName = component.name;
    
    let content = `<template>\n`;
    content += `  <div class="${componentName.toLowerCase()}">\n`;
    content += `    <h1>{{ title }}</h1>\n`;
    content += `  </div>\n`;
    content += `</template>\n\n`;
    
    content += `<script setup>\n`;
    content += `import { ref } from 'vue'\n\n`;
    
    content += `const title = ref('${componentName}')\n`;
    
    // Add state as refs
    component.state?.forEach((state: any) => {
      content += `const ${state.name} = ref(${JSON.stringify(state.initialValue)})\n`;
    });
    
    content += `</script>\n\n`;
    
    content += `<style scoped>\n`;
    content += `.${componentName.toLowerCase()} {\n`;
    content += `  padding: 20px;\n`;
    content += `}\n`;
    content += `</style>\n`;

    return {
      originalPath: component.filePath,
      newPath: `src/components/${componentName}.vue`,
      content,
      type: 'component',
      language: 'vue',
      lineCount: content.split('\n').length
    };
  }

  private convertToAngular(component: any, options: any): ConvertedFile {
    const componentName = component.name;
    const selector = componentName.replace(/([A-Z])/g, '-$1').toLowerCase().substring(1);
    
    let content = `import { Component } from '@angular/core';\n\n`;
    content += `@Component({\n`;
    content += `  selector: 'app-${selector}',\n`;
    content += `  template: \`\n`;
    content += `    <div class="${selector}">\n`;
    content += `      <h1>{{ title }}</h1>\n`;
    content += `    </div>\n`;
    content += `  \`,\n`;
    content += `  styles: [\`\n`;
    content += `    .${selector} {\n`;
    content += `      padding: 20px;\n`;
    content += `    }\n`;
    content += `  \`]\n`;
    content += `})\n`;
    content += `export class ${componentName}Component {\n`;
    content += `  title = '${componentName}';\n`;
    
    // Add properties from state
    component.state?.forEach((state: any) => {
      content += `  ${state.name}: ${this.mapTypeToTypeScript(state.type)} = ${this.mapValueToTypeScript(state.initialValue)};\n`;
    });
    
    content += `}\n`;

    return {
      originalPath: component.filePath,
      newPath: `src/app/components/${selector}/${selector}.component.ts`,
      content,
      type: 'component',
      language: 'typescript',
      lineCount: content.split('\n').length
    };
  }

  private async convertBackendServices(logicStructure: any, targetFramework: any, options: any): Promise<ConvertedFile[]> {
    // Implementation for backend service conversion
    return [];
  }

  private async convertDataModels(dataStructure: any, targetFramework: any, options: any): Promise<ConvertedFile[]> {
    // Implementation for data model conversion
    return [];
  }

  private async convertRoutes(routeStructure: any, targetStack: TechStack, options: any): Promise<ConvertedFile[]> {
    // Implementation for route conversion
    return [];
  }

  private async generateConfigFiles(targetStack: TechStack, options: any): Promise<ConvertedFile[]> {
    const configFiles: ConvertedFile[] = [];

    if (targetStack.frontend?.name === 'Flutter') {
      configFiles.push({
        originalPath: '',
        newPath: 'pubspec.yaml',
        content: this.generatePubspecYaml(),
        type: 'config',
        language: 'yaml',
        lineCount: 20
      });
    } else if (targetStack.frontend?.name === 'Android') {
      configFiles.push({
        originalPath: '',
        newPath: 'build.gradle.kts',
        content: this.generateAndroidBuildGradle(),
        type: 'config',
        language: 'kotlin',
        lineCount: 50
      });
    }

    return configFiles;
  }

  private async generatePackageJson(currentStack: TechStack, targetStack: TechStack, options: any): Promise<ConvertedFile | null> {
    if (targetStack.frontend?.language === 'javascript' || targetStack.frontend?.language === 'typescript') {
      const packageJson = {
        name: 'converted-app',
        version: '1.0.0',
        dependencies: this.generateDependencies(targetStack),
        devDependencies: this.generateDevDependencies(targetStack),
        scripts: this.generateScripts(targetStack)
      };

      return {
        originalPath: 'package.json',
        newPath: 'package.json',
        content: JSON.stringify(packageJson, null, 2),
        type: 'config',
        language: 'json',
        lineCount: Object.keys(packageJson).length + 10
      };
    }

    return null;
  }

  // Helper methods for type mapping
  private mapTypeToFlutter(type: string): string {
    const typeMap: Record<string, string> = {
      'string': 'String',
      'number': 'int',
      'boolean': 'bool',
      'array': 'List<dynamic>',
      'object': 'Map<String, dynamic>'
    };
    return typeMap[type] || 'dynamic';
  }

  private mapTypeToTypeScript(type: string): string {
    const typeMap: Record<string, string> = {
      'string': 'string',
      'number': 'number', 
      'boolean': 'boolean',
      'array': 'any[]',
      'object': 'Record<string, any>'
    };
    return typeMap[type] || 'any';
  }

  private mapValueToFlutter(value: any): string {
    if (typeof value === 'string') return `'${value}'`;
    if (typeof value === 'boolean') return value.toString();
    if (typeof value === 'number') return value.toString();
    return 'null';
  }

  private mapValueToKotlin(value: any): string {
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'boolean') return value.toString();
    if (typeof value === 'number') return value.toString();
    return 'null';
  }

  private mapValueToTypeScript(value: any): string {
    if (typeof value === 'string') return `'${value}'`;
    return JSON.stringify(value);
  }

  private detectPrimaryFramework(stack: TechStack): string {
    if (stack.frontend) return stack.frontend.name.toLowerCase();
    if (stack.backend) return stack.backend.name.toLowerCase();
    if (stack.mobile) return stack.mobile.name.toLowerCase();
    return 'unknown';
  }

  private generateLineMappings(originalFiles: Array<{ path: string; content: string }>, convertedFiles: ConvertedFile[]): LineMapping[] {
    // Simple 1:1 line mapping for now - could be enhanced for more complex mappings
    const mappings: LineMapping[] = [];
    
    convertedFiles.forEach(convertedFile => {
      const originalFile = originalFiles.find(f => f.path === convertedFile.originalPath);
      if (originalFile) {
        const originalLines = originalFile.content.split('\n').length;
        const convertedLines = convertedFile.lineCount;
        
        for (let i = 0; i < Math.min(originalLines, convertedLines); i++) {
          mappings.push({
            originalFile: originalFile.path,
            originalLine: i + 1,
            newFile: convertedFile.newPath,
            newLine: i + 1,
            type: 'transformed'
          });
        }
      }
    });
    
    return mappings;
  }

  private validateConversion(files: ConvertedFile[], targetStack: TechStack): { errors: ConversionError[], warnings: ConversionWarning[] } {
    const errors: ConversionError[] = [];
    const warnings: ConversionWarning[] = [];
    
    // Basic validation - check if files were generated
    if (files.length === 0) {
      errors.push({
        file: 'system',
        line: 0,
        message: 'No files were generated during conversion',
        severity: 'error',
        originalCode: ''
      });
    }
    
    return { errors, warnings };
  }

  private generateConversionSummary(
    originalFiles: Array<{ path: string; content: string }>,
    convertedFiles: ConvertedFile[],
    conversionTime: number,
    currentStack: TechStack,
    targetStack: TechStack
  ): ConversionSummary {
    const totalOriginalLines = originalFiles.reduce((sum, file) => sum + file.content.split('\n').length, 0);
    const totalConvertedLines = convertedFiles.reduce((sum, file) => sum + file.lineCount, 0);
    
    return {
      totalFiles: originalFiles.length,
      convertedFiles: convertedFiles.length,
      skippedFiles: originalFiles.length - convertedFiles.length,
      generatedFiles: convertedFiles.filter(f => !f.originalPath).length,
      totalLines: totalOriginalLines,
      convertedLines: totalConvertedLines,
      generatedLines: convertedFiles.filter(f => !f.originalPath).reduce((sum, f) => sum + f.lineCount, 0),
      conversionTime,
      frameworks: {
        from: currentStack,
        to: targetStack
      }
    };
  }

  private generatePubspecYaml(): string {
    return `name: converted_flutter_app
description: Converted Flutter application
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'
  flutter: ">=3.10.0"

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.6

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
`;
  }

  private generateAndroidBuildGradle(): string {
    return `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.example.convertedapp"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.example.convertedapp"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
    }

    buildFeatures {
        compose = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.activity:activity-compose:1.8.2")
    implementation("androidx.compose.ui:ui:1.5.8")
    implementation("androidx.compose.material3:material3:1.1.2")
}
`;
  }

  private generateDependencies(targetStack: TechStack): Record<string, string> {
    const deps: Record<string, string> = {};
    
    if (targetStack.frontend?.name === 'React') {
      deps.react = '^18.0.0';
      deps['react-dom'] = '^18.0.0';
    } else if (targetStack.frontend?.name === 'Vue') {
      deps.vue = '^3.0.0';
    } else if (targetStack.frontend?.name === 'Angular') {
      deps['@angular/core'] = '^17.0.0';
      deps['@angular/common'] = '^17.0.0';
    }
    
    return deps;
  }

  private generateDevDependencies(targetStack: TechStack): Record<string, string> {
    const devDeps: Record<string, string> = {};
    
    if (targetStack.frontend?.language === 'typescript') {
      devDeps.typescript = '^5.0.0';
      devDeps['@types/react'] = '^18.0.0';
    }
    
    return devDeps;
  }

  private generateScripts(targetStack: TechStack): Record<string, string> {
    const scripts: Record<string, string> = {
      'start': 'npm run dev',
      'build': 'npm run build',
      'test': 'npm run test'
    };
    
    if (targetStack.frontend?.name === 'React') {
      scripts.dev = 'vite';
      scripts.build = 'vite build';
    }
    
    return scripts;
  }
}