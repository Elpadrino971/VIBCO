'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectType, ProgrammingLanguage, Framework } from '@/types';

interface FormData {
  name: string;
  description: string;
  type: ProjectType;
  language: ProgrammingLanguage;
  framework: Framework;

  // Intégrations obligatoires
  githubRepo: string;
  githubToken: string;
  supabaseUrl: string;
  supabaseKey: string;

  // Stripe (optionnel mais obligatoire si paiement activé)
  needsPayment: boolean;
  stripePublishableKey: string;
  stripeSecretKey: string;
}

export function CreateProjectForm({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<FormData>>({
    needsPayment: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'Le nom est obligatoire';
    if (!formData.description) newErrors.description = 'La description est obligatoire';
    if (!formData.type) newErrors.type = 'Le type de projet est obligatoire';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.language) newErrors.language = 'Le langage est obligatoire';
    if (!formData.framework) newErrors.framework = 'Le framework est obligatoire';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};

    // Validation GitHub (OBLIGATOIRE)
    if (!formData.githubRepo) {
      newErrors.githubRepo = '⚠️ GitHub repository est OBLIGATOIRE';
    }
    if (!formData.githubToken) {
      newErrors.githubToken = '⚠️ GitHub token est OBLIGATOIRE';
    }

    // Validation Supabase (OBLIGATOIRE)
    if (!formData.supabaseUrl) {
      newErrors.supabaseUrl = '⚠️ Supabase URL est OBLIGATOIRE';
    }
    if (!formData.supabaseKey) {
      newErrors.supabaseKey = '⚠️ Supabase Key est OBLIGATOIRE';
    }

    // Validation Stripe (OBLIGATOIRE SI paiement activé)
    if (formData.needsPayment) {
      if (!formData.stripePublishableKey) {
        newErrors.stripePublishableKey = '⚠️ Stripe Publishable Key OBLIGATOIRE pour les paiements';
      }
      if (!formData.stripeSecretKey) {
        newErrors.stripeSecretKey = '⚠️ Stripe Secret Key OBLIGATOIRE pour les paiements';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = false;

    if (step === 1) isValid = validateStep1();
    else if (step === 2) isValid = validateStep2();
    else if (step === 3) isValid = validateStep3();

    if (isValid) {
      if (step < 3) {
        setStep(step + 1);
      } else {
        onSubmit(formData as FormData);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          Créer un nouveau projet - Étape {step}/3
        </CardTitle>
        <div className="flex gap-2 mt-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded ${
                s <= step ? 'bg-primary' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Étape 1: Informations de base */}
        {step === 1 && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">
                Nom du projet *
              </label>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Mon super projet"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description *
              </label>
              <textarea
                className="w-full p-2 border rounded-md"
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Décrivez votre projet..."
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Type de projet *
              </label>
              <select
                className="w-full p-2 border rounded-md"
                value={formData.type || ''}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ProjectType })}
              >
                <option value="">Sélectionnez...</option>
                <option value="website">Site Web</option>
                <option value="web-app">Application Web</option>
                <option value="mobile-app">Application Mobile</option>
                <option value="game">Jeu Vidéo</option>
                <option value="custom">Personnalisé</option>
              </select>
              {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
            </div>
          </>
        )}

        {/* Étape 2: Technologies */}
        {step === 2 && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">
                Langage de programmation *
              </label>
              <select
                className="w-full p-2 border rounded-md"
                value={formData.language || ''}
                onChange={(e) => setFormData({ ...formData, language: e.target.value as ProgrammingLanguage })}
              >
                <option value="">Sélectionnez...</option>
                <option value="typescript">TypeScript (Recommandé)</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
                <option value="java">Java</option>
                <option value="csharp">C#</option>
              </select>
              {errors.language && <p className="text-red-500 text-sm mt-1">{errors.language}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Framework *
              </label>
              <select
                className="w-full p-2 border rounded-md"
                value={formData.framework || ''}
                onChange={(e) => setFormData({ ...formData, framework: e.target.value as Framework })}
              >
                <option value="">Sélectionnez...</option>
                <optgroup label="Web">
                  <option value="next.js">Next.js (Recommandé)</option>
                  <option value="react">React</option>
                  <option value="vue">Vue.js</option>
                  <option value="angular">Angular</option>
                  <option value="svelte">Svelte</option>
                </optgroup>
                <optgroup label="Mobile">
                  <option value="react-native">React Native</option>
                  <option value="flutter">Flutter</option>
                </optgroup>
                <optgroup label="Jeux">
                  <option value="unity">Unity</option>
                  <option value="phaser">Phaser</option>
                  <option value="three.js">Three.js</option>
                </optgroup>
              </select>
              {errors.framework && <p className="text-red-500 text-sm mt-1">{errors.framework}</p>}
            </div>
          </>
        )}

        {/* Étape 3: Intégrations OBLIGATOIRES */}
        {step === 3 && (
          <>
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md mb-4">
              <p className="font-bold text-yellow-800">⚠️ Intégrations Obligatoires</p>
              <p className="text-sm text-yellow-700 mt-1">
                GitHub, Supabase et Stripe (si paiement) sont requis pour utiliser la plateforme.
              </p>
            </div>

            {/* GitHub */}
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-bold mb-2">🔵 GitHub (OBLIGATOIRE)</h3>

              <div className="mb-3">
                <label className="block text-sm font-medium mb-2">
                  Repository URL *
                </label>
                <Input
                  value={formData.githubRepo || ''}
                  onChange={(e) => setFormData({ ...formData, githubRepo: e.target.value })}
                  placeholder="https://github.com/user/repo ou user/repo"
                />
                {errors.githubRepo && <p className="text-red-500 text-sm mt-1">{errors.githubRepo}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  GitHub Token *
                </label>
                <Input
                  type="password"
                  value={formData.githubToken || ''}
                  onChange={(e) => setFormData({ ...formData, githubToken: e.target.value })}
                  placeholder="ghp_xxxxxxxxxxxxx"
                />
                {errors.githubToken && <p className="text-red-500 text-sm mt-1">{errors.githubToken}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  Créez un token sur: github.com/settings/tokens
                </p>
              </div>
            </div>

            {/* Supabase */}
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-bold mb-2">🟢 Supabase (OBLIGATOIRE)</h3>

              <div className="mb-3">
                <label className="block text-sm font-medium mb-2">
                  Supabase URL *
                </label>
                <Input
                  value={formData.supabaseUrl || ''}
                  onChange={(e) => setFormData({ ...formData, supabaseUrl: e.target.value })}
                  placeholder="https://xxx.supabase.co"
                />
                {errors.supabaseUrl && <p className="text-red-500 text-sm mt-1">{errors.supabaseUrl}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Supabase Anon Key *
                </label>
                <Input
                  type="password"
                  value={formData.supabaseKey || ''}
                  onChange={(e) => setFormData({ ...formData, supabaseKey: e.target.value })}
                  placeholder="eyJxxx..."
                />
                {errors.supabaseKey && <p className="text-red-500 text-sm mt-1">{errors.supabaseKey}</p>}
              </div>
            </div>

            {/* Stripe */}
            <div className="border-l-4 border-purple-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold">🟣 Stripe</h3>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.needsPayment || false}
                    onChange={(e) => setFormData({ ...formData, needsPayment: e.target.checked })}
                  />
                  Activer les paiements
                </label>
              </div>

              {formData.needsPayment && (
                <>
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-2">
                      Stripe Publishable Key *
                    </label>
                    <Input
                      value={formData.stripePublishableKey || ''}
                      onChange={(e) => setFormData({ ...formData, stripePublishableKey: e.target.value })}
                      placeholder="pk_test_xxx"
                    />
                    {errors.stripePublishableKey && (
                      <p className="text-red-500 text-sm mt-1">{errors.stripePublishableKey}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Stripe Secret Key *
                    </label>
                    <Input
                      type="password"
                      value={formData.stripeSecretKey || ''}
                      onChange={(e) => setFormData({ ...formData, stripeSecretKey: e.target.value })}
                      placeholder="sk_test_xxx"
                    />
                    {errors.stripeSecretKey && (
                      <p className="text-red-500 text-sm mt-1">{errors.stripeSecretKey}</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
          >
            Précédent
          </Button>

          <Button onClick={handleNext}>
            {step === 3 ? 'Créer le projet' : 'Suivant'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
