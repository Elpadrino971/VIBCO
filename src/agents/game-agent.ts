import { BaseAgent, ExecutionContext, AgentResult } from './base-agent';

export class GameAgent extends BaseAgent {
  constructor() {
    super('game', 'Agent Game', 'Développe des jeux avec Unity, Phaser ou Three.js');
  }

  async execute(context: ExecutionContext): Promise<AgentResult> {
    this.updateStatus('working', 'Génération jeu...');
    this.info('Configuration moteur de jeu');
    this.updateProgress(50);

    this.updateStatus('completed', 'Jeu terminé');
    this.updateProgress(100);

    return {
      success: true,
      files: [],
      errors: [],
      warnings: ['Configuration jeu basique - assets à ajouter'],
    };
  }
}
