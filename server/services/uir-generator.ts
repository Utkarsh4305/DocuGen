import { ASTNode, ASTComponent, ASTFunction } from './ast-parser';

export interface UIRNode {
  type: 'component' | 'function' | 'element' | 'text' | 'stylesheet';
  name: string;
  framework: string;
  metadata: {
    originalFile: string;
    originalFramework: string;
    dependencies: string[];
    exports: string[];
  };
  structure?: {
    props?: Record<string, UIRProp>;
    state?: Record<string, UIRState>;
    hooks?: string[];
    children?: UIRNode[];
    styles?: Record<string, any>;
  };
  implementation?: {
    code: string;
    language: string;
  };
}

export interface UIRProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
}

export interface UIRState {
  name: string;
  type: string;
  initialValue: any;
  setter: string;
}

export class UIRGenerator {
  generateUIR(astNode: ASTNode, originalFile: string, framework: string): UIRNode[] {
    const uirNodes: UIRNode[] = [];

    // Process components
    if (astNode.components) {
      astNode.components.forEach(component => {
        const uirNode = this.convertComponentToUIR(component, originalFile, framework);
        uirNodes.push(uirNode);
      });
    }

    // Process functions
    if (astNode.functions) {
      astNode.functions.forEach(func => {
        const uirNode = this.convertFunctionToUIR(func, originalFile, framework);
        uirNodes.push(uirNode);
      });
    }

    // Process stylesheets
    if (astNode.type === 'Stylesheet') {
      const uirNode = this.convertStylesheetToUIR(astNode, originalFile, framework);
      uirNodes.push(uirNode);
    }

    return uirNodes;
  }

  private convertComponentToUIR(component: ASTComponent, originalFile: string, framework: string): UIRNode {
    return {
      type: 'component',
      name: component.name,
      framework,
      metadata: {
        originalFile,
        originalFramework: framework,
        dependencies: [], // Will be populated by analyzing imports
        exports: component.isDefault ? ['default'] : [component.name],
      },
      structure: {
        props: this.convertPropsToUIR(component.props),
        state: this.convertStateToUIR(component.state),
        hooks: component.hooks,
        children: this.convertJSXToUIR(component.jsx),
      },
    };
  }

  private convertFunctionToUIR(func: ASTFunction, originalFile: string, framework: string): UIRNode {
    return {
      type: 'function',
      name: func.name,
      framework,
      metadata: {
        originalFile,
        originalFramework: framework,
        dependencies: [],
        exports: func.isExported ? [func.name] : [],
      },
      implementation: {
        code: func.body,
        language: 'javascript',
      },
    };
  }

  private convertStylesheetToUIR(astNode: ASTNode, originalFile: string, framework: string): UIRNode {
    return {
      type: 'stylesheet',
      name: astNode.name || 'styles',
      framework,
      metadata: {
        originalFile,
        originalFramework: framework,
        dependencies: [],
        exports: [],
      },
      structure: {
        styles: astNode.styles,
      },
    };
  }

  private convertPropsToUIR(props: string[]): Record<string, UIRProp> {
    const uirProps: Record<string, UIRProp> = {};
    
    props.forEach(propName => {
      uirProps[propName] = {
        name: propName,
        type: 'any', // Type inference would be more complex
        required: true,
      };
    });

    return uirProps;
  }

  private convertStateToUIR(state: Record<string, string>): Record<string, UIRState> {
    const uirState: Record<string, UIRState> = {};
    
    Object.entries(state).forEach(([stateName, initialValue]) => {
      uirState[stateName] = {
        name: stateName,
        type: this.inferTypeFromValue(initialValue),
        initialValue,
        setter: `set${stateName.charAt(0).toUpperCase() + stateName.slice(1)}`,
      };
    });

    return uirState;
  }

  private convertJSXToUIR(jsx: ASTNode): UIRNode[] {
    const children: UIRNode[] = [];

    if (jsx.type === 'Element') {
      children.push({
        type: 'element',
        name: jsx.name || 'div',
        framework: 'universal',
        metadata: {
          originalFile: '',
          originalFramework: 'jsx',
          dependencies: [],
          exports: [],
        },
        structure: {
          props: this.convertJSXPropsToUIR(jsx.props),
          children: jsx.children ? jsx.children.flatMap(child => this.convertJSXToUIR(child)) : [],
        },
      });
    } else if (jsx.type === 'Text') {
      children.push({
        type: 'text',
        name: jsx.name || '',
        framework: 'universal',
        metadata: {
          originalFile: '',
          originalFramework: 'jsx',
          dependencies: [],
          exports: [],
        },
      });
    } else if (jsx.type === 'Fragment' && jsx.children) {
      jsx.children.forEach(child => {
        children.push(...this.convertJSXToUIR(child));
      });
    }

    return children;
  }

  private convertJSXPropsToUIR(props?: Record<string, any>): Record<string, UIRProp> {
    const uirProps: Record<string, UIRProp> = {};
    
    if (props) {
      Object.entries(props).forEach(([propName, propValue]) => {
        uirProps[propName] = {
          name: propName,
          type: typeof propValue === 'string' ? 'string' : 'expression',
          required: false,
          defaultValue: propValue,
        };
      });
    }

    return uirProps;
  }

  private inferTypeFromValue(value: string): string {
    if (value.startsWith("'") && value.endsWith("'")) return 'string';
    if (value === 'true' || value === 'false') return 'boolean';
    if (!isNaN(Number(value))) return 'number';
    if (value.startsWith('[') && value.endsWith(']')) return 'array';
    if (value.startsWith('{') && value.endsWith('}')) return 'object';
    return 'any';
  }
}