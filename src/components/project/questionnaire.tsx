'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuestionnaireResponse } from '@/types';

export function ProjectQuestionnaire({
  onComplete,
}: {
  onComplete: (data: QuestionnaireResponse) => void;
}) {
  const [answers, setAnswers] = useState<Partial<QuestionnaireResponse>>({
    mainFeatures: [],
    seoKeywords: [],
    needsAuth: false,
    needsPayment: false,
    needsDatabase: true,
    needsRealtime: false,
    needsFileUpload: false,
    performancePriority: 'balanced',
    expectedTraffic: 'medium',
    specificRequirements: {},
  });

  const handleSubmit = () => {
    onComplete(answers as QuestionnaireResponse);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Questionnaire du Projet</CardTitle>
        <p className="text-sm text-muted-foreground">
          Aidez les agents IA à mieux comprendre votre projet
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Section 1: Public cible */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Qui est votre public cible ?
          </label>
          <Input
            value={answers.targetAudience || ''}
            onChange={(e) => setAnswers({ ...answers, targetAudience: e.target.value })}
            placeholder="Ex: Jeunes professionnels, gamers, entreprises..."
          />
        </div>

        {/* Section 2: Features principales */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Fonctionnalités principales (séparées par des virgules)
          </label>
          <textarea
            className="w-full p-2 border rounded-md"
            rows={3}
            value={answers.mainFeatures?.join(', ') || ''}
            onChange={(e) =>
              setAnswers({
                ...answers,
                mainFeatures: e.target.value.split(',').map((f) => f.trim()),
              })
            }
            placeholder="Ex: Chat en temps réel, Paiements, Galerie photos..."
          />
        </div>

        {/* Section 3: Préférences de design */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Préférences de design
          </label>
          <Input
            value={answers.designPreferences || ''}
            onChange={(e) => setAnswers({ ...answers, designPreferences: e.target.value })}
            placeholder="Ex: Minimaliste, moderne, coloré, sombre..."
          />
        </div>

        {/* Section 4: Couleurs */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Palette de couleurs
          </label>
          <Input
            value={answers.colorScheme || ''}
            onChange={(e) => setAnswers({ ...answers, colorScheme: e.target.value })}
            placeholder="Ex: Bleu et blanc, Rouge et noir..."
          />
        </div>

        {/* Section 5: Features techniques */}
        <div className="space-y-3">
          <p className="font-medium">Fonctionnalités techniques requises :</p>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={answers.needsAuth}
              onChange={(e) => setAnswers({ ...answers, needsAuth: e.target.checked })}
            />
            <span className="text-sm">Authentification utilisateur</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={answers.needsPayment}
              onChange={(e) => setAnswers({ ...answers, needsPayment: e.target.checked })}
            />
            <span className="text-sm">Système de paiement</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={answers.needsDatabase}
              onChange={(e) => setAnswers({ ...answers, needsDatabase: e.target.checked })}
            />
            <span className="text-sm">Base de données</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={answers.needsRealtime}
              onChange={(e) => setAnswers({ ...answers, needsRealtime: e.target.checked })}
            />
            <span className="text-sm">Temps réel (WebSocket)</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={answers.needsFileUpload}
              onChange={(e) => setAnswers({ ...answers, needsFileUpload: e.target.checked })}
            />
            <span className="text-sm">Upload de fichiers</span>
          </label>
        </div>

        {/* Section 6: SEO */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Mots-clés SEO (séparés par des virgules)
          </label>
          <Input
            value={answers.seoKeywords?.join(', ') || ''}
            onChange={(e) =>
              setAnswers({
                ...answers,
                seoKeywords: e.target.value.split(',').map((k) => k.trim()),
              })
            }
            placeholder="Ex: développement web, application mobile..."
          />
        </div>

        {/* Section 7: Régions cibles */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Régions/Pays cibles (séparés par des virgules)
          </label>
          <Input
            value={answers.targetRegions?.join(', ') || ''}
            onChange={(e) =>
              setAnswers({
                ...answers,
                targetRegions: e.target.value.split(',').map((r) => r.trim()),
              })
            }
            placeholder="Ex: France, Europe, Monde..."
          />
        </div>

        {/* Section 8: Trafic attendu */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Trafic attendu
          </label>
          <select
            className="w-full p-2 border rounded-md"
            value={answers.expectedTraffic}
            onChange={(e) =>
              setAnswers({
                ...answers,
                expectedTraffic: e.target.value as any,
              })
            }
          >
            <option value="low">Faible ({"<"}1000 visiteurs/jour)</option>
            <option value="medium">Moyen (1000-10000 visiteurs/jour)</option>
            <option value="high">Élevé (10000-100000 visiteurs/jour)</option>
            <option value="very-high">Très élevé ({">"}100000 visiteurs/jour)</option>
          </select>
        </div>

        {/* Section 9: Priorité */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Priorité de développement
          </label>
          <select
            className="w-full p-2 border rounded-md"
            value={answers.performancePriority}
            onChange={(e) =>
              setAnswers({
                ...answers,
                performancePriority: e.target.value as any,
              })
            }
          >
            <option value="speed">Vitesse (développement rapide)</option>
            <option value="balanced">Équilibré (compromis qualité/vitesse)</option>
            <option value="quality">Qualité (code optimal, plus lent)</option>
          </select>
        </div>

        <Button onClick={handleSubmit} className="w-full" size="lg">
          Valider et lancer la génération
        </Button>
      </CardContent>
    </Card>
  );
}
