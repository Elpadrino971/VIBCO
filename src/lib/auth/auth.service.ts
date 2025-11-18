import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: 'free' | 'pro' | 'business' | 'enterprise';
  projects_limit: number;
  projects_used: number;
  ai_generations_limit: number | null;
  ai_generations_used: number;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  settings: Record<string, any>;
}

/**
 * Service d'authentification
 */
export class AuthService {
  private supabase: SupabaseClient;

  constructor(supabaseClient?: SupabaseClient) {
    this.supabase = supabaseClient || createClient(supabaseUrl, supabaseAnonKey);
  }

  /**
   * Inscription avec email/password
   */
  async signUp(data: {
    email: string;
    password: string;
    fullName?: string;
  }): Promise<{ user: User | null; error: Error | null }> {
    const { data: authData, error } = await this.supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName || null,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) {
      return { user: null, error };
    }

    return { user: authData.user, error: null };
  }

  /**
   * Connexion avec email/password
   */
  async signIn(data: {
    email: string;
    password: string;
  }): Promise<{ user: User | null; error: Error | null }> {
    const { data: authData, error } = await this.supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      return { user: null, error };
    }

    // Update last_login_at
    if (authData.user) {
      await this.updateLastLogin(authData.user.id);
    }

    return { user: authData.user, error: null };
  }

  /**
   * Connexion avec OAuth (Google, GitHub, etc.)
   */
  async signInWithOAuth(provider: 'google' | 'github' | 'azure'): Promise<{
    url: string | null;
    error: Error | null;
  }> {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) {
      return { url: null, error };
    }

    return { url: data.url, error: null };
  }

  /**
   * Déconnexion
   */
  async signOut(): Promise<{ error: Error | null }> {
    const { error } = await this.supabase.auth.signOut();
    return { error };
  }

  /**
   * Récupérer l'utilisateur actuel
   */
  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    return user;
  }

  /**
   * Récupérer la session actuelle
   */
  async getSession() {
    const {
      data: { session },
    } = await this.supabase.auth.getSession();
    return session;
  }

  /**
   * Récupérer le profil utilisateur
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data: profile, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return profile;
  }

  /**
   * Mettre à jour le profil utilisateur
   */
  async updateUserProfile(
    userId: string,
    updates: Partial<Omit<UserProfile, 'id' | 'email' | 'created_at' | 'updated_at'>>
  ): Promise<{ profile: UserProfile | null; error: Error | null }> {
    const { data: profile, error } = await this.supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return { profile: null, error };
    }

    return { profile, error: null };
  }

  /**
   * Mettre à jour last_login_at
   */
  private async updateLastLogin(userId: string): Promise<void> {
    await this.supabase
      .from('profiles')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', userId);
  }

  /**
   * Réinitialiser le mot de passe
   */
  async resetPassword(email: string): Promise<{ error: Error | null }> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    });

    return { error };
  }

  /**
   * Mettre à jour le mot de passe
   */
  async updatePassword(newPassword: string): Promise<{ error: Error | null }> {
    const { error } = await this.supabase.auth.updateUser({
      password: newPassword,
    });

    return { error };
  }

  /**
   * Vérifier si l'utilisateur a atteint son quota de projets
   */
  async checkProjectQuota(userId: string): Promise<{
    canCreate: boolean;
    current: number;
    limit: number;
  }> {
    const profile = await this.getUserProfile(userId);
    if (!profile) {
      return { canCreate: false, current: 0, limit: 0 };
    }

    const { data: projects, count } = await this.supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .neq('status', 'failed');

    const current = count || 0;
    const canCreate = current < profile.projects_limit;

    return {
      canCreate,
      current,
      limit: profile.projects_limit,
    };
  }

  /**
   * Vérifier si l'utilisateur a atteint son quota d'API
   */
  async checkAPIQuota(userId: string): Promise<{
    canUse: boolean;
    current: number;
    limit: number | null;
  }> {
    const profile = await this.getUserProfile(userId);
    if (!profile) {
      return { canUse: false, current: 0, limit: null };
    }

    // Si limit est null = unlimited
    if (profile.ai_generations_limit === null) {
      return {
        canUse: true,
        current: profile.ai_generations_used,
        limit: null,
      };
    }

    const canUse = profile.ai_generations_used < profile.ai_generations_limit;

    return {
      canUse,
      current: profile.ai_generations_used,
      limit: profile.ai_generations_limit,
    };
  }

  /**
   * Incrémenter l'usage de l'API
   */
  async incrementAPIUsage(userId: string, count: number = 1): Promise<void> {
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('ai_generations_used')
      .eq('id', userId)
      .single();

    if (!profile) return;

    await this.supabase
      .from('profiles')
      .update({
        ai_generations_used: profile.ai_generations_used + count,
      })
      .eq('id', userId);
  }

  /**
   * Mettre à jour le plan de l'utilisateur
   */
  async updateUserPlan(
    userId: string,
    plan: UserProfile['plan'],
    limits?: {
      projects_limit?: number;
      ai_generations_limit?: number | null;
    }
  ): Promise<{ error: Error | null }> {
    const updates: any = { plan };

    if (limits) {
      if (limits.projects_limit !== undefined) {
        updates.projects_limit = limits.projects_limit;
      }
      if (limits.ai_generations_limit !== undefined) {
        updates.ai_generations_limit = limits.ai_generations_limit;
      }
    } else {
      // Limites par défaut selon le plan
      const planLimits = {
        free: { projects_limit: 1, ai_generations_limit: 100 },
        pro: { projects_limit: 10, ai_generations_limit: null },
        business: { projects_limit: -1, ai_generations_limit: null }, // unlimited
        enterprise: { projects_limit: -1, ai_generations_limit: null },
      };

      updates.projects_limit = planLimits[plan].projects_limit;
      updates.ai_generations_limit = planLimits[plan].ai_generations_limit;
    }

    const { error } = await this.supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    return { error };
  }
}

/**
 * Helper: Créer un client Supabase pour server-side
 */
export function createServerSupabaseClient() {
  const cookieStore = cookies();

  return createClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
    },
  });
}

/**
 * Helper: Récupérer l'utilisateur server-side
 */
export async function getServerUser(): Promise<User | null> {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Middleware: Protéger une route (server-side)
 */
export async function requireAuth(): Promise<{ user: User; profile: UserProfile }> {
  const user = await getServerUser();

  if (!user) {
    throw new Error('Unauthorized: No user session');
  }

  const authService = new AuthService(createServerSupabaseClient());
  const profile = await authService.getUserProfile(user.id);

  if (!profile) {
    throw new Error('Unauthorized: Profile not found');
  }

  return { user, profile };
}

/**
 * Middleware: Vérifier le plan de l'utilisateur
 */
export async function requirePlan(
  requiredPlans: UserProfile['plan'][]
): Promise<{ user: User; profile: UserProfile }> {
  const { user, profile } = await requireAuth();

  if (!requiredPlans.includes(profile.plan)) {
    throw new Error(
      `Forbidden: This feature requires ${requiredPlans.join(' or ')} plan`
    );
  }

  return { user, profile };
}
