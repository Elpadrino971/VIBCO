import { createClient } from '@supabase/supabase-js';
import type { ProjectConfig, AgentResult, AgentType } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client Supabase avec service role (pour server-side)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  type: 'web' | 'mobile' | 'game' | 'fullstack';
  status: 'draft' | 'generating' | 'generated' | 'deployed' | 'failed';
  config: ProjectConfig;
  generated_files: Array<{
    path: string;
    content: string;
    agentType: AgentType;
  }>;
  created_at: string;
  updated_at: string;
  generated_at: string | null;
  deployed_at: string | null;
  metadata: Record<string, any>;
}

export interface AgentExecution {
  id: string;
  project_id: string;
  agent_type: AgentType;
  status: 'pending' | 'running' | 'completed' | 'failed';
  logs: Array<{
    level: 'info' | 'success' | 'warning' | 'error';
    message: string;
    timestamp: string;
    metadata?: Record<string, any>;
  }>;
  screenshots: string[];
  result: AgentResult | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  duration_ms: number | null;
  created_at: string;
}

/**
 * Service de gestion des projets
 */
export class ProjectsService {
  /**
   * Créer un nouveau projet
   */
  static async create(
    userId: string,
    data: {
      name: string;
      description?: string;
      type: Project['type'];
      config: ProjectConfig;
    }
  ): Promise<Project> {
    const { data: project, error } = await supabase
      .from('projects')
      .insert([
        {
          user_id: userId,
          name: data.name,
          description: data.description || null,
          type: data.type,
          status: 'draft',
          config: data.config,
          generated_files: [],
          metadata: {},
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      throw new Error(`Failed to create project: ${error.message}`);
    }

    return project;
  }

  /**
   * Récupérer un projet par ID
   */
  static async getById(projectId: string, userId?: string): Promise<Project | null> {
    let query = supabase.from('projects').select('*').eq('id', projectId);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: project, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Project not found
      }
      console.error('Error fetching project:', error);
      throw new Error(`Failed to fetch project: ${error.message}`);
    }

    return project;
  }

  /**
   * Lister les projets d'un utilisateur
   */
  static async listByUser(
    userId: string,
    options: {
      status?: Project['status'];
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ projects: Project[]; total: number }> {
    let query = supabase.from('projects').select('*', { count: 'exact' }).eq('user_id', userId);

    if (options.status) {
      query = query.eq('status', options.status);
    }

    query = query.order('created_at', { ascending: false });

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data: projects, error, count } = await query;

    if (error) {
      console.error('Error listing projects:', error);
      throw new Error(`Failed to list projects: ${error.message}`);
    }

    return {
      projects: projects || [],
      total: count || 0,
    };
  }

