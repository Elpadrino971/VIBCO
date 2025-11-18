import { BaseAgent, ExecutionContext, AgentResult } from './base-agent';

export class BackendAgent extends BaseAgent {
  constructor() {
    super(
      'backend',
      'Agent Backend',
      'Développe les API REST/GraphQL, logique métier et intégrations tierces'
    );
  }

  async execute(context: ExecutionContext): Promise<AgentResult> {
    try {
      this.updateStatus('thinking', 'Analyse de l\'architecture backend...');
      this.info('Démarrage du développement backend');
      this.updateProgress(5);

      const { projectConfig } = context;
      const files: Array<{ path: string; content: string }> = [];

      // 1. API Routes
      this.updateStatus('working', 'Création des API routes...');
      const apiRoutes = await this.generateAPIRoutes(projectConfig, context);
      files.push(...apiRoutes);
      this.updateProgress(30);

      // 2. Auth logic (if needed)
      if (projectConfig.questionnaire.needsAuth) {
        this.updateStatus('working', 'Configuration de l\'authentification...');
        const authLogic = await this.generateAuthLogic(projectConfig, context);
        files.push(...authLogic);
        this.updateProgress(50);
      }

      // 3. Payment integration (if needed)
      if (projectConfig.questionnaire.needsPayment) {
        this.updateStatus('working', 'Intégration Stripe...');
        const paymentLogic = await this.generatePaymentLogic(projectConfig, context);
        files.push(...paymentLogic);
        this.updateProgress(70);
      }

      // 4. Business logic
      this.updateStatus('working', 'Génération de la logique métier...');
      const businessLogic = await this.generateBusinessLogic(projectConfig, context);
      files.push(...businessLogic);
      this.updateProgress(90);

      this.updateStatus('completed', 'Backend terminé');
      this.updateProgress(100);
      this.success(`${files.length} fichiers backend générés`);

      return {
        success: true,
        output: { apiRoutesCount: apiRoutes.length, totalFiles: files.length },
        files,
        errors: [],
        warnings: [],
      };
    } catch (error: any) {
      this.error('Erreur backend', { error: error.message });
      this.updateStatus('error');
      return { success: false, errors: [error.message], warnings: [] };
    }
  }

  private async generateAPIRoutes(config: any, context: ExecutionContext) {
    const routes = [
      {
        path: 'src/app/api/health/route.ts',
        content: `export async function GET() {
  return Response.json({ status: 'ok', timestamp: new Date().toISOString() });
}`,
      },
    ];

    if (config.questionnaire.needsDatabase) {
      routes.push({
        path: 'src/app/api/items/route.ts',
        content: `import { createServiceClient } from '@/lib/supabase/client';

export async function GET() {
  const supabase = createServiceClient();
  const { data, error } = await supabase.from('items').select('*');

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(request: Request) {
  const supabase = createServiceClient();
  const body = await request.json();

  const { data, error } = await supabase.from('items').insert(body).select();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}`,
      });
    }

    return routes;
  }

  private async generateAuthLogic(config: any, context: ExecutionContext) {
    return [
      {
        path: 'src/app/api/auth/login/route.ts',
        content: `import { createServiceClient } from '@/lib/supabase/client';

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const supabase = createServiceClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return Response.json({ error: error.message }, { status: 401 });
  return Response.json(data);
}`,
      },
      {
        path: 'src/app/api/auth/signup/route.ts',
        content: `import { createServiceClient } from '@/lib/supabase/client';

export async function POST(request: Request) {
  const { email, password, name } = await request.json();
  const supabase = createServiceClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json(data);
}`,
      },
    ];
  }

  private async generatePaymentLogic(config: any, context: ExecutionContext) {
    return [
      {
        path: 'src/app/api/payment/create-intent/route.ts',
        content: `import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(request: Request) {
  const { amount, currency = 'eur' } = await request.json();

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency,
    });

    return Response.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}`,
      },
    ];
  }

  private async generateBusinessLogic(config: any, context: ExecutionContext) {
    return [];
  }
}
