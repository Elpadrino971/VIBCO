import { Agent, AgentType, ProjectConfig } from '@/types';
import { BaseAgent, ExecutionContext } from './base-agent';
import {
  ProjectManagerAgent,
  FrontendAgent,
  BackendAgent,
  DatabaseAgent,
  MobileAgent,
  GameAgent,
  SEOAgent,
  TestingAgent,
  SecurityAgent,
  DevOpsAgent,
} from './index';

export class AgentOrchestrator {
  private agents: Map<AgentType, BaseAgent> = new Map();
  private executionOrder: AgentType[] = [];

  constructor() {
    // Initialiser tous les agents
    this.agents.set('project-manager', new ProjectManagerAgent());
    this.agents.set('database', new DatabaseAgent());
    this.agents.set('backend', new BackendAgent());
    this.agents.set('frontend', new FrontendAgent());
    this.agents.set('mobile', new MobileAgent());
    this.agents.set('game', new GameAgent());
    this.agents.set('seo', new SEOAgent());
    this.agents.set('security', new SecurityAgent());
    this.agents.set('testing', new TestingAgent());
    this.agents.set('devops', new DevOpsAgent());
  }

  async executeProject(projectConfig: ProjectConfig, context: ExecutionContext) {
    console.log('🚀 Démarrage de l\'orchestration des agents');

    // 1. Déterminer l'ordre d'exécution
    this.executionOrder = this.determineExecutionOrder(projectConfig);

    // 2. Exécuter les agents séquentiellement
    const results = [];
    const sharedData = new Map<string, any>();

    for (const agentType of this.executionOrder) {
      const agent = this.agents.get(agentType);
      if (!agent) continue;

      console.log(`\n📌 Exécution de l'agent: ${agent.getAgent().name}`);

      const agentContext: ExecutionContext = {
        ...context,
        sharedData,
      };

      try {
        const result = await agent.execute(agentContext);
        results.push({
          agentType,
          agent: agent.getAgent(),
          result,
        });

        // Partager les données entre agents
        if (result.output) {
          sharedData.set(agentType, result.output);
        }

        // Si un agent échoue de manière critique, arrêter
        if (!result.success && this.isCriticalAgent(agentType)) {
          console.error(`❌ Agent critique ${agentType} a échoué. Arrêt.`);
          break;
        }
      } catch (error: any) {
        console.error(`❌ Erreur agent ${agentType}:`, error.message);
        results.push({
          agentType,
          agent: agent.getAgent(),
          result: {
            success: false,
            errors: [error.message],
            warnings: [],
          },
        });

        if (this.isCriticalAgent(agentType)) {
          break;
        }
      }
    }

    return {
      success: results.every((r) => r.result.success),
      results,
      totalAgents: this.executionOrder.length,
      completedAgents: results.length,
    };
  }

  private determineExecutionOrder(config: ProjectConfig): AgentType[] {
    const order: AgentType[] = ['project-manager'];

    // Toujours inclure database et backend si nécessaire
    if (config.questionnaire.needsDatabase) {
      order.push('database');
    }

    order.push('backend');

    // Frontend basé sur le type
    if (config.type === 'website' || config.type === 'web-app') {
      order.push('frontend');
    }

    if (config.type === 'mobile-app') {
      order.push('mobile');
    }

    if (config.type === 'game') {
      order.push('game');
    }

    // Optimisations
    order.push('seo');
    order.push('security');

    // Tests et déploiement en dernier
    order.push('testing');
    order.push('devops');

    // Filtrer par agents activés
    return order.filter((agentType) => config.enabledAgents.includes(agentType));
  }

  private isCriticalAgent(agentType: AgentType): boolean {
    return ['project-manager', 'database', 'backend'].includes(agentType);
  }

  getAgent(type: AgentType): BaseAgent | undefined {
    return this.agents.get(type);
  }

  getAllAgents(): Agent[] {
    return Array.from(this.agents.values()).map((agent) => agent.getAgent());
  }

  resetAllAgents() {
    this.agents.forEach((agent) => agent.reset());
  }
}
