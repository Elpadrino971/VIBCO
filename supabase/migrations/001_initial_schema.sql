-- ============================================
-- CODING 2.0 - Schema Base de Données
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: users (extends auth.users)
-- ============================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'business', 'enterprise')),

  -- Quotas
  projects_limit INTEGER NOT NULL DEFAULT 1,
  projects_used INTEGER NOT NULL DEFAULT 0,
  ai_generations_limit INTEGER DEFAULT 100, -- null = unlimited
  ai_generations_used INTEGER NOT NULL DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_login_at TIMESTAMP WITH TIME ZONE,

  -- Settings
  settings JSONB DEFAULT '{}'::jsonb
);

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- TABLE: projects
-- ============================================
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- Project info
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('web', 'mobile', 'game', 'fullstack')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'generated', 'deployed', 'failed')),

  -- Configuration
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- config structure:
  -- {
  --   "language": "typescript",
  --   "framework": "nextjs",
  --   "githubRepo": "...",
  --   "supabaseUrl": "...",
  --   "stripeEnabled": true,
  --   ...
  -- }

  -- Generated files
  generated_files JSONB DEFAULT '[]'::jsonb,
  -- generated_files structure:
  -- [
  --   { "path": "src/app/page.tsx", "content": "...", "agentType": "frontend" },
  --   ...
  -- ]

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE,
  deployed_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_created_at ON public.projects(created_at DESC);

-- RLS Policies
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- TABLE: agent_executions
-- ============================================
CREATE TABLE public.agent_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,

  -- Agent info
  agent_type TEXT NOT NULL CHECK (agent_type IN (
    'project-manager', 'frontend', 'backend', 'database',
    'mobile', 'game', 'workflow', 'seo', 'testing',
    'security', 'devops'
  )),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),

  -- Execution data
  logs JSONB DEFAULT '[]'::jsonb,
  -- logs structure: [{ "level": "info", "message": "...", "timestamp": "..." }]

  screenshots TEXT[] DEFAULT ARRAY[]::TEXT[],
  -- Array of screenshot URLs

  result JSONB,
  -- result structure: { "files": [...], "summary": "...", "success": true }

  error_message TEXT,

  -- Timing
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER, -- milliseconds

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX idx_agent_executions_project_id ON public.agent_executions(project_id);
CREATE INDEX idx_agent_executions_agent_type ON public.agent_executions(agent_type);
CREATE INDEX idx_agent_executions_status ON public.agent_executions(status);
CREATE INDEX idx_agent_executions_created_at ON public.agent_executions(created_at DESC);

-- RLS Policies
ALTER TABLE public.agent_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own agent executions"
  ON public.agent_executions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = agent_executions.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- ============================================
-- TABLE: workflows
-- ============================================
CREATE TABLE public.workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- Workflow info
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('n8n', 'make', 'custom')),

  -- Workflow definition (JSON format)
  definition JSONB NOT NULL,
  -- For N8N: { "nodes": [...], "connections": {...} }
  -- For Make: { "flow": [...], "scenario": {...} }

  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'failed')),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_executed_at TIMESTAMP WITH TIME ZONE,

  -- Stats
  execution_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0
);

-- Indexes
CREATE INDEX idx_workflows_project_id ON public.workflows(project_id);
CREATE INDEX idx_workflows_user_id ON public.workflows(user_id);
CREATE INDEX idx_workflows_status ON public.workflows(status);

-- RLS Policies
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workflows"
  ON public.workflows FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create workflows"
  ON public.workflows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workflows"
  ON public.workflows FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workflows"
  ON public.workflows FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- TABLE: api_usage (for tracking AI usage & billing)
-- ============================================
CREATE TABLE public.api_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,

  -- API info
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'other')),
  model TEXT NOT NULL,
  operation TEXT NOT NULL, -- 'code_generation', 'code_review', etc.

  -- Usage
  prompt_tokens INTEGER NOT NULL,
  completion_tokens INTEGER NOT NULL,
  total_tokens INTEGER NOT NULL,

  -- Cost (in cents)
  cost_cents INTEGER,

  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX idx_api_usage_user_id ON public.api_usage(user_id);
