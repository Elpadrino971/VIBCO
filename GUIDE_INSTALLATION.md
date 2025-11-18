# 📖 Guide d'Installation - VibeCoding Platform

## 🎯 Prérequis

Avant de commencer, assurez-vous d'avoir :

- **Node.js** >= 18.0.0 ([Télécharger](https://nodejs.org))
- **npm** ou **yarn** ou **pnpm**
- **Git** installé
- Un compte **GitHub** ([S'inscrire](https://github.com))
- Un compte **Supabase** ([S'inscrire](https://supabase.com))
- Un compte **Stripe** si vous activez les paiements ([S'inscrire](https://stripe.com))
- Clés API **OpenAI** et/ou **Anthropic** pour les agents IA

---

## 📦 Installation

### Étape 1 : Cloner le projet

```bash
git clone <votre-repository>
cd VIBCO
```

### Étape 2 : Installer les dépendances

```bash
npm install
# ou
yarn install
# ou
pnpm install
```

### Étape 3 : Configuration des variables d'environnement

Créez un fichier `.env` à la racine du projet :

```bash
cp .env.example .env
```

Éditez le fichier `.env` avec vos propres clés :

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# GitHub
GITHUB_TOKEN=ghp_...
GITHUB_CLIENT_ID=xxxxx
GITHUB_CLIENT_SECRET=xxxxx

# OpenAI (pour les agents IA)
OPENAI_API_KEY=sk-...

# Anthropic Claude (optionnel)
ANTHROPIC_API_KEY=sk-ant-...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🔧 Configuration des Services

### 1️⃣ Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Dans **Settings > API**, copiez :
   - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

4. Créez les tables nécessaires (optionnel pour le moment) :

```sql
-- Example de table users
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

### 2️⃣ Stripe

1. Allez sur [stripe.com](https://stripe.com)
2. Dans **Developers > API Keys** :
   - Copiez **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Copiez **Secret key** → `STRIPE_SECRET_KEY`

3. Pour les webhooks (optionnel en dev) :
   - Installez le CLI Stripe : `stripe login`
   - Lancez : `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
   - Copiez le webhook secret → `STRIPE_WEBHOOK_SECRET`

### 3️⃣ GitHub

1. Allez sur [github.com/settings/tokens](https://github.com/settings/tokens)
2. Cliquez sur **Generate new token (classic)**
3. Sélectionnez les scopes :
   - ✅ `repo` (Accès complet aux repositories)
   - ✅ `workflow` (Accès aux workflows)
4. Générez et copiez le token → `GITHUB_TOKEN`

### 4️⃣ OpenAI

1. Allez sur [platform.openai.com](https://platform.openai.com)
2. Créez une clé API → `OPENAI_API_KEY`
3. Assurez-vous d'avoir des crédits

### 5️⃣ Anthropic (Optionnel)

1. Allez sur [console.anthropic.com](https://console.anthropic.com)
2. Créez une clé API → `ANTHROPIC_API_KEY`

---

## 🚀 Lancement

### Mode Développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

### Mode Production

```bash
npm run build
npm run start
```

---

## 🧪 Tests

### Tests E2E avec Playwright

```bash
# Installer Playwright
npx playwright install

# Lancer les tests
npm run test:e2e
```

---

## 📝 Utilisation de la Plateforme

### Créer un Nouveau Projet

1. Allez sur [http://localhost:3000/create](http://localhost:3000/create)

2. **Étape 1 - Configuration de base** :
   - Nom du projet
   - Description
   - Type (Site web, App mobile, Jeu)

3. **Étape 2 - Technologies** :
   - Choisissez le langage (TypeScript recommandé)
   - Choisissez le framework (Next.js recommandé)

4. **Étape 3 - Intégrations OBLIGATOIRES** :
   - ⚠️ **GitHub** : Repository URL + Token (OBLIGATOIRE)
   - ⚠️ **Supabase** : URL + Key (OBLIGATOIRE)
   - 💳 **Stripe** : Keys (OBLIGATOIRE si paiement activé)

5. **Questionnaire** :
   - Public cible
   - Fonctionnalités principales
   - Préférences de design
   - Features techniques (Auth, Paiement, Database...)
   - Mots-clés SEO
   - Trafic attendu

6. **Génération** :
   - Les 10 agents IA travaillent en parallèle
   - Suivez la progression en temps réel
   - Consultez les logs et screenshots

---

## 🤖 Les 10 Agents IA

| Agent | Rôle | Technologies |
|-------|------|--------------|
| 🎯 Project Manager | Planification et roadmap | OpenAI GPT-4 |
| 🗄️ Database | Schéma DB et migrations | Supabase + PostgreSQL |
| ⚙️ Backend | API et logique métier | Next.js API Routes |
| 🎨 Frontend | Interface utilisateur | React + Tailwind |
| 📱 Mobile | Apps mobiles | React Native / Flutter |
| 🎮 Game | Jeux vidéo | Unity / Phaser / Three.js |
| 🔍 SEO | Optimisation référencement | Next.js SEO |
| 🧪 Testing | Tests E2E + Screenshots | Playwright + Puppeteer |
| 🔒 Security | Audit sécurité | OWASP |
| 🚀 DevOps | CI/CD et déploiement | GitHub Actions |

---

## 📂 Structure du Projet Généré

```
projet-genere/
├── src/
│   ├── app/              # Pages Next.js
│   ├── components/       # Composants React
│   │   ├── ui/          # Composants UI réutilisables
│   │   └── layout/      # Layout (Navbar, Footer)
│   ├── lib/             # Utilitaires et configs
│   │   ├── supabase/    # Client Supabase
│   │   ├── stripe/      # Client Stripe
│   │   └── github/      # Client GitHub
│   ├── store/           # State management (Zustand)
│   └── types/           # Types TypeScript
├── public/
│   └── screenshots/     # Screenshots des tests
├── supabase/
│   └── migrations/      # Migrations SQL
├── tests/
│   └── e2e/            # Tests E2E
└── .github/
    └── workflows/       # CI/CD
```

---

## 🐛 Dépannage

### Erreur : Module not found

```bash
rm -rf node_modules package-lock.json
npm install
```

### Erreur : Port 3000 déjà utilisé

```bash
# Changez le port
PORT=3001 npm run dev
```

### Erreur : Supabase connection failed

- Vérifiez que vos clés Supabase sont correctes
- Vérifiez que votre projet Supabase est actif

### Erreur : GitHub API rate limit

- Vérifiez que votre token GitHub a les bons scopes
- Attendez la réinitialisation du rate limit (1h)

### Erreur : OpenAI API error

- Vérifiez votre clé API
- Vérifiez que vous avez des crédits

---

## 🔒 Sécurité

⚠️ **IMPORTANT** :

- **NE COMMITEZ JAMAIS** le fichier `.env`
- Utilisez des tokens avec les permissions minimales
- Régénérez vos tokens régulièrement
- Utilisez les secrets GitHub pour le CI/CD
- Activez l'authentification à 2 facteurs

---

## 📖 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [GitHub API Documentation](https://docs.github.com/en/rest)
- [OpenAI API Documentation](https://platform.openai.com/docs)

---

## 🆘 Support

- 📧 Email : support@vibecoding.com
- 💬 Discord : [discord.gg/vibecoding](https://discord.gg/vibecoding)
- 🐛 Issues : [GitHub Issues](https://github.com/votre-repo/issues)

---

## 📄 Licence

MIT License - Voir le fichier `LICENSE`

---

**Créé avec ❤️ par l'équipe VibeCoding**
