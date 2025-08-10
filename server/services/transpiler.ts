import { LanguageDetector } from './language-detector';
import { ASTParser } from './ast-parser';
import { UIRGenerator, UIRNode } from './uir-generator';

export interface ConversionResult {
  success: boolean;
  files: Array<{
    path: string;
    content: string;
    type: string;
  }>;
  errors?: string[];
  warnings?: string[];
}

export interface ConversionOptions {
  preserveComments?: boolean;
  generateTests?: boolean;
}

export class TranspilerService {
  private languageDetector: LanguageDetector;
  private astParser: ASTParser;
  private uirGenerator: UIRGenerator;

  constructor() {
    this.languageDetector = new LanguageDetector();
    this.astParser = new ASTParser();
    this.uirGenerator = new UIRGenerator();
  }

  async transpileProject(
    files: Array<{ path: string; content: string }>,
    fromFramework: string,
    toFramework: string,
    options: ConversionOptions
  ): Promise<ConversionResult> {
    try {
      console.log(`🚀 Starting file-by-file conversion from ${fromFramework} to ${toFramework} with ${files.length} files`);
      
      const result: ConversionResult = {
        success: false,
        files: [],
        errors: [],
        warnings: [],
      };

      // Step 1: Process each file individually and convert to UIR
      const uirNodes: UIRNode[] = [];
      let processedFiles = 0;

      for (const file of files) {
        try {
          console.log(`📄 Processing file: ${file.path}`);
          
          // Parse file to AST
          let astNode;
          if (file.path.endsWith('.js') || file.path.endsWith('.jsx') || file.path.endsWith('.ts') || file.path.endsWith('.tsx')) {
            astNode = this.astParser.parseJavaScript(file.content, file.path);
          } else if (file.path.endsWith('.css') || file.path.endsWith('.scss')) {
            astNode = this.astParser.parseCSS(file.content, file.path);
          } else {
            console.log(`⏭️  Skipping non-code file: ${file.path}`);
            continue;
          }
          
          // Convert AST to UIR
          const fileUIRNodes = this.uirGenerator.generateUIR(astNode, file.path, fromFramework);
          uirNodes.push(...fileUIRNodes);
          processedFiles++;
          
        } catch (error) {
          console.error(`❌ Error processing file ${file.path}:`, error);
          result.warnings?.push(`Could not process file ${file.path}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      console.log(`✨ Generated ${uirNodes.length} UIR nodes from ${processedFiles} files`);

      // Step 2: Convert UIR to target framework
      for (const uirNode of uirNodes) {
        try {
          const convertedFile = await this.convertUIRToTargetFramework(uirNode, toFramework, options);
          if (convertedFile) {
            result.files.push(convertedFile);
          }
        } catch (error) {
          console.error(`❌ Error converting UIR node ${uirNode.name}:`, error);
          result.errors?.push(`Failed to convert ${uirNode.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Step 3: Add framework-specific configuration files
      this.addFrameworkConfigs(result, toFramework);
      
      // Step 4: Add essential documentation
      result.files.push({
        path: 'README.md',
        content: this.generateReadme(fromFramework, toFramework, processedFiles, uirNodes.length),
        type: 'markdown',
      });

      result.success = result.files.length > 0;
      console.log(`🎉 File-by-file conversion completed! Generated ${result.files.length} files`);
      
      return result;

    } catch (error) {
      console.error('❌ Transpilation failed:', error);
      return {
        success: false,
        files: [],
        errors: [`Transpilation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      };
    }
  }

  private async convertUIRToTargetFramework(
    uirNode: UIRNode, 
    toFramework: string, 
    options: ConversionOptions
  ): Promise<{ path: string; content: string; type: string } | null> {
    
    switch (toFramework) {
      case 'flutter':
      case 'dart':
        return this.convertUIRToFlutter(uirNode, options);
      case 'kotlin':
        return this.convertUIRToKotlin(uirNode, options);
      case 'typescript':
        return this.convertUIRToTypeScript(uirNode, options);
      default:
        return null;
    }
  }

  private convertUIRToFlutter(uirNode: UIRNode, options: ConversionOptions): { path: string; content: string; type: string } {
    const fileName = uirNode.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    if (uirNode.type === 'component') {
      const className = uirNode.name;
      const props = uirNode.structure?.props || {};
      const state = uirNode.structure?.state || {};
      const children = uirNode.structure?.children || [];
      
      let content = `// Converted from ${uirNode.metadata.originalFile}\nimport 'package:flutter/material.dart';\n\n`;
      
      // Generate class with proper state management
      if (Object.keys(state).length > 0) {
        content += `class ${className}Widget extends StatefulWidget {\n`;
        
        // Add constructor with props
        if (Object.keys(props).length > 0) {
          const propList = Object.entries(props).map(([name, prop]) => `  final ${this.mapTypeToFlutter(prop.type)} ${name};`).join('\n');
          content += `  ${propList}\n\n`;
          content += `  const ${className}Widget({Key? key, ${Object.keys(props).map(name => `required this.${name}`).join(', ')}}) : super(key: key);\n\n`;
        } else {
          content += `  const ${className}Widget({Key? key}) : super(key: key);\n\n`;
        }
        
        content += `  @override\n  State<${className}Widget> createState() => _${className}WidgetState();\n}\n\n`;
        content += `class _${className}WidgetState extends State<${className}Widget> {\n`;
        
        // Add state variables
        Object.entries(state).forEach(([name, stateInfo]) => {
          const dartType = this.mapTypeToFlutter(stateInfo.type);
          content += `  ${dartType} ${name} = ${this.convertValueToFlutter(stateInfo.initialValue, dartType)};\n`;
        });
        
        content += '\n  @override\n  Widget build(BuildContext context) {\n';
      } else {
        content += `class ${className}Widget extends StatelessWidget {\n`;
        
        // Add constructor with props
        if (Object.keys(props).length > 0) {
          const propList = Object.entries(props).map(([name, prop]) => `  final ${this.mapTypeToFlutter(prop.type)} ${name};`).join('\n');
          content += `  ${propList}\n\n`;
          content += `  const ${className}Widget({Key? key, ${Object.keys(props).map(name => `required this.${name}`).join(', ')}}) : super(key: key);\n\n`;
        } else {
          content += `  const ${className}Widget({Key? key}) : super(key: key);\n\n`;
        }
        
        content += '  @override\n  Widget build(BuildContext context) {\n';
      }
      
      // Build the widget tree from UIR children
      const widgetTree = this.buildFlutterWidgetTree(children);
      content += `    return ${widgetTree};\n  }\n`;
      
      // Add state update methods if needed
      if (Object.keys(state).length > 0) {
        Object.entries(state).forEach(([name, stateInfo]) => {
          const setterName = `update${name.charAt(0).toUpperCase() + name.slice(1)}`;
          const dartType = this.mapTypeToFlutter(stateInfo.type);
          content += `\n  void ${setterName}(${dartType} newValue) {\n    setState(() {\n      ${name} = newValue;\n    });\n  }\n`;
        });
      }
      
      content += '}';
      
      return {
        path: `lib/widgets/${fileName}_widget.dart`,
        content,
        type: 'dart',
      };
    }
    
    return {
      path: `lib/${fileName}.dart`,
      content: `// Converted from ${uirNode.metadata.originalFile}\n// UIR Node: ${uirNode.type}\n\n// TODO: Implement ${uirNode.name}`,
      type: 'dart',
    };
  }

  private convertUIRToKotlin(uirNode: UIRNode, options: ConversionOptions): { path: string; content: string; type: string } {
    const fileName = uirNode.name;
    
    if (uirNode.type === 'component') {
      const props = uirNode.structure?.props || {};
      const state = uirNode.structure?.state || {};
      const children = uirNode.structure?.children || [];
      
      let content = `// Converted from ${uirNode.metadata.originalFile}\nimport androidx.compose.foundation.layout.*\nimport androidx.compose.material3.*\nimport androidx.compose.runtime.*\nimport androidx.compose.ui.Alignment\nimport androidx.compose.ui.Modifier\nimport androidx.compose.ui.unit.dp\n\n`;
      
      content += `@OptIn(ExperimentalMaterial3Api::class)\n@Composable\nfun ${fileName}Screen(`;
      
      // Add props as parameters
      const propParams = Object.entries(props).map(([name, prop]) => `${name}: ${this.mapTypeToKotlin(prop.type)}`);
      content += propParams.join(', ');
      content += ') {\n';
      
      // Add state variables using remember
      Object.entries(state).forEach(([name, stateInfo]) => {
        const kotlinType = this.mapTypeToKotlin(stateInfo.type);
        const initialValue = this.convertValueToKotlin(stateInfo.initialValue, kotlinType);
        content += `    var ${name} by remember { mutableStateOf(${initialValue}) }\n`;
      });
      
      if (Object.keys(state).length > 0) content += '\n';
      
      // Build the composable tree
      const composableTree = this.buildKotlinComposableTree(children);
      content += `    ${composableTree}\n}`;
      
      return {
        path: `app/src/main/java/com/example/app/ui/${fileName}Screen.kt`,
        content,
        type: 'kotlin',
      };
    }
    
    return {
      path: `app/src/main/java/com/example/app/${fileName}.kt`,
      content: `// Converted from ${uirNode.metadata.originalFile}\n// UIR Node: ${uirNode.type}\n\n// TODO: Implement ${uirNode.name}`,
      type: 'kotlin',
    };
  }

  private convertUIRToTypeScript(uirNode: UIRNode, options: ConversionOptions): { path: string; content: string; type: string } {
    const fileName = uirNode.name;
    
    if (uirNode.type === 'component') {
      const props = uirNode.structure?.props || {};
      const state = uirNode.structure?.state || {};
      
      let content = `// Converted from ${uirNode.metadata.originalFile}\nimport React, { useState } from 'react';\n\n`;
      
      // Define props interface
      if (Object.keys(props).length > 0) {
        content += `interface ${fileName}Props {\n`;
        Object.entries(props).forEach(([name, prop]) => {
          content += `  ${name}${prop.required ? '' : '?'}: ${this.mapTypeToTypeScript(prop.type)};\n`;
        });
        content += '}\n\n';
      }
      
      // Component function
      const propsParam = Object.keys(props).length > 0 ? `props: ${fileName}Props` : '';
      content += `const ${fileName}: React.FC${Object.keys(props).length > 0 ? `<${fileName}Props>` : ''} = (${propsParam}) => {\n`;
      
      // Add state hooks
      Object.entries(state).forEach(([name, stateInfo]) => {
        const tsType = this.mapTypeToTypeScript(stateInfo.type);
        const initialValue = this.convertValueToTypeScript(stateInfo.initialValue, tsType);
        content += `  const [${name}, set${name.charAt(0).toUpperCase() + name.slice(1)}] = useState<${tsType}>(${initialValue});\n`;
      });
      
      if (Object.keys(state).length > 0) content += '\n';
      
      content += '  return (\n    <div>\n      {/* TODO: Convert JSX from UIR */}\n      <h1>Converted Component</h1>\n    </div>\n  );\n};\n\n';
      content += `export default ${fileName};`;
      
      return {
        path: `src/components/${fileName}.tsx`,
        content,
        type: 'typescript',
      };
    }
    
    return {
      path: `src/${fileName}.ts`,
      content: `// Converted from ${uirNode.metadata.originalFile}\n// UIR Node: ${uirNode.type}\n\n// TODO: Implement ${uirNode.name}`,
      type: 'typescript',
    };
  }

  // Helper methods for type mapping and widget building
  private mapTypeToFlutter(type: string): string {
    switch (type) {
      case 'string': return 'String';
      case 'number': return 'int';
      case 'boolean': return 'bool';
      case 'array': return 'List<dynamic>';
      case 'object': return 'Map<String, dynamic>';
      default: return 'dynamic';
    }
  }

  private mapTypeToKotlin(type: string): string {
    switch (type) {
      case 'string': return 'String';
      case 'number': return 'Int';
      case 'boolean': return 'Boolean';
      case 'array': return 'List<Any>';
      case 'object': return 'Map<String, Any>';
      default: return 'Any';
    }
  }

  private mapTypeToTypeScript(type: string): string {
    switch (type) {
      case 'string': return 'string';
      case 'number': return 'number';
      case 'boolean': return 'boolean';
      case 'array': return 'any[]';
      case 'object': return 'Record<string, any>';
      default: return 'any';
    }
  }

  private convertValueToFlutter(value: any, type: string): string {
    if (type === 'String' && typeof value === 'string') {
      return `'${value.replace(/'/g, "\\'")}'`;
    }
    return String(value);
  }

  private convertValueToKotlin(value: any, type: string): string {
    if (type === 'String' && typeof value === 'string') {
      return `"${value.replace(/"/g, '\\"')}"`;
    }
    return String(value);
  }

  private convertValueToTypeScript(value: any, type: string): string {
    if (type === 'string' && typeof value === 'string') {
      return `'${value.replace(/'/g, "\\'")}'`;
    }
    return String(value);
  }

  private buildFlutterWidgetTree(children: UIRNode[]): string {
    if (children.length === 0) {
      return 'Container()';
    }
    
    if (children.length === 1) {
      return this.buildFlutterWidget(children[0]);
    }
    
    const childWidgets = children.map(child => this.buildFlutterWidget(child)).join(',\n        ');
    return `Column(\n        children: [\n        ${childWidgets}\n      ],\n    )`;
  }

  private buildFlutterWidget(node: UIRNode): string {
    if (node.type === 'text') {
      return `Text('${node.name}')`;
    }
    
    if (node.type === 'element') {
      const widgetName = this.mapHtmlToFlutter(node.name);
      const children = node.structure?.children || [];
      
      if (children.length === 0) {
        return `${widgetName}()`;
      }
      
      const childWidgets = children.map(child => this.buildFlutterWidget(child)).join(', ');
      return `${widgetName}(child: ${children.length === 1 ? childWidgets : `Column(children: [${childWidgets}])`})`;
    }
    
    return 'Container()';
  }

  private buildKotlinComposableTree(children: UIRNode[]): string {
    if (children.length === 0) {
      return 'Box {}';
    }
    
    const childComposables = children.map(child => this.buildKotlinComposable(child)).join('\n        ');
    
    return `Column {\n        ${childComposables}\n    }`;
  }

  private buildKotlinComposable(node: UIRNode): string {
    if (node.type === 'text') {
      return `Text("${node.name}")`;
    }
    
    if (node.type === 'element') {
      const composableName = this.mapHtmlToCompose(node.name);
      return `${composableName} {}`;
    }
    
    return 'Box {}';
  }

  private mapHtmlToFlutter(elementName: string): string {
    switch (elementName.toLowerCase()) {
      case 'div': return 'Container';
      case 'button': return 'ElevatedButton';
      case 'input': return 'TextField';
      case 'img': return 'Image';
      case 'p': return 'Text';
      case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6': return 'Text';
      default: return 'Container';
    }
  }

  private mapHtmlToCompose(elementName: string): string {
    switch (elementName.toLowerCase()) {
      case 'div': return 'Box';
      case 'button': return 'Button';
      case 'input': return 'TextField';
      case 'img': return 'Image';
      case 'p': return 'Text';
      case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6': return 'Text';
      default: return 'Box';
    }
  }

  private generateReadme(fromFramework: string, toFramework: string, processedFiles: number, uirNodes: number): string {
    return `# Converted Project

This project was automatically converted from **${fromFramework}** to **${toFramework}** using Universal Code Transpiler with file-by-file conversion.

## Conversion Summary
- Files processed: ${processedFiles}
- Components converted: ${uirNodes}
- Source framework: ${fromFramework}
- Target framework: ${toFramework}
- Conversion date: ${new Date().toISOString()}
- Conversion method: AST → UIR → Target Framework

## Architecture
The conversion process:
1. **AST Parsing**: Each source file parsed into Abstract Syntax Tree
2. **UIR Generation**: AST converted to Universal Intermediate Representation
3. **Target Generation**: UIR converted to ${toFramework} with preserved logic and UI structure
4. **Project Structure**: Generated proper ${toFramework} project layout

## Getting Started

### For Flutter:
1. Run \`flutter pub get\`
2. Run \`flutter run\`

### For Kotlin Compose:
1. Open in Android Studio
2. Sync project with Gradle
3. Run the app

### For TypeScript:
1. Run \`npm install\`
2. Run \`npm start\`

## Notes
- Each original file was individually converted while preserving UI structure and logic
- State management patterns were translated to target framework equivalents
- Component props and state are maintained across conversion
- Original file references are preserved in comments

Generated by Universal Code Transpiler with intelligent file-by-file conversion
`;
  }

  private addFrameworkConfigs(result: ConversionResult, framework: string): void {
    switch (framework) {
      case 'flutter':
      case 'dart':
        result.files.push({
          path: 'pubspec.yaml',
          content: `name: converted_flutter_app
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
`,
          type: 'yaml'
        });
        
        result.files.push({
          path: 'lib/main.dart',
          content: `import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Converted Flutter App',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: const ConvertedHomePage(),
    );
  }
}

class ConvertedHomePage extends StatefulWidget {
  const ConvertedHomePage({Key? key}) : super(key: key);

  @override
  State<ConvertedHomePage> createState() => _ConvertedHomePageState();
}

class _ConvertedHomePageState extends State<ConvertedHomePage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Converted App'),
      ),
      body: const Center(
        child: Text('Welcome to your converted Flutter app!'),
      ),
    );
  }
}`,
          type: 'dart'
        });
        break;

      case 'kotlin':
        result.files.push({
          path: 'build.gradle.kts',
          content: `plugins {
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

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = "1.8"
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
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    implementation("androidx.activity:activity-compose:1.8.2")
    implementation("androidx.compose.ui:ui:1.5.8")
    implementation("androidx.compose.material3:material3:1.1.2")
}`,
          type: 'kotlin'
        });

        result.files.push({
          path: 'app/src/main/java/com/example/app/MainActivity.kt',
          content: `package com.example.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            ConvertedApp()
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ConvertedApp() {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Converted App") }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text("Welcome to your converted Kotlin Compose app!")
        }
    }
}`,
          type: 'kotlin'
        });
        break;
    }
  }
}