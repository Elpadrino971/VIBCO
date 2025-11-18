import { BaseAgent, ExecutionContext, AgentResult } from './base-agent';

export class WorkflowAgent extends BaseAgent {
  constructor() {
    super(
      'workflow',
      'Agent Workflow Automation',
      'Génère des workflows N8N et Make.com pour automatiser les processus métier'
    );
  }

  async execute(context: ExecutionContext): Promise<AgentResult> {
    try {
      this.updateStatus('thinking', 'Analyse des besoins d\'automatisation...');
      this.info('Démarrage de la génération de workflows');
      this.updateProgress(5);

      const { projectConfig } = context;
      const files: Array<{ path: string; content: string }> = [];

      // 1. Analyser les besoins d'automatisation
      this.updateStatus('working', 'Identification des workflows nécessaires...');
      const workflowNeeds = await this.analyzeWorkflowNeeds(projectConfig, context);
      this.updateProgress(20);

      // 2. Générer workflows N8N
      this.updateStatus('working', 'Génération des workflows N8N...');
      const n8nWorkflows = await this.generateN8NWorkflows(workflowNeeds, context);
      files.push(...n8nWorkflows);
      this.updateProgress(50);

      // 3. Générer scenarios Make.com
      this.updateStatus('working', 'Génération des scenarios Make.com...');
      const makeScenarios = await this.generateMakeScenarios(workflowNeeds, context);
      files.push(...makeScenarios);
      this.updateProgress(75);

      // 4. Créer la documentation
      this.updateStatus('working', 'Création de la documentation...');
      const documentation = this.generateWorkflowDocumentation(workflowNeeds);
      files.push(documentation);
      this.updateProgress(95);

      this.updateStatus('completed', 'Workflows générés');
      this.updateProgress(100);
      this.success(`${files.length} workflows créés (N8N + Make)`);

      return {
        success: true,
        output: {
          n8nCount: n8nWorkflows.length,
          makeCount: makeScenarios.length,
          totalFiles: files.length,
          workflows: workflowNeeds,
        },
        files,
        errors: [],
        warnings: [],
        nextSteps: [
          'Importez les workflows N8N dans votre instance',
          'Configurez les credentials dans N8N/Make',
          'Testez chaque workflow individuellement',
        ],
      };
    } catch (error: any) {
      this.error('Erreur lors de la génération des workflows', { error: error.message });
      this.updateStatus('error');

      return {
        success: false,
        errors: [error.message],
        warnings: [],
      };
    }
  }

  private async analyzeWorkflowNeeds(config: any, context: ExecutionContext) {
    this.info('Analyse des besoins d\'automatisation basés sur le projet...');

    const workflows = [];

    // Workflow d'authentification
    if (config.questionnaire.needsAuth) {
      workflows.push({
        name: 'user-registration-workflow',
        type: 'authentication',
        description: 'Workflow d\'inscription utilisateur avec email de bienvenue',
        triggers: ['user.signup'],
        actions: ['send-email', 'create-profile', 'add-to-crm'],
      });

      workflows.push({
        name: 'password-reset-workflow',
        type: 'authentication',
        description: 'Workflow de réinitialisation de mot de passe',
        triggers: ['password.reset.request'],
        actions: ['send-reset-email', 'log-event'],
      });
    }

    // Workflow de paiement
    if (config.questionnaire.needsPayment) {
      workflows.push({
        name: 'payment-success-workflow',
        type: 'payment',
        description: 'Workflow post-paiement réussi',
        triggers: ['stripe.payment.succeeded'],
        actions: ['send-receipt', 'update-subscription', 'notify-slack', 'add-to-analytics'],
      });

      workflows.push({
        name: 'payment-failed-workflow',
        type: 'payment',
        description: 'Workflow en cas d\'échec de paiement',
        triggers: ['stripe.payment.failed'],
        actions: ['send-failure-email', 'notify-admin', 'log-error'],
      });
    }

    // Workflow de notifications
    workflows.push({
      name: 'notification-workflow',
      type: 'notification',
      description: 'Workflow de gestion des notifications multi-canaux',
      triggers: ['notification.create'],
      actions: ['send-email', 'send-push', 'send-sms', 'log-notification'],
    });

    // Workflow de backup
    workflows.push({
      name: 'daily-backup-workflow',
      type: 'maintenance',
      description: 'Backup quotidien de la base de données',
      triggers: ['schedule.daily.3am'],
      actions: ['backup-database', 'upload-to-s3', 'verify-backup', 'notify-admin'],
    });

    // Workflow de monitoring
    workflows.push({
      name: 'health-check-workflow',
      type: 'monitoring',
      description: 'Vérification de santé du système',
      triggers: ['schedule.every.5min'],
      actions: ['check-api', 'check-database', 'check-storage', 'alert-if-down'],
    });

    // Workflow de SEO
    workflows.push({
      name: 'content-seo-workflow',
      type: 'seo',
      description: 'Optimisation SEO automatique du contenu',
      triggers: ['content.created', 'content.updated'],
      actions: ['analyze-seo', 'generate-meta', 'update-sitemap', 'ping-search-engines'],
    });

    // Workflow CRM
    if (config.questionnaire.needsAuth) {
      workflows.push({
        name: 'lead-nurturing-workflow',
        type: 'crm',
        description: 'Workflow de nurturing des leads',
        triggers: ['lead.created'],
        actions: ['add-to-sequence', 'send-welcome-series', 'score-lead', 'notify-sales'],
      });
    }

    return workflows;
  }

