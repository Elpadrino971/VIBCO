import { Agent, AgentLog, AgentStatus, AgentType, Screenshot } from '@/types';
import { generateId } from '@/lib/utils';

export abstract class BaseAgent {
  protected agent: Agent;
  protected logs: AgentLog[] = [];
  protected screenshots: Screenshot[] = [];

  constructor(type: AgentType, name: string, description: string) {
    this.agent = {
      id: generateId(),
      type,
      name,
      description,
      status: 'idle',
      progress: 0,
      currentTask: null,
      logs: [],
      screenshots: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Méthode abstraite que chaque agent doit implémenter
  abstract execute(context: ExecutionContext): Promise<AgentResult>;

  // Logging
  protected log(level: AgentLog['level'], message: string, metadata?: Record<string, any>) {
    const log: AgentLog = {
      id: generateId(),
      agentId: this.agent.id,
      timestamp: new Date(),
      level,
      message,
      metadata,
    };
    this.logs.push(log);
    this.agent.logs.push(log);
    console.log(`[${this.agent.name}] ${level.toUpperCase()}: ${message}`);
  }

  protected info(message: string, metadata?: Record<string, any>) {
    this.log('info', message, metadata);
  }

  protected warning(message: string, metadata?: Record<string, any>) {
    this.log('warning', message, metadata);
  }

  protected error(message: string, metadata?: Record<string, any>) {
    this.log('error', message, metadata);
  }

  protected success(message: string, metadata?: Record<string, any>) {
    this.log('success', message, metadata);
  }

  // Status management
  protected updateStatus(status: AgentStatus, currentTask?: string) {
    this.agent.status = status;
    if (currentTask !== undefined) {
      this.agent.currentTask = currentTask;
    }
    this.agent.updatedAt = new Date();
  }

  protected updateProgress(progress: number) {
    this.agent.progress = Math.min(100, Math.max(0, progress));
    this.agent.updatedAt = new Date();
  }

  // Screenshot management
  protected addScreenshot(url: string, description: string, taskId: string) {
    const screenshot: Screenshot = {
      id: generateId(),
      agentId: this.agent.id,
      url,
      description,
      timestamp: new Date(),
      taskId,
    };
    this.screenshots.push(screenshot);
    this.agent.screenshots.push(screenshot);
  }

  // Getters
  public getAgent(): Agent {
    return { ...this.agent };
  }

  public getLogs(): AgentLog[] {
    return [...this.logs];
  }

  public getScreenshots(): Screenshot[] {
    return [...this.screenshots];
  }

  public getStatus(): AgentStatus {
    return this.agent.status;
  }

  public getProgress(): number {
    return this.agent.progress;
  }

  // Reset agent for new execution
  public reset() {
    this.agent.status = 'idle';
    this.agent.progress = 0;
    this.agent.currentTask = null;
    this.logs = [];
    this.screenshots = [];
    this.agent.logs = [];
    this.agent.screenshots = [];
    this.agent.updatedAt = new Date();
  }
}

export interface ExecutionContext {
  projectId: string;
  projectConfig: any;
  sharedData: Map<string, any>;
  aiClient: any; // OpenAI or Anthropic client
  githubClient: any;
  supabaseClient: any;
}

export interface AgentResult {
  success: boolean;
  output?: any;
  errors: string[];
  warnings: string[];
  files?: Array<{ path: string; content: string }>;
  nextSteps?: string[];
}
