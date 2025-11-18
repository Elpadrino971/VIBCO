import { BaseAgent, ExecutionContext, AgentResult } from './base-agent';

export class FrontendAgent extends BaseAgent {
  constructor() {
    super(
      'frontend',
      'Agent Frontend',
      'Développe les interfaces utilisateur, composants React/Vue/Angular et gère le state management'
    );
  }

  async execute(context: ExecutionContext): Promise<AgentResult> {
    try {
      this.updateStatus('thinking', 'Analyse des besoins UI...');
      this.info('Démarrage du développement frontend');
      this.updateProgress(5);

      const { projectConfig } = context;
      const files: Array<{ path: string; content: string }> = [];

      // 1. Créer les composants de base
      this.updateStatus('working', 'Création des composants UI...');
      const components = await this.generateComponents(projectConfig, context);
      files.push(...components);
      this.updateProgress(25);

      // 2. Créer les pages
      this.updateStatus('working', 'Génération des pages...');
      const pages = await this.generatePages(projectConfig, context);
      files.push(...pages);
      this.updateProgress(50);

      // 3. Setup state management
      this.updateStatus('working', 'Configuration du state management...');
      const stateManagement = await this.setupStateManagement(projectConfig, context);
      files.push(...stateManagement);
      this.updateProgress(70);

      // 4. Styling et thème
      this.updateStatus('working', 'Application du thème et styles...');
      const styles = await this.generateStyles(projectConfig, context);
      files.push(...styles);
      this.updateProgress(85);

      // 5. Navigation et routing
      this.updateStatus('working', 'Configuration du routing...');
      const routing = await this.setupRouting(projectConfig, context);
      files.push(...routing);
      this.updateProgress(95);

      this.updateStatus('completed', 'Frontend terminé');
      this.updateProgress(100);
      this.success(`${files.length} fichiers frontend générés`);

      return {
        success: true,
        output: {
          componentsCount: components.length,
          pagesCount: pages.length,
          totalFiles: files.length,
        },
        files,
        errors: [],
        warnings: [],
        nextSteps: ['Tests E2E seront effectués par l\'agent Testing'],
      };
    } catch (error: any) {
      this.error('Erreur lors du développement frontend', { error: error.message });
      this.updateStatus('error');

      return {
        success: false,
        errors: [error.message],
        warnings: [],
      };
    }
  }

  private async generateComponents(config: any, context: ExecutionContext) {
    this.info('Génération des composants réutilisables...');

    const files = [];

    // Button component
    files.push({
      path: 'src/components/ui/button.tsx',
      content: this.getButtonComponent(config),
    });

    // Input component
    files.push({
      path: 'src/components/ui/input.tsx',
      content: this.getInputComponent(config),
    });

    // Card component
    files.push({
      path: 'src/components/ui/card.tsx',
      content: this.getCardComponent(config),
    });

    // Navigation
    files.push({
      path: 'src/components/layout/navbar.tsx',
      content: this.getNavbarComponent(config),
    });

    // Footer
    files.push({
      path: 'src/components/layout/footer.tsx',
      content: this.getFooterComponent(config),
    });

    if (config.questionnaire.needsAuth) {
      files.push({
        path: 'src/components/auth/login-form.tsx',
        content: this.getLoginFormComponent(config),
      });

      files.push({
        path: 'src/components/auth/signup-form.tsx',
        content: this.getSignupFormComponent(config),
      });
    }

    return files;
  }

  private async generatePages(config: any, context: ExecutionContext) {
    this.info('Génération des pages...');

    const files = [];

    // Home page
    files.push({
      path: 'src/app/page.tsx',
      content: this.getHomePageContent(config),
    });

    // Layout
    files.push({
      path: 'src/app/layout.tsx',
      content: this.getLayoutContent(config),
    });

    // About page
    files.push({
      path: 'src/app/about/page.tsx',
      content: this.getAboutPageContent(config),
    });

    if (config.questionnaire.needsAuth) {
      files.push({
        path: 'src/app/auth/login/page.tsx',
        content: this.getLoginPageContent(config),
      });

      files.push({
        path: 'src/app/dashboard/page.tsx',
        content: this.getDashboardPageContent(config),
      });
    }

    return files;
  }

  private async setupStateManagement(config: any, context: ExecutionContext) {
    this.info('Configuration du state management avec Zustand...');

    const files = [];

    // User store
    if (config.questionnaire.needsAuth) {
      files.push({
        path: 'src/store/user-store.ts',
        content: this.getUserStoreContent(),
      });
    }

    // App store
    files.push({
      path: 'src/store/app-store.ts',
      content: this.getAppStoreContent(),
    });

    return files;
  }

  private async generateStyles(config: any, context: ExecutionContext) {
    this.info('Génération des styles globaux...');

    const files = [];

    files.push({
      path: 'src/app/globals.css',
      content: this.getGlobalStyles(config),
    });

    return files;
  }