  private async generateN8NWorkflows(workflows: any[], context: ExecutionContext) {
    this.info(`Génération de ${workflows.length} workflows N8N...`);

    const files = [];

    for (const workflow of workflows) {
      const n8nWorkflow = {
        name: workflow.name,
        nodes: this.createN8NNodes(workflow),
        connections: this.createN8NConnections(workflow),
        settings: {
          executionOrder: 'v1',
        },
        staticData: null,
        tags: [workflow.type, 'auto-generated'],
        triggerCount: 0,
        updatedAt: new Date().toISOString(),
        versionId: '1',
      };

      files.push({
        path: `workflows/n8n/${workflow.name}.json`,
        content: JSON.stringify(n8nWorkflow, null, 2),
      });
    }

    return files;
  }

  private createN8NNodes(workflow: any) {
    const nodes = [];

    // Trigger node
    nodes.push({
      parameters: {
        event: workflow.triggers[0],
      },
      id: 'trigger-1',
      name: 'Trigger',
      type: workflow.triggers[0].includes('schedule') ? 'n8n-nodes-base.cron' : 'n8n-nodes-base.webhook',
      typeVersion: 1,
      position: [250, 300],
    });

    // Action nodes
    workflow.actions.forEach((action: string, index: number) => {
      const nodeType = this.getN8NNodeType(action);

      nodes.push({
        parameters: this.getN8NNodeParameters(action),
        id: `action-${index + 1}`,
        name: action.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        type: nodeType,
        typeVersion: 1,
        position: [450 + index * 200, 300],
      });
    });

    return nodes;
  }

  private createN8NConnections(workflow: any) {
    const connections: any = {
      'Trigger': {
        main: [[{ node: workflow.actions[0], type: 'main', index: 0 }]],
      },
    };

    workflow.actions.forEach((action: string, index: number) => {
      if (index < workflow.actions.length - 1) {
        const actionName = action.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
        const nextAction = workflow.actions[index + 1].replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());

        connections[actionName] = {
          main: [[{ node: nextAction, type: 'main', index: 0 }]],
        };
      }
    });

