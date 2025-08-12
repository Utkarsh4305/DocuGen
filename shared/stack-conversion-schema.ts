// Schema for tech stack conversion with line-by-line parsing
export interface TechStackConversionRequest {
  projectId: string;
  currentStack: TechStack;
  targetStack: TechStack;
  conversionOptions: ConversionOptions;
}

export interface TechStack {
  frontend?: FrameworkInfo;
  backend?: FrameworkInfo;
  database?: FrameworkInfo;
  mobile?: FrameworkInfo;
}

export interface FrameworkInfo {
  name: string;
  version?: string;
  language: string;
  features: string[];
}

export interface ConversionOptions {
  preserveStructure: boolean;
  maintainState: boolean;
  addTypeAnnotations: boolean;
  convertApiCalls: boolean;
  generateTests: boolean;
  preserveComments: boolean;
}

// Line-by-line parsing structure
export interface ParsedProjectStructure {
  ui: UIStructure;
  logic: LogicStructure;
  routes: RouteStructure;
  data: DataStructure;
  config: ConfigStructure;
}

export interface UIStructure {
  components: ComponentDefinition[];
  pages: PageDefinition[];
  layouts: LayoutDefinition[];
  styles: StyleDefinition[];
}

export interface ComponentDefinition {
  id: string;
  name: string;
  filePath: string;
  lineStart: number;
  lineEnd: number;
  type: 'functional' | 'class' | 'stateless';
  props: PropertyDefinition[];
  state: StateDefinition[];
  hooks: HookUsage[];
  imports: ImportDefinition[];
  exports: ExportDefinition[];
  events: EventHandler[];
  children: ComponentReference[];
  styling: StylingInfo;
  dependencies: string[];
}

export interface PageDefinition {
  id: string;
  name: string;
  filePath: string;
  route: string;
  lineStart: number;
  lineEnd: number;
  components: ComponentReference[];
  layout?: string;
  meta: PageMetadata;
  auth: AuthRequirement;
}

export interface LayoutDefinition {
  id: string;
  name: string;
  filePath: string;
  lineStart: number;
  lineEnd: number;
  components: ComponentReference[];
  slots: LayoutSlot[];
}

export interface StyleDefinition {
  id: string;
  filePath: string;
  type: 'css' | 'scss' | 'styled-components' | 'tailwind' | 'emotion';
  selectors: CSSSelector[];
  variables: CSSVariable[];
  themes: ThemeDefinition[];
}

export interface LogicStructure {
  services: ServiceDefinition[];
  utilities: UtilityDefinition[];
  stores: StoreDefinition[];
  middleware: MiddlewareDefinition[];
  validators: ValidatorDefinition[];
  constants: ConstantDefinition[];
}

export interface ServiceDefinition {
  id: string;
  name: string;
  filePath: string;
  lineStart: number;
  lineEnd: number;
  type: 'api' | 'business' | 'data' | 'utility';
  methods: MethodDefinition[];
  dependencies: string[];
  exports: ExportDefinition[];
}

export interface StoreDefinition {
  id: string;
  name: string;
  filePath: string;
  lineStart: number;
  lineEnd: number;
  type: 'redux' | 'context' | 'zustand' | 'valtio' | 'mobx';
  state: StateDefinition[];
  actions: ActionDefinition[];
  selectors: SelectorDefinition[];
  middleware: string[];
}

export interface RouteStructure {
  routes: RouteDefinition[];
  guards: GuardDefinition[];
  middleware: RouteMiddleware[];
  navigation: NavigationStructure;
}

export interface RouteDefinition {
  id: string;
  path: string;
  filePath: string;
  lineStart: number;
  lineEnd: number;
  component: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  guards: string[];
  middleware: string[];
  params: RouteParameter[];
  query: QueryParameter[];
  meta: RouteMetadata;
}

export interface DataStructure {
  models: ModelDefinition[];
  schemas: SchemaDefinition[];
  migrations: MigrationDefinition[];
  seeders: SeederDefinition[];
  queries: QueryDefinition[];
}

export interface ModelDefinition {
  id: string;
  name: string;
  filePath: string;
  lineStart: number;
  lineEnd: number;
  fields: FieldDefinition[];
  relations: RelationDefinition[];
  indexes: IndexDefinition[];
  validations: ValidationRule[];
}

export interface ConfigStructure {
  environment: EnvironmentConfig[];
  build: BuildConfig;
  deployment: DeploymentConfig;
  dependencies: DependencyInfo[];
}

// Supporting interfaces
export interface PropertyDefinition {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
  description?: string;
  lineNumber: number;
}

export interface StateDefinition {
  name: string;
  type: string;
  initialValue?: any;
  lineNumber: number;
  scope: 'local' | 'global' | 'shared';
}

export interface HookUsage {
  name: string;
  type: string;
  params: any[];
  lineNumber: number;
  dependencies: string[];
}

export interface ImportDefinition {
  module: string;
  imports: string[];
  isDefault: boolean;
  alias?: string;
  lineNumber: number;
}

export interface ExportDefinition {
  name: string;
  type: 'default' | 'named';
  lineNumber: number;
}

export interface EventHandler {
  name: string;
  type: string;
  params: string[];
  lineNumber: number;
  target?: string;
}

export interface ComponentReference {
  name: string;
  props: Record<string, any>;
  lineNumber: number;
}