  private async setupRouting(config: any, context: ExecutionContext) {
    this.info('Configuration du routing Next.js...');

    // Next.js 14 utilise le file-based routing, donc pas de fichier de config séparé
    return [];
  }

  // Template generators
  private getButtonComponent(config: any): string {
    return `import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2',
          'disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'default',
            'border border-input bg-background hover:bg-accent': variant === 'outline',
            'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
            'h-9 px-4 text-sm': size === 'sm',
            'h-10 px-6': size === 'md',
            'h-11 px-8 text-lg': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
`;
  }

  private getInputComponent(config: any): string {
    return `import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
          'ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
`;
  }

  private getCardComponent(config: any): string {
    return `import * as React from 'react';
import { cn } from '@/lib/utils';

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-2xl font-semibold leading-none tracking-tight', className)} {...props} />
  )
);
CardTitle.displayName = 'CardTitle';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

export { Card, CardHeader, CardTitle, CardContent };
`;
  }

  private getNavbarComponent(config: any): string {
    return `'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Navbar() {
  return (
    <header className="border-b">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold">
          ${config.name || 'VibeCoding'}
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/about" className="text-sm hover:underline">
            À propos
          </Link>
          ${config.questionnaire.needsAuth ? `
          <Link href="/auth/login">
            <Button variant="outline" size="sm">Connexion</Button>
          </Link>
          <Link href="/auth/signup">
            <Button size="sm">S'inscrire</Button>
          </Link>
          ` : ''}
        </div>
      </nav>
    </header>
  );
}
`;
  }

  private getFooterComponent(config: any): string {
    return `export function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} ${config.name || 'VibeCoding'}. Tous droits réservés.</p>
        <p className="mt-2">Propulsé par VibeCoding Platform</p>
      </div>
    </footer>
  );
}
`;
  }

  private getLoginFormComponent(config: any): string {
    return `'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Implement auth logic with Supabase
    console.log('Login:', { email, password });

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-2">
          Mot de passe
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Connexion...' : 'Se connecter'}
      </Button>
    </form>
  );
}
`;
  }

  private getSignupFormComponent(config: any): string {
    return `'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Implement signup logic with Supabase
    console.log('Signup:', { name, email, password });

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Nom complet
        </label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-2">
          Mot de passe
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Création...' : 'Créer un compte'}
      </Button>
    </form>
  );
}
`;
  }

  private getHomePageContent(config: any): string {
    return `import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4">
          ${config.name || 'Bienvenue sur VibeCoding'}
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          ${config.description || 'Une plateforme moderne et performante'}
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/about">
            <Button size="lg">Découvrir</Button>
          </Link>
          ${config.questionnaire.needsAuth ? `
          <Link href="/auth/signup">
            <Button size="lg" variant="outline">Commencer</Button>
          </Link>
          ` : ''}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-16">
        ${config.questionnaire.mainFeatures.slice(0, 3).map((feature: string, i: number) => `
        <Card>
          <CardHeader>
            <CardTitle>Feature ${i + 1}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">${feature}</p>
          </CardContent>
        </Card>
        `).join('')}
      </div>
    </div>
  );
}
`;
  }

  private getLayoutContent(config: any): string {
    return `import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '${config.name || 'VibeCoding Platform'}',
  description: '${config.description || 'Généré par VibeCoding Platform'}',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
`;
  }

  private getAboutPageContent(config: any): string {
    return `export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">À propos</h1>
      <div className="prose max-w-none">
        <p className="text-lg">
          ${config.description || 'Ce projet a été généré par la plateforme VibeCoding.'}
        </p>
        <p className="mt-4">
          Technologies utilisées: ${config.framework}, ${config.language}
        </p>
      </div>
    </div>
  );
}
`;
  }

  private getLoginPageContent(config: any): string {
    return `import { LoginForm } from '@/components/auth/login-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Connexion</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <p className="text-center mt-4 text-sm">
            Pas encore de compte?{' '}
            <Link href="/auth/signup" className="text-primary hover:underline">
              S'inscrire
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
`;
  }

  private getDashboardPageContent(config: any): string {
    return `export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
      <p>Bienvenue sur votre dashboard!</p>
    </div>
  );
}
`;
  }

  private getUserStoreContent(): string {
    return `import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
}

interface UserStore {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
}));
`;
  }

  private getAppStoreContent(): string {
    return `import { create } from 'zustand';

interface AppStore {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useAppStore = create<AppStore>((set) => ({
  isLoading: false,
  setLoading: (isLoading) => set({ isLoading }),
  theme: 'light',
  setTheme: (theme) => set({ theme }),
}));
`;
  }

  private getGlobalStyles(config: any): string {
    return `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
`;
  }
}