  /**
   * Mettre à jour un projet
   */
  static async update(
    projectId: string,
    userId: string,
    updates: Partial<Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<Project> {
    const { data: project, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      throw new Error(`Failed to update project: ${error.message}`);
    }

    return project;
  }

  /**
   * Mettre à jour le statut d'un projet
   */
  static async updateStatus(
    projectId: string,
    status: Project['status'],
    userId?: string
  ): Promise<void> {
    let query = supabase.from('projects').update({ status }).eq('id', projectId);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { error } = await query;

    if (error) {
      console.error('Error updating project status:', error);
      throw new Error(`Failed to update project status: ${error.message}`);
    }
  }

  /**
   * Ajouter des fichiers générés
   */
  static async addGeneratedFiles(
    projectId: string,
    files: Array<{
      path: string;
      content: string;
      agentType: AgentType;
    }>,
    userId?: string
  ): Promise<void> {
    // Récupérer les fichiers existants
    const project = await this.getById(projectId, userId);
    if (!project) {
      throw new Error('Project not found');
    }

    const existingFiles = project.generated_files || [];
    const updatedFiles = [...existingFiles, ...files];

    const { error } = await supabase
      .from('projects')
      .update({
        generated_files: updatedFiles,
      })
      .eq('id', projectId);

    if (error) {
      console.error('Error adding generated files:', error);
      throw new Error(`Failed to add generated files: ${error.message}`);
    }
  }

  /**
   * Supprimer un projet
   */
  static async delete(projectId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting project:', error);
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  }

  /**
   * Marquer le projet comme généré
   */
  static async markAsGenerated(projectId: string, userId?: string): Promise<void> {
    let query = supabase
      .from('projects')
      .update({
        status: 'generated',
        generated_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { error } = await query;

    if (error) {
      console.error('Error marking project as generated:', error);
      throw new Error(`Failed to mark project as generated: ${error.message}`);
    }
  }

  /**
   * Marquer le projet comme déployé
   */
  static async markAsDeployed(projectId: string, userId?: string): Promise<void> {
    let query = supabase
      .from('projects')
      .update({
        status: 'deployed',
        deployed_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { error } = await query;

    if (error) {
      console.error('Error marking project as deployed:', error);
      throw new Error(`Failed to mark project as deployed: ${error.message}`);
    }
  }
}

/**
 * Service de gestion des exécutions d'agents
 */
export class AgentExecutionsService {
  /**
   * Créer une nouvelle exécution d'agent
   */
  static async create(
    projectId: string,
    agentType: AgentType
  ): Promise<AgentExecution> {
    const { data: execution, error } = await supabase
      .from('agent_executions')
      .insert([
        {
          project_id: projectId,
          agent_type: agentType,
          status: 'pending',
          logs: [],
          screenshots: [],
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating agent execution:', error);
      throw new Error(`Failed to create agent execution: ${error.message}`);
    }

    return execution;
  }

  /**
   * Démarrer une exécution
   */
  static async start(executionId: string): Promise<void> {
    const { error } = await supabase
      .from('agent_executions')
      .update({
        status: 'running',
        started_at: new Date().toISOString(),
      })
      .eq('id', executionId);

    if (error) {
      console.error('Error starting agent execution:', error);
      throw new Error(`Failed to start agent execution: ${error.message}`);
    }
  }

  /**
   * Ajouter un log
   */
  static async addLog(
    executionId: string,
    log: {
      level: 'info' | 'success' | 'warning' | 'error';
      message: string;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    // Récupérer les logs existants
    const { data: execution } = await supabase
      .from('agent_executions')
      .select('logs')
      .eq('id', executionId)
      .single();

    if (!execution) {
      throw new Error('Execution not found');
    }

    const logs = execution.logs || [];
    logs.push({
      ...log,
      timestamp: new Date().toISOString(),
    });

    const { error } = await supabase
      .from('agent_executions')
      .update({ logs })
      .eq('id', executionId);

    if (error) {
      console.error('Error adding log:', error);
      throw new Error(`Failed to add log: ${error.message}`);
    }
  }

  /**
   * Ajouter un screenshot
   */
  static async addScreenshot(executionId: string, screenshotUrl: string): Promise<void> {
    // Récupérer les screenshots existants
    const { data: execution } = await supabase
      .from('agent_executions')
      .select('screenshots')
      .eq('id', executionId)
      .single();

    if (!execution) {
      throw new Error('Execution not found');
    }

    const screenshots = execution.screenshots || [];
    screenshots.push(screenshotUrl);

    const { error } = await supabase
      .from('agent_executions')
      .update({ screenshots })
      .eq('id', executionId);

    if (error) {
      console.error('Error adding screenshot:', error);
      throw new Error(`Failed to add screenshot: ${error.message}`);
    }
  }

  /**
   * Terminer avec succès
   */
  static async complete(executionId: string, result: AgentResult): Promise<void> {
    const { data: execution } = await supabase
      .from('agent_executions')
      .select('started_at')
      .eq('id', executionId)
      .single();

    if (!execution) {
      throw new Error('Execution not found');
    }

    const startedAt = execution.started_at ? new Date(execution.started_at).getTime() : Date.now();
    const completedAt = Date.now();
    const durationMs = completedAt - startedAt;

    const { error } = await supabase
      .from('agent_executions')
      .update({
        status: 'completed',
        result,
        completed_at: new Date().toISOString(),
        duration_ms: durationMs,
      })
      .eq('id', executionId);

    if (error) {
      console.error('Error completing agent execution:', error);
      throw new Error(`Failed to complete agent execution: ${error.message}`);
    }
  }

  /**
   * Terminer avec erreur
   */
  static async fail(executionId: string, errorMessage: string): Promise<void> {
    const { data: execution } = await supabase
      .from('agent_executions')
      .select('started_at')
      .eq('id', executionId)
      .single();

    if (!execution) {
      throw new Error('Execution not found');
    }

    const startedAt = execution.started_at ? new Date(execution.started_at).getTime() : Date.now();
    const completedAt = Date.now();
    const durationMs = completedAt - startedAt;

    const { error } = await supabase
      .from('agent_executions')
      .update({
        status: 'failed',
        error_message: errorMessage,
        completed_at: new Date().toISOString(),
        duration_ms: durationMs,
      })
      .eq('id', executionId);

    if (error) {
      console.error('Error failing agent execution:', error);
      throw new Error(`Failed to fail agent execution: ${error.message}`);
    }
  }

  /**
   * Lister les exécutions d'un projet
   */
  static async listByProject(projectId: string): Promise<AgentExecution[]> {
    const { data: executions, error } = await supabase
      .from('agent_executions')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error listing agent executions:', error);
      throw new Error(`Failed to list agent executions: ${error.message}`);
    }

    return executions || [];
  }

  /**
   * Récupérer une exécution par ID
   */
  static async getById(executionId: string): Promise<AgentExecution | null> {
    const { data: execution, error } = await supabase
      .from('agent_executions')
      .select('*')
      .eq('id', executionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching agent execution:', error);
      throw new Error(`Failed to fetch agent execution: ${error.message}`);
    }

    return execution;
  }
}