CREATE INDEX idx_api_usage_project_id ON public.api_usage(project_id);
CREATE INDEX idx_api_usage_created_at ON public.api_usage(created_at DESC);

-- RLS Policies
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own api usage"
  ON public.api_usage FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflows_updated_at
  BEFORE UPDATE ON public.workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function: Create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function: Check project quota
CREATE OR REPLACE FUNCTION public.check_project_quota()
RETURNS TRIGGER AS $$
DECLARE
  user_plan TEXT;
  projects_limit INTEGER;
  projects_count INTEGER;
BEGIN
  -- Get user plan and limit
  SELECT plan, projects_limit
  INTO user_plan, projects_limit
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Count existing projects
  SELECT COUNT(*)
  INTO projects_count
  FROM public.projects
  WHERE user_id = NEW.user_id
  AND status != 'failed'; -- Don't count failed projects

  -- Check quota
  IF projects_count >= projects_limit THEN
    RAISE EXCEPTION 'Project quota exceeded. Upgrade your plan to create more projects.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Check quota before project creation
CREATE TRIGGER check_project_quota_trigger
  BEFORE INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.check_project_quota();

-- ============================================
-- VIEWS
-- ============================================

-- View: Project stats with agent executions
CREATE VIEW public.project_stats AS
SELECT
  p.id as project_id,
  p.user_id,
  p.name,
  p.status,
  p.created_at,
  COUNT(DISTINCT ae.id) as total_executions,
  COUNT(DISTINCT ae.id) FILTER (WHERE ae.status = 'completed') as completed_executions,
  COUNT(DISTINCT ae.id) FILTER (WHERE ae.status = 'failed') as failed_executions,
  SUM(ae.duration_ms) as total_duration_ms,
  jsonb_agg(
    DISTINCT jsonb_build_object(
      'agent_type', ae.agent_type,
      'status', ae.status,
      'duration_ms', ae.duration_ms
    )
  ) FILTER (WHERE ae.id IS NOT NULL) as agent_details
FROM public.projects p
LEFT JOIN public.agent_executions ae ON ae.project_id = p.id
GROUP BY p.id, p.user_id, p.name, p.status, p.created_at;

-- View: User usage stats
CREATE VIEW public.user_usage_stats AS
SELECT
  u.id as user_id,
  u.email,
  u.plan,
  u.projects_limit,
  u.projects_used,
  u.ai_generations_limit,
  u.ai_generations_used,
  COUNT(DISTINCT p.id) as total_projects,
  COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'deployed') as deployed_projects,
  SUM(api.total_tokens) as total_tokens_used,
  SUM(api.cost_cents) as total_cost_cents,
  u.created_at,
  u.last_login_at
FROM public.profiles u
LEFT JOIN public.projects p ON p.user_id = u.id
LEFT JOIN public.api_usage api ON api.user_id = u.id
GROUP BY u.id, u.email, u.plan, u.projects_limit, u.projects_used,
         u.ai_generations_limit, u.ai_generations_used, u.created_at, u.last_login_at;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- GIN indexes for JSONB columns
CREATE INDEX idx_projects_config_gin ON public.projects USING GIN (config);
CREATE INDEX idx_projects_metadata_gin ON public.projects USING GIN (metadata);
CREATE INDEX idx_agent_executions_logs_gin ON public.agent_executions USING GIN (logs);
CREATE INDEX idx_workflows_definition_gin ON public.workflows USING GIN (definition);

-- ============================================
-- GRANTS (for service role)
-- ============================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.profiles IS 'User profiles extending auth.users with plan and quota information';
COMMENT ON TABLE public.projects IS 'User projects with configuration, generated files, and status';
COMMENT ON TABLE public.agent_executions IS 'Tracking of individual AI agent executions per project';
COMMENT ON TABLE public.workflows IS 'User-created workflows (N8N, Make, or custom)';
COMMENT ON TABLE public.api_usage IS 'API usage tracking for billing and analytics';
