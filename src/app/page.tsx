import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            VibeCoding Platform
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Créez des sites web, applications mobiles et jeux complets avec{' '}
            <span className="font-bold text-primary">10 agents IA spécialisés</span>
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/create">
              <Button size="lg" className="text-lg px-8">
                🚀 Créer un projet
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="text-lg px-8">
                En savoir plus
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-12">
            10 Agents IA Spécialisés
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '🎯',
                name: 'Project Manager',
                desc: 'Analyse et planifie votre projet',
              },
              {
                icon: '🎨',
                name: 'Frontend',
                desc: 'Interface utilisateur moderne',
              },
              {
                icon: '⚙️',
                name: 'Backend',
                desc: 'API et logique métier',
              },
              {
                icon: '🗄️',
                name: 'Database',
                desc: 'Architecture de données optimale',
              },
              {
                icon: '📱',
                name: 'Mobile',
                desc: 'Apps React Native / Flutter',
              },
              {
                icon: '🎮',
                name: 'Game',
                desc: 'Jeux Unity / Phaser / Three.js',
              },
              {
                icon: '🔍',
                name: 'SEO',
                desc: 'Optimisation référencement',
              },
              {
                icon: '🧪',
                name: 'Testing',
                desc: 'Tests automatisés avec screenshots',
              },
              {
                icon: '🔒',
                name: 'Security',
                desc: 'Audit de sécurité complet',
              },
              {
                icon: '🚀',
                name: 'DevOps',
                desc: 'Déploiement et CI/CD',
              },
            ].map((agent) => (
              <Card key={agent.name}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-3xl">{agent.icon}</span>
                    <span>{agent.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{agent.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center mb-12">
            Intégrations Obligatoires
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📁</span>
                  GitHub
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Gestion du code source et versioning automatique
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🗄️</span>
                  Supabase
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Base de données, authentification et stockage
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">💳</span>
                  Stripe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Paiements sécurisés (si nécessaire)
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 text-center">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-4xl font-bold mb-4">
            Prêt à créer votre projet ?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Les 10 agents IA sont prêts à transformer votre idée en réalité
          </p>
          <Link href="/create">
            <Button size="lg" className="text-lg px-12">
              Commencer maintenant
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
