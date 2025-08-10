import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as types from '@babel/types';

export interface ASTNode {
  type: string;
  name?: string;
  props?: Record<string, any>;
  children?: ASTNode[];
  imports?: string[];
  exports?: string[];
  functions?: ASTFunction[];
  components?: ASTComponent[];
  styles?: Record<string, any>;
  hooks?: string[];
}

export interface ASTFunction {
  name: string;
  params: string[];
  returnType?: string;
  body: string;
  isAsync?: boolean;
  isExported?: boolean;
}

export interface ASTComponent {
  name: string;
  props: string[];
  state: Record<string, string>;
  hooks: string[];
  jsx: ASTNode;
  isDefault?: boolean;
}

export class ASTParser {
  parseJavaScript(code: string, filePath: string): ASTNode {
    try {
      const ast = parser.parse(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript', 'decorators-legacy'],
        allowImportExportEverywhere: true,
        allowReturnOutsideFunction: true,
      });

      const result: ASTNode = {
        type: 'Program',
        imports: [],
        exports: [],
        functions: [],
        components: [],
        children: [],
      };

      traverse.default(ast, {
        ImportDeclaration(path) {
          const source = path.node.source.value;
          result.imports = result.imports || [];
          
          if (path.node.specifiers.length > 0) {
            path.node.specifiers.forEach(spec => {
              if (types.isImportDefaultSpecifier(spec)) {
                result.imports?.push(`import ${spec.local.name} from '${source}'`);
              } else if (types.isImportSpecifier(spec)) {
                const imported = types.isIdentifier(spec.imported) ? spec.imported.name : spec.imported.value;
                result.imports?.push(`import { ${imported} } from '${source}'`);
              }
            });
          } else {
            result.imports?.push(`import '${source}'`);
          }
        },

        ExportDefaultDeclaration(path) {
          if (types.isFunctionDeclaration(path.node.declaration)) {
            const func = path.node.declaration;
            if (func.id) {
              result.exports?.push(func.id.name);
            }
          } else if (types.isIdentifier(path.node.declaration)) {
            result.exports?.push(path.node.declaration.name);
          }
        },

        ExportNamedDeclaration(path) {
          if (path.node.specifiers) {
            path.node.specifiers.forEach(spec => {
              if (types.isExportSpecifier(spec)) {
                const exported = types.isIdentifier(spec.exported) ? spec.exported.name : spec.exported.value;
                result.exports?.push(exported);
              }
            });
          }
        },

        FunctionDeclaration(path) {
          const func = path.node;
          if (func.id) {
            const astFunc: ASTFunction = {
              name: func.id.name,
              params: func.params.map((param: any) => 
                types.isIdentifier(param) ? param.name : 'param'
              ),
              body: code.slice(func.body.start || 0, func.body.end || 0),
              isAsync: func.async,
              isExported: path.parent.type === 'ExportNamedDeclaration' || path.parent.type === 'ExportDefaultDeclaration',
            };
            result.functions?.push(astFunc);
          }
        },

        // React Component Detection
        VariableDeclaration(path) {
          path.node.declarations.forEach(declaration => {
            if (types.isVariableDeclarator(declaration) && 
                types.isIdentifier(declaration.id) &&
                types.isArrowFunctionExpression(declaration.init)) {
              
              const name = declaration.id.name;
              // Check if it's a React component (starts with capital letter)
              if (name.charAt(0) === name.charAt(0).toUpperCase()) {
                const component: ASTComponent = {
                  name,
                  props: this.extractProps(declaration.init),
                  state: this.extractState(declaration.init),
                  hooks: this.extractHooks(declaration.init),
                  jsx: this.extractJSX(declaration.init),
                  isDefault: path.parent.type === 'ExportDefaultDeclaration',
                };
                result.components?.push(component);
              }
            }
          });
        },
      });

      return result;
    } catch (error) {
      console.error(`Error parsing ${filePath}:`, error);
      return {
        type: 'Error',
        name: `Failed to parse ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  private extractProps(func: any): string[] {
    const props: string[] = [];
    if (func.params && func.params.length > 0) {
      const param = func.params[0];
      if (types.isObjectPattern(param)) {
        param.properties.forEach((prop: any) => {
          if (types.isObjectProperty(prop) && types.isIdentifier(prop.key)) {
            props.push(prop.key.name);
          }
        });
      } else if (types.isIdentifier(param)) {
        props.push(param.name);
      }
    }
    return props;
  }

  private extractState(func: any): Record<string, string> {
    const state: Record<string, string> = {};
    
    try {
      traverse.default(func, {
        CallExpression(path: any) {
          if (types.isIdentifier(path.node.callee) && path.node.callee.name === 'useState') {
            const parent = path.parent;
            if (types.isVariableDeclarator(parent) && 
                types.isArrayPattern(parent.id) &&
                parent.id.elements.length >= 2) {
              
              const stateVar = parent.id.elements[0];
              const setterVar = parent.id.elements[1];
              
              if (types.isIdentifier(stateVar) && types.isIdentifier(setterVar)) {
                const defaultValue = path.node.arguments[0];
                let defaultValueStr = 'undefined';
                
                if (types.isStringLiteral(defaultValue)) {
                  defaultValueStr = `'${defaultValue.value}'`;
                } else if (types.isNumericLiteral(defaultValue)) {
                  defaultValueStr = defaultValue.value.toString();
                } else if (types.isBooleanLiteral(defaultValue)) {
                  defaultValueStr = defaultValue.value.toString();
                }
                
                state[stateVar.name] = defaultValueStr;
              }
            }
          }
        }
      });
    } catch (error) {
      console.warn('Error extracting state:', error);
    }
    
    return state;
  }

  private extractHooks(func: any): string[] {
    const hooks: string[] = [];
    
    try {
      traverse.default(func, {
        CallExpression(path: any) {
          if (types.isIdentifier(path.node.callee)) {
            const name = path.node.callee.name;
            if (name.startsWith('use') && name.length > 3) {
              hooks.push(name);
            }
          }
        }
      });
    } catch (error) {
      console.warn('Error extracting hooks:', error);
    }
    
    return [...new Set(hooks)]; // Remove duplicates
  }

  private extractJSX(func: any): ASTNode {
    let jsxElement: ASTNode = { type: 'Fragment', children: [] };
    
    try {
      traverse.default(func, {
        JSXElement(path: any) {
          jsxElement = this.parseJSXElement(path.node);
        },
        JSXFragment(path: any) {
          jsxElement = this.parseJSXFragment(path.node);
        }
      });
    } catch (error) {
      console.warn('Error extracting JSX:', error);
    }
    
    return jsxElement;
  }

  private parseJSXElement(element: any): ASTNode {
    const node: ASTNode = {
      type: 'Element',
      name: '',
      props: {},
      children: [],
    };
    
    if (types.isJSXIdentifier(element.openingElement.tagName)) {
      node.name = element.openingElement.tagName.name;
    }
    
    // Extract props
    element.openingElement.attributes?.forEach((attr: any) => {
      if (types.isJSXAttribute(attr) && types.isJSXIdentifier(attr.name)) {
        const propName = attr.name.name;
        let propValue = true; // Default for boolean props
        
        if (attr.value) {
          if (types.isStringLiteral(attr.value)) {
            propValue = attr.value.value;
          } else if (types.isJSXExpressionContainer(attr.value)) {
            // For expressions, we'll store the raw expression
            propValue = `{${attr.value.expression?.type || 'expression'}}`;
          }
        }
        
        node.props = node.props || {};
        node.props[propName] = propValue;
      }
    });
    
    // Extract children
    element.children?.forEach((child: any) => {
      if (types.isJSXElement(child)) {
        node.children?.push(this.parseJSXElement(child));
      } else if (types.isJSXText(child) && child.value.trim()) {
        node.children?.push({
          type: 'Text',
          name: child.value.trim(),
        });
      } else if (types.isJSXExpressionContainer(child)) {
        node.children?.push({
          type: 'Expression',
          name: child.expression?.type || 'expression',
        });
      }
    });
    
    return node;
  }

  private parseJSXFragment(fragment: any): ASTNode {
    const node: ASTNode = {
      type: 'Fragment',
      children: [],
    };
    
    fragment.children?.forEach((child: any) => {
      if (types.isJSXElement(child)) {
        node.children?.push(this.parseJSXElement(child));
      } else if (types.isJSXText(child) && child.value.trim()) {
        node.children?.push({
          type: 'Text',
          name: child.value.trim(),
        });
      }
    });
    
    return node;
  }

  // Parse CSS files
  parseCSS(code: string, filePath: string): ASTNode {
    // Simple CSS parsing - extract classes and basic properties
    const classes: Record<string, Record<string, string>> = {};
    
    // Basic CSS class extraction using regex
    const classMatches = code.match(/\.([a-zA-Z_-][a-zA-Z0-9_-]*)\s*\{([^}]*)\}/g);
    
    if (classMatches) {
      classMatches.forEach(match => {
        const classMatch = match.match(/\.([a-zA-Z_-][a-zA-Z0-9_-]*)\s*\{([^}]*)\}/);
        if (classMatch) {
          const className = classMatch[1];
          const properties = classMatch[2];
          
          const props: Record<string, string> = {};
          const propMatches = properties.match(/([a-zA-Z-]+)\s*:\s*([^;]+)/g);
          
          if (propMatches) {
            propMatches.forEach(propMatch => {
              const [property, value] = propMatch.split(':').map(s => s.trim());
              props[property] = value;
            });
          }
          
          classes[className] = props;
        }
      });
    }
    
    return {
      type: 'Stylesheet',
      name: filePath,
      styles: classes,
    };
  }
}