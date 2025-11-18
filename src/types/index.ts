// Types principaux de la plateforme VibeCoding

export type ProjectType = 'website' | 'mobile-app' | 'game' | 'web-app' | 'custom';

export type ProgrammingLanguage =
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'go'
  | 'rust'
  | 'java'
  | 'csharp'
  | 'php'
  | 'ruby';

export type Framework =
  | 'next.js'
  | 'react'
  | 'vue'
  | 'angular'
  | 'svelte'
  | 'react-native'
  | 'flutter'
  | 'unity'
  | 'phaser'
  | 'three.js'
  | 'express'
  | 'nestjs'
  | 'fastapi'
  | 'django';

export type AgentType =
  | 'project-manager'
  | 'frontend'
  | 'backend'
  | 'database'
  | 'mobile'
  | 'game'
  | 'workflow'
  | 'seo'
  | 'testing'
  | 'security'
  | 'devops';

export type AgentStatus = 'idle' | 'thinking' | 'working' | 'completed' | 'error';

export interface Agent {
  id: string;
  type: AgentType;
  name: string;
  description: string;
  status: AgentStatus;
  progress: number;
  currentTask: string | null;
  logs: AgentLog[];
  screenshots: Screenshot[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentLog {
  id: string;
  agentId: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  metadata?: Record<string, any>;
}

export interface Screenshot {
  id: string;
  agentId: string;
  url: string;
  description: string;
  timestamp: Date;
  taskId: string;
}

export interface ProjectConfig {
  id: string;
  userId: string;
  name: string;
  description: string;
  type: ProjectType;
  language: ProgrammingLanguage;
  framework: Framework;

  // Intégrations obligatoires
  githubRepo: string;
  githubToken: string;
  supabaseUrl: string;
  supabaseKey: string;

  // Intégrations optionnelles
  stripeEnabled: boolean;
  stripePublishableKey?: string;
  stripeSecretKey?: string;

  // Questionnaire responses
  questionnaire: QuestionnaireResponse;

  // Configuration des agents
  enabledAgents: AgentType[];
  agentConfigs: Record<AgentType, AgentConfig>;

  status: 'draft' | 'generating' | 'testing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentConfig {
  enabled: boolean;
  priority: number;
  customInstructions?: string;
}

export interface QuestionnaireResponse {
  // Questions générales
  targetAudience: string;
  mainFeatures: string[];
  designPreferences: string;
  colorScheme: string;

  // Questions techniques
  needsAuth: boolean;
  needsPayment: boolean;
  needsDatabase: boolean;
  needsRealtime: boolean;
  needsFileUpload: boolean;

  // Questions spécifiques au type
  specificRequirements: Record<string, any>;

  // SEO
  seoKeywords: string[];
  targetRegions: string[];

  // Performance
  expectedTraffic: 'low' | 'medium' | 'high' | 'very-high';
  performancePriority: 'speed' | 'quality' | 'balanced';
}

export interface GenerationTask {
  id: string;
  projectId: string;
  type: 'component' | 'page' | 'api' | 'test' | 'deployment';
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  assignedAgent: AgentType;
  description: string;
  output?: GenerationOutput;
  errors: string[];
  createdAt: Date;
  completedAt?: Date;
}

export interface GenerationOutput {
  files: GeneratedFile[];
  dependencies: string[];
  instructions: string;
  warnings: string[];
}

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
  description: string;
}

export interface TestResult {
  id: string;
  projectId: string;
  taskId: string;
  agentId: string;
  type: 'unit' | 'integration' | 'e2e' | 'performance' | 'security';
  status: 'passed' | 'failed' | 'warning';
  summary: string;
  details: TestDetail[];
  screenshots: Screenshot[];
  duration: number;
  timestamp: Date;
}

export interface TestDetail {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  message?: string;
  stackTrace?: string;
  screenshot?: string;
}

export interface DeploymentConfig {
  platform: 'vercel' | 'netlify' | 'aws' | 'gcp' | 'azure' | 'custom';
  environment: 'development' | 'staging' | 'production';
  domain?: string;
  envVars: Record<string, string>;
}

export interface Project {
  id: string;
  config: ProjectConfig;
  agents: Agent[];
  tasks: GenerationTask[];
  testResults: TestResult[];
  generatedFiles: GeneratedFile[];
  deploymentInfo?: DeploymentConfig;
  metadata: {
    totalFiles: number;
    linesOfCode: number;
    estimatedTime: number;
    actualTime: number;
  };
}

// Validation schemas will be in a separate file using Zod
