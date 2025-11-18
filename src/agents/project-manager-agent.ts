import { BaseAgent, ExecutionContext, AgentResult } from './base-agent';

export class ProjectManagerAgent extends BaseAgent {
  constructor() {
    super(
      'project-manager',
      'Chef de Projet IA',
      'Analyse le projet, crée la roadmap et coordonne les autres agents'
    );
  }

  async execute(context: ExecutionContext): Promise<AgentResult> {
    try {
      this.updateStatus('thinking', 'Analyse du projet...');
      this.info('Démarrage de l\'analyse du projet');
      this.updateProgress(10);

      const { projectConfig } = context;

      // Analyse du type de projet
      this.updateStatus('working', 'Détermination de l\'architecture...');
      const architecture = await this.determineArchitecture(projectConfig, context);
      this.updateProgress(30);

      // Création de la roadmap
      this.updateStatus('working', 'Création de la roadmap...');
      const roadmap = await this.createRoadmap(projectConfig, architecture, context);
      this.updateProgress(60);

      // Assignation des tâches aux agents
      this.updateStatus('working', 'Assignation des tâches...');
      const taskAssignments = await this.assignTasks(roadmap, projectConfig, context);
      this.updateProgress(90);

      // Estimation du temps et des ressources
      const estimates = this.estimateResources(roadmap, projectConfig);

      this.updateStatus('completed', 'Analyse terminée');
      this.updateProgress(100);
      this.success('Projet analysé avec succès');

      return {
        success: true,
        output: {
          architecture,
          roadmap,
          taskAssignments,
          estimates,
        },
        errors: [],
        warnings: [],
        nextSteps: [
          'Les agents spécialisés vont maintenant commencer leur travail',
          'Suivez la progression dans le dashboard',
        ],
      };
    } catch (error: any) {
      this.error('Erreur lors de l\'analyse du projet', { error: error.message });
      this.updateStatus('error');

      return {
        success: false,
        errors: [error.message],
        warnings: [],
      };
    }
  }

  private async determineArchitecture(config: any, context: ExecutionContext) {
    this.info('Détermination de l\'architecture optimale...');

    const prompt = `
Analyse ce projet et détermine l'architecture optimale:

Type: ${config.type}
Langage: ${config.language}
Framework: ${config.framework}
Features: ${JSON.stringify(config.questionnaire)}

Retourne l'architecture recommandée avec:
- Structure de dossiers
- Patterns de design
- Technologies complémentaires
- Bonnes pratiques
`;

    const response = await this.callAI(prompt, context);

    return {
      folderStructure: response.folderStructure || this.getDefaultStructure(config),
      patterns: response.patterns || ['MVC', 'Component-based'],
      technologies: response.technologies || [],
      bestPractices: response.bestPractices || [],
    };
  }

  private async createRoadmap(config: any, architecture: any, context: ExecutionContext) {
    this.info('Création de la roadmap détaillée...');

    const phases = [
      {
        name: 'Setup',
        tasks: ['Initialisation du repo', 'Configuration de base', 'Setup CI/CD'],
        agents: ['devops'],
        duration: '10min',
      },
      {
        name: 'Database',
        tasks: ['Schéma DB', 'Migrations', 'Seeds'],
        agents: ['database'],
        duration: '15min',
      },
      {
        name: 'Backend',
        tasks: ['API Routes', 'Auth', 'Business Logic'],
        agents: ['backend', 'security'],
        duration: '30min',
      },
      {
        name: 'Frontend',
        tasks: ['UI Components', 'Pages', 'State Management'],
        agents: ['frontend', 'seo'],
        duration: '30min',
      },
      {
        name: 'Testing',
        tasks: ['Unit Tests', 'E2E Tests', 'Performance Tests'],
        agents: ['testing'],
        duration: '20min',
      },
      {
        name: 'Deployment',
        tasks: ['Build', 'Deploy', 'Monitoring'],
        agents: ['devops'],
        duration: '15min',
      },
    ];

    // Ajuster selon le type de projet
    if (config.type === 'mobile-app') {
      phases.splice(3, 0, {
        name: 'Mobile',
        tasks: ['App Navigation', 'Native Features', 'Push Notifications'],
        agents: ['mobile'],
        duration: '25min',
      });
    }

    if (config.type === 'game') {
      phases.splice(3, 0, {
        name: 'Game Development',
        tasks: ['Game Engine Setup', 'Game Logic', 'Assets Integration'],
        agents: ['game'],
        duration: '40min',
      });
    }

    return {
      phases,
      totalEstimatedTime: phases.reduce((acc, p) => acc + parseInt(p.duration), 0),
    };
  }

  private async assignTasks(roadmap: any, config: any, context: ExecutionContext) {
    this.info('Assignation des tâches aux agents...');

    const assignments = [];

    for (const phase of roadmap.phases) {
      for (const agentType of phase.agents) {
        assignments.push({
          agentType,
          phase: phase.name,
          tasks: phase.tasks,
          priority: this.calculatePriority(phase, config),
          dependencies: this.getDependencies(phase, roadmap),
        });
      }
    }

    return assignments;
  }

  private estimateResources(roadmap: any, config: any) {
    const complexity = this.calculateComplexity(config);

    return {
      estimatedTime: roadmap.totalEstimatedTime,
      complexity,
      requiredAgents: config.enabledAgents.length,
      estimatedCost: this.calculateCost(roadmap, config),
    };
  }

  private calculateComplexity(config: any): string {
    let score = 0;

    if (config.type === 'game') score += 3;
    else if (config.type === 'mobile-app') score += 2;
    else score += 1;

    if (config.questionnaire.needsAuth) score += 1;
    if (config.questionnaire.needsPayment) score += 2;
    if (config.questionnaire.needsRealtime) score += 2;

    if (score <= 3) return 'simple';
    if (score <= 6) return 'medium';
    if (score <= 9) return 'complex';
    return 'very-complex';
  }

  private calculatePriority(phase: any, config: any): number {
    const priorities: Record<string, number> = {
      Setup: 100,
      Database: 90,
      Backend: 80,
      Frontend: 70,
      Mobile: 70,
      'Game Development': 70,
      Testing: 60,
      Deployment: 50,
    };

    return priorities[phase.name] || 50;
  }

  private getDependencies(phase: any, roadmap: any): string[] {
    const deps: Record<string, string[]> = {
      Database: ['Setup'],
      Backend: ['Setup', 'Database'],
      Frontend: ['Setup', 'Backend'],
      Mobile: ['Setup', 'Backend'],
      'Game Development': ['Setup'],
      Testing: ['Frontend', 'Backend'],
      Deployment: ['Testing'],
    };

    return deps[phase.name] || [];
  }

  private getDefaultStructure(config: any) {
    const base = {
      src: {
        app: {},
        components: {},
        lib: {},
        types: {},
      },
      public: {},
      tests: {},
    };

    return base;
  }

  private calculateCost(roadmap: any, config: any): number {
    // Coût estimé en crédits AI
    return roadmap.totalEstimatedTime * 10;
  }

  private async callAI(prompt: string, context: ExecutionContext): Promise<any> {
    // Appel à l'API AI (OpenAI ou Anthropic)
    // Pour l'instant, retourne une réponse mock
    return {
      folderStructure: null,
      patterns: null,
      technologies: null,
      bestPractices: null,
    };
  }
}