    return connections;
  }

  private getN8NNodeType(action: string): string {
    const nodeTypeMap: Record<string, string> = {
      'send-email': 'n8n-nodes-base.emailSend',
      'send-push': 'n8n-nodes-base.pushbullet',
      'send-sms': 'n8n-nodes-base.twilio',
      'create-profile': 'n8n-nodes-base.supabase',
      'add-to-crm': 'n8n-nodes-base.hubspot',
      'backup-database': 'n8n-nodes-base.postgres',
      'upload-to-s3': 'n8n-nodes-base.aws',
      'check-api': 'n8n-nodes-base.httpRequest',
      'notify-slack': 'n8n-nodes-base.slack',
      'log-event': 'n8n-nodes-base.supabase',
    };

    return nodeTypeMap[action] || 'n8n-nodes-base.httpRequest';
  }

  private getN8NNodeParameters(action: string): any {
    const paramMap: Record<string, any> = {
      'send-email': {
        fromEmail: 'noreply@yourapp.com',
        toEmail: '={{ $json["email"] }}',
        subject: 'Welcome to our platform!',
        text: 'Thank you for signing up!',
      },
      'send-push': {
        message: '={{ $json["message"] }}',
        title: '={{ $json["title"] }}',
      },
      'backup-database': {
        operation: 'executeQuery',
        query: 'BACKUP DATABASE TO S3',
      },
    };

    return paramMap[action] || {};
  }

  private async generateMakeScenarios(workflows: any[], context: ExecutionContext) {
    this.info(`Génération de ${workflows.length} scenarios Make.com...`);

    const files = [];

    for (const workflow of workflows) {
      const makeScenario = {
        name: workflow.name,
        flow: this.createMakeFlow(workflow),
        scheduling: workflow.triggers[0].includes('schedule')
          ? { type: 'interval', interval: 300 }
          : { type: 'immediately' },
        scenario_type: 'scenario',
      };

      files.push({
        path: `workflows/make/${workflow.name}.json`,
        content: JSON.stringify(makeScenario, null, 2),
      });
    }

    return files;
  }

  private createMakeFlow(workflow: any) {
    const modules = [];

    // Trigger module
    modules.push({
      id: 1,
      module: workflow.triggers[0].includes('webhook') ? 'gateway:webhook' : 'builtin:BasicScheduler',
      version: 1,
      parameters: {},
      mapper: {},
    });

    // Action modules
    workflow.actions.forEach((action: string, index: number) => {
      modules.push({
        id: index + 2,
        module: this.getMakeModuleType(action),
        version: 1,
        parameters: this.getMakeModuleParameters(action),
        mapper: {},
      });
    });

    return modules;
  }

  private getMakeModuleType(action: string): string {
    const moduleTypeMap: Record<string, string> = {
      'send-email': 'email:ActionSendEmail',
      'send-push': 'pushbullet:ActionSendPush',
      'send-sms': 'twilio:ActionSendSMS',
      'create-profile': 'supabase:ActionInsert',
      'add-to-crm': 'hubspot:ActionCreateContact',
      'notify-slack': 'slack:ActionPostMessage',
    };

    return moduleTypeMap[action] || 'http:ActionMakeRequest';
  }

  private getMakeModuleParameters(action: string): any {
    const paramMap: Record<string, any> = {
      'send-email': {
        to: '{{1.email}}',
        subject: 'Welcome!',
        body: 'Thank you for signing up!',
      },
    };

    return paramMap[action] || {};
  }

  private generateWorkflowDocumentation(workflows: any[]) {
    const doc = `# Workflows Automation Documentation

## Overview

Ce projet inclut **${workflows.length} workflows automatisés** pour N8N et Make.com.

## Workflows Générés

${workflows
  .map(
    (w, i) => `
### ${i + 1}. ${w.name}

- **Type**: ${w.type}
- **Description**: ${w.description}
- **Triggers**: ${w.triggers.join(', ')}
- **Actions**:
${w.actions.map((a: string) => `  - ${a}`).join('\n')}
`
  )
  .join('\n')}

## Installation N8N

1. Importez les fichiers JSON depuis \`workflows/n8n/\`
2. Configurez les credentials pour chaque service
3. Activez les workflows
4. Testez chaque workflow

## Installation Make.com

1. Importez les scenarios depuis \`workflows/make/\`
2. Configurez les connexions
3. Activez les scenarios
4. Testez

## Configuration Requise

- N8N instance (self-hosted ou cloud)
- Make.com account (ou équivalent)
- Credentials pour :
  - Email (SMTP)
  - Supabase
  - Stripe (si paiements)
  - Slack (notifications)
  - Services tiers

## Best Practices

- Testez chaque workflow individuellement
- Configurez des alertes en cas d'échec
- Monitorez les exécutions
- Gardez les credentials sécurisés
- Documentez les modifications

---

Généré automatiquement par Coding 2.0 Platform
`;

    return {
      path: 'workflows/README.md',
      content: doc,
    };
  }
}
