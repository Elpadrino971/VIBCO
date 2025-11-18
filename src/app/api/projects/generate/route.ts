import { NextRequest, NextResponse } from 'next/server';
import { AgentOrchestrator } from '@/agents/orchestrator';
import { ProjectConfig } from '@/types';
import { createServiceClient } from '@/lib/supabase/client';
import { GitHubClient } from '@/lib/github/client';

export async function POST(request: NextRequest) {
  try {
    const projectConfig: ProjectConfig = await request.json();

    // Validation
    if (!projectConfig.githubRepo || !projectConfig.githubToken) {
      return NextResponse.json(
        { error: 'GitHub repository and token are required' },
        { status: 400 }
      );
    }

    if (!projectConfig.supabaseUrl || !projectConfig.supabaseKey) {
      return NextResponse.json(
        { error: 'Supabase URL and key are required' },
        { status: 400 }
      );
    }

    if (projectConfig.questionnaire.needsPayment) {
      if (!projectConfig.stripePublishableKey || !projectConfig.stripeSecretKey) {
        return NextResponse.json(
          { error: 'Stripe keys are required when payment is enabled' },
          { status: 400 }
        );
      }
    }

    // Initialize clients
    const supabaseClient = createServiceClient();
    const githubClient = new GitHubClient(projectConfig.githubToken);

    // TODO: Initialize AI clients (OpenAI/Anthropic)
    const aiClient = null;

    // Create orchestrator
    const orchestrator = new AgentOrchestrator();

    // Execute project generation
    const result = await orchestrator.executeProject(projectConfig, {
      projectId: projectConfig.id,
      projectConfig,
      sharedData: new Map(),
      aiClient,
      githubClient,
      supabaseClient,
    });

    return NextResponse.json({
      success: result.success,
      projectId: projectConfig.id,
      results: result.results,
      message: result.success
        ? 'Project generated successfully'
        : 'Project generation encountered errors',
    });
  } catch (error: any) {
    console.error('Error generating project:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