export interface StylingInfo {
  type: 'inline' | 'css' | 'styled-components' | 'tailwind';
  classes: string[];
  styles: Record<string, any>;
  lineNumbers: number[];
}

export interface MethodDefinition {
  name: string;
  params: ParameterDefinition[];
  returnType: string;
  lineStart: number;
  lineEnd: number;
  isAsync: boolean;
  visibility: 'public' | 'private' | 'protected';
}

export interface ParameterDefinition {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
}

export interface ActionDefinition {
  name: string;
  type: 'sync' | 'async';
  params: ParameterDefinition[];
  lineNumber: number;
}

export interface SelectorDefinition {
  name: string;
  params: ParameterDefinition[];
  returnType: string;
  lineNumber: number;
}

export interface GuardDefinition {
  name: string;
  filePath: string;
  lineStart: number;
  lineEnd: number;
  conditions: string[];
}

export interface RouteMiddleware {
  name: string;
  filePath: string;
  lineStart: number;
  lineEnd: number;
  order: number;
}

export interface NavigationStructure {
  type: 'hash' | 'history' | 'memory';
  config: Record<string, any>;
}

export interface RouteParameter {
  name: string;
  type: string;
  required: boolean;
}

export interface QueryParameter {
  name: string;
  type: string;
  required: boolean;
}

export interface RouteMetadata {
  title?: string;
  description?: string;
  auth?: boolean;
  roles?: string[];
}

export interface FieldDefinition {
  name: string;
  type: string;
  nullable: boolean;
  unique: boolean;
  index: boolean;
  defaultValue?: any;
  lineNumber: number;
}

export interface RelationDefinition {
  name: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  target: string;
  foreignKey?: string;
  lineNumber: number;
}

export interface IndexDefinition {
  name: string;
  fields: string[];
  unique: boolean;
  lineNumber: number;
}

export interface ValidationRule {
  field: string;
  rules: string[];
  lineNumber: number;
}

export interface SchemaDefinition {
  name: string;
  filePath: string;
  fields: FieldDefinition[];
  validations: ValidationRule[];
  lineStart: number;
  lineEnd: number;
}

export interface MigrationDefinition {
  name: string;
  filePath: string;
  version: string;
  up: string[];
  down: string[];
  lineStart: number;
  lineEnd: number;
}

export interface SeederDefinition {
  name: string;
  filePath: string;
  data: Record<string, any>[];
  lineStart: number;
  lineEnd: number;
}

export interface QueryDefinition {
  name: string;
  filePath: string;
  sql: string;
  params: ParameterDefinition[];
  lineStart: number;
  lineEnd: number;
}

export interface EnvironmentConfig {
  name: string;
  variables: Record<string, string>;
  filePath: string;
}

export interface BuildConfig {
  bundler: string;
  entry: string[];
  output: string;
  plugins: string[];
  filePath: string;
}

export interface DeploymentConfig {
  platform: string;
  config: Record<string, any>;
  filePath: string;
}

export interface DependencyInfo {
  name: string;
  version: string;
  type: 'dependency' | 'devDependency' | 'peerDependency';
  required: boolean;
}

export interface CSSSelector {
  selector: string;
  properties: Record<string, any>;
  lineStart: number;
  lineEnd: number;
}

export interface CSSVariable {
  name: string;
  value: string;
  lineNumber: number;
}

export interface ThemeDefinition {
  name: string;
  variables: Record<string, string>;
  lineStart: number;
  lineEnd: number;
}

export interface UtilityDefinition {
  name: string;
  filePath: string;
  functions: MethodDefinition[];
  constants: ConstantDefinition[];
  lineStart: number;
  lineEnd: number;
}

export interface MiddlewareDefinition {
  name: string;
  filePath: string;
  type: string;
  config: Record<string, any>;
  lineStart: number;
  lineEnd: number;
}

export interface ValidatorDefinition {
  name: string;
  filePath: string;
  rules: ValidationRule[];
  lineStart: number;
  lineEnd: number;
}

export interface ConstantDefinition {
  name: string;
  value: any;
  type: string;
  lineNumber: number;
}

export interface PageMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
  og?: Record<string, string>;
}

export interface AuthRequirement {
  required: boolean;
  roles?: string[];
  permissions?: string[];
}

export interface LayoutSlot {
  name: string;
  type: string;
  required: boolean;
}

// Conversion result with line mappings
export interface TechStackConversionResult {
  success: boolean;
  convertedProject: ParsedProjectStructure;
  files: ConvertedFile[];
  lineMappings: LineMapping[];
  errors: ConversionError[];
  warnings: ConversionWarning[];
  summary: ConversionSummary;
}

export interface ConvertedFile {
  originalPath: string;
  newPath: string;
  content: string;
  type: string;
  language: string;
  lineCount: number;
}

export interface LineMapping {
  originalFile: string;
  originalLine: number;
  newFile: string;
  newLine: number;
  type: 'direct' | 'transformed' | 'generated';
}

export interface ConversionError {
  file: string;
  line: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  originalCode: string;
}

export interface ConversionWarning {
  file: string;
  line: number;
  message: string;
  suggestion?: string;
}

export interface ConversionSummary {
  totalFiles: number;
  convertedFiles: number;
  skippedFiles: number;
  generatedFiles: number;
  totalLines: number;
  convertedLines: number;
  generatedLines: number;
  conversionTime: number;
  frameworks: {
    from: TechStack;
    to: TechStack;
  };
}