import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-6 text-center">
          À propos de VibeCoding
        </h1>

        <p className="text-xl text-center text-muted-foreground mb-12">
          La plateforme révolutionnaire qui transforme vos idées en applications complètes
        </p>

        <div className="prose max-w-none space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>🚀 Notre Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                VibeCoding Platform démocratise le développement d'applications en utilisant
                10 agents IA spécialisés qui travaillent ensemble pour créer des sites web,
                applications mobiles et jeux vidéo professionnels.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🤖 Comment ça marche ?</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2">
                <li>
                  <strong>Configurez votre projet</strong> - Définissez le type, langage et
                  framework
                </li>
                <li>
                  <strong>Intégrations obligatoires</strong> - Connectez GitHub, Supabase et
                  Stripe (si nécessaire)
                </li>
                <li>
                  <strong>Répondez au questionnaire</strong> - Aidez les agents à comprendre vos
                  besoins
                </li>
                <li>
                  <strong>Les agents travaillent</strong> - 10 agents IA spécialisés créent votre
                  application
                </li>
                <li>
                  <strong>Tests automatisés</strong> - Chaque composant est testé avec screenshots
                </li>
                <li>
                  <strong>Déploiement automatique</strong> - Votre projet est prêt à l'emploi
                </li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>✨ Fonctionnalités Clés</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li>✅ Génération complète de code</li>
                <li>✅ 10 agents IA spécialisés</li>
                <li>✅ Tests E2E automatisés avec screenshots</li>
                <li>✅ Intégration GitHub, Supabase, Stripe</li>
                <li>✅ Support multi-langages (TypeScript, Python, Go...)</li>
                <li>✅ Multi-frameworks (Next.js, React Native, Unity...)</li>
                <li>✅ Optimisation SEO automatique</li>
                <li>✅ Audit de sécurité</li>
                <li>✅ CI/CD configuré</li>
                <li>✅ Dashboard de monitoring en temps réel</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🎯 Pour Qui ?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-bold mb-2">Entrepreneurs</h3>
                  <p className="text-sm text-muted-foreground">
                    Lancez votre MVP rapidement sans équipe technique
                  </p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Développeurs</h3>
                  <p className="text-sm text-muted-foreground">
                    Accélérez vos projets avec des assistants IA
                  </p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Entreprises</h3>
                  <p className="text-sm text-muted-foreground">
                    Prototypez et testez vos idées efficacement
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🔧 Technologies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-bold mb-2">Frontend</h3>
                  <p className="text-sm">Next.js 14, React, TypeScript, Tailwind CSS</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Backend</h3>
                  <p className="text-sm">Supabase, API Routes, Auth</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">IA</h3>
                  <p className="text-sm">OpenAI GPT-4, Anthropic Claude</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Testing</h3>
                  <p className="text-sm">Playwright, Puppeteer, Screenshots</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
