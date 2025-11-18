import { BaseAgent, ExecutionContext, AgentResult } from './base-agent';

export class DatabaseAgent extends BaseAgent {
  constructor() {
    super('database', 'Agent Database', 'Conçoit le schéma DB, crée les migrations et optimise les requêtes');
  }

  async execute(context: ExecutionContext): Promise<AgentResult> {
    try {
      this.updateStatus('thinking', 'Analyse des besoins de données...');
      this.info('Conception du schéma de base de données');
      this.updateProgress(10);

      const { projectConfig } = context;
      const files: Array<{ path: string; content: string }> = [];

      this.updateStatus('working', 'Création du schéma Supabase...');
      const schema = await this.generateDatabaseSchema(projectConfig, context);
      files.push(...schema);
      this.updateProgress(50);

      this.updateStatus('working', 'Génération des migrations...');
      const migrations = await this.generateMigrations(projectConfig, context);
      files.push(...migrations);
      this.updateProgress(80);

      this.updateStatus('completed', 'Base de données configurée');
      this.updateProgress(100);
      this.success('Schéma et migrations créés');

      return {
        success: true,
        output: { tablesCount: schema.length },
        files,
        errors: [],
        warnings: [],
      };
    } catch (error: any) {
      this.error('Erreur DB', { error: error.message });
      this.updateStatus('error');
      return { success: false, errors: [error.message], warnings: [] };
    }
  }

  private async generateDatabaseSchema(config: any, context: ExecutionContext) {
    const tables = [];

    if (config.questionnaire.needsAuth) {
      tables.push({
        path: 'supabase/migrations/001_users.sql',
        content: `-- Users table extension
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);`,
      });
    }

    if (config.questionnaire.needsDatabase) {
      tables.push({
        path: 'supabase/migrations/002_items.sql',
        content: `-- Items table
CREATE TABLE IF NOT EXISTS public.items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own items"
  ON public.items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create items"
  ON public.items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own items"
  ON public.items FOR UPDATE
  USING (auth.uid() = user_id);`,
      });
    }

    return tables;
  }

  private async generateMigrations(config: any, context: ExecutionContext) {
    return [];
  }
}
