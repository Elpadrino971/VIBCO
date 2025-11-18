import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VibeCoding Platform - Créez avec 10 Agents IA',
  description: 'Plateforme de génération de sites web, apps mobiles et jeux avec 10 agents IA spécialisés',
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
          <header className="border-b">
            <nav className="container mx-auto flex h-16 items-center justify-between px-4">
              <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                VibeCoding
              </Link>

              <div className="flex items-center gap-6">
                <Link href="/" className="text-sm hover:underline">
                  Accueil
                </Link>
                <Link href="/create" className="text-sm hover:underline">
                  Créer un projet
                </Link>
                <Link href="/about" className="text-sm hover:underline">
                  À propos
                </Link>
              </div>
            </nav>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="border-t py-8 mt-16">
            <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} VibeCoding Platform. Tous droits réservés.</p>
              <p className="mt-2">
                Propulsé par 10 agents IA spécialisés | GitHub + Supabase + Stripe
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
