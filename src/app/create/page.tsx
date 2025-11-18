'use client';

import { useState } from 'react';
import { CreateProjectForm } from '@/components/project/create-project-form';
import { ProjectQuestionnaire } from '@/components/project/questionnaire';
import { AgentDashboard } from '@/components/project/agent-dashboard';
import { ProjectConfig, Agent } from '@/types';
import { generateId } from '@/lib/utils';

export default function CreateProjectPage() {
  const [step, setStep] = useState<'form' | 'questionnaire' | 'generation'>('form');
  const [projectConfig, setProjectConfig] = useState<Partial<ProjectConfig>>({});
  const [agents, setAgents] = useState<Agent[]>([]);
  const [generationStarted, setGenerationStarted] = useState(false);

  const handleFormSubmit = (formData: any) => {
    setProjectConfig({
      ...formData,
      id: generateId(),
      userId: 'demo-user', // TODO: Get from auth
      enabledAgents: [
        'project-manager',
        'database',
        'backend',
        'frontend',
        'seo',
        'security',
        'testing',
        'devops',
      ],
      agentConfigs: {},
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setStep('questionnaire');
  };

  const handleQuestionnaireComplete = async (questionnaire: any) => {
    const finalConfig: ProjectConfig = {
      ...projectConfig,
      questionnaire,
      status: 'generating',
    } as ProjectConfig;

    setProjectConfig(finalConfig);
    setStep('generation');
    setGenerationStarted(true);

    // Démarrer la génération
    await startGeneration(finalConfig);
  };

  const startGeneration = async (config: ProjectConfig) => {
    // TODO: Appeler l'API pour lancer l'orchestrateur d'agents
    console.log('🚀 Génération démarrée avec config:', config);

    // Simulation pour la démo
    // Dans la vraie implémentation, cela appellerait l'API
    // qui utiliserait AgentOrchestrator

    // Mock agents pour la démo
    const mockAgents: Agent[] = [
      {
        id: '1',
        type: 'project-manager',
        name: 'Chef de Projet IA',
        description: 'Analyse et planification',
        status: 'working',
        progress: 45,
        currentTask: 'Création de la roadmap...',
        logs: [
          {
            id: '1',
            agentId: '1',
            timestamp: new Date(),
            level: 'info',
            message: 'Analyse du projet démarrée',
          },
          {
            id: '2',
            agentId: '1',
            timestamp: new Date(),
            level: 'success',
            message: 'Architecture déterminée',
          },
        ],
        screenshots: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        type: 'frontend',
        name: 'Agent Frontend',
        description: 'Développement UI',
        status: 'idle',
        progress: 0,
        currentTask: null,
        logs: [],
        screenshots: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3',
        type: 'backend',
        name: 'Agent Backend',
        description: 'API et logique métier',
        status: 'idle',
        progress: 0,
        currentTask: null,
        logs: [],
        screenshots: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    setAgents(mockAgents);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-4">
          <Step number={1} label="Configuration" active={step === 'form'} completed={step !== 'form'} />
          <div className="h-0.5 w-16 bg-gray-300" />
          <Step
            number={2}
            label="Questionnaire"
            active={step === 'questionnaire'}
            completed={step === 'generation'}
          />
          <div className="h-0.5 w-16 bg-gray-300" />
          <Step number={3} label="Génération" active={step === 'generation'} completed={false} />
        </div>
      </div>

      {/* Content */}
      {step === 'form' && <CreateProjectForm onSubmit={handleFormSubmit} />}

      {step === 'questionnaire' && (
        <ProjectQuestionnaire onComplete={handleQuestionnaireComplete} />
      )}

      {step === 'generation' && (
        <div>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Génération en cours...</h1>
            <p className="text-muted-foreground">
              Les agents IA travaillent sur votre projet
            </p>
          </div>

          {agents.length > 0 ? (
            <AgentDashboard agents={agents} />
          ) : (
            <div className="text-center py-16">
              <div className="animate-spin w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p>Initialisation des agents...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Step({
  number,
  label,
  active,
  completed,
}: {
  number: number;
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
          completed
            ? 'bg-green-500 text-white'
            : active
            ? 'bg-primary text-white'
            : 'bg-gray-200 text-gray-600'
        }`}
      >
        {completed ? '✓' : number}
      </div>
      <p className={`text-sm mt-2 ${active ? 'font-bold' : 'text-muted-foreground'}`}>
        {label}
      </p>
    </div>
  );
}
