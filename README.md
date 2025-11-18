# 🚀 VibeCoding Platform

Une plateforme révolutionnaire de génération de sites web, applications mobiles et jeux vidéo pilotée par **10 agents IA spécialisés**.

## ✨ Fonctionnalités

### 🤖 10 Agents IA Spécialisés

1. **Agent Project Manager** - Analyse et planification du projet
2. **Agent Frontend** - Développement interface utilisateur (React, Vue, Angular)
3. **Agent Backend** - API et logique serveur (Node.js, Python, Go)
4. **Agent Database** - Architecture et optimisation base de données
5. **Agent Mobile** - Apps React Native / Flutter
6. **Agent Game** - Développement jeux (Unity, Phaser, Three.js)
7. **Agent SEO** - Optimisation référencement et performance
8. **Agent Testing** - Tests automatisés E2E avec screenshots
9. **Agent Security** - Audit sécurité et vulnérabilités
10. **Agent DevOps** - Déploiement et CI/CD

### 🔧 Intégrations Obligatoires

- **GitHub** - Gestion de code et versionning
- **Supabase** - Base de données, Auth, Storage
- **Stripe** - Paiements (si nécessaire)

### 🎯 Capacités

- Génération complète de sites web
- Création d'applications mobiles
- Développement de jeux vidéo
- Tests automatisés avec screenshots
- Débogage intelligent
- Choix du langage de programmation
- Questionnaire détaillé avant génération

## 🛠️ Technologies

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI**: Tailwind CSS + Shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **AI**: OpenAI GPT-4 + Anthropic Claude
- **Testing**: Playwright (screenshots)
- **Version Control**: GitHub API

## 🚀 Installation

```bash
# Clone le projet
git clone <votre-repo>
cd VIBCO

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos clés API

# Lancer en mode développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## 📋 Configuration Requise

### 1. Supabase
- Créer un projet sur [supabase.com](https://supabase.com)
- Copier URL et clés API dans `.env`

### 2. Stripe
- Créer un compte sur [stripe.com](https://stripe.com)
- Récupérer clés publishable et secret

### 3. GitHub
- Créer un token personnel sur [github.com/settings/tokens](https://github.com/settings/tokens)
- Permissions: `repo`, `workflow`

### 4. OpenAI
- Obtenir une clé API sur [platform.openai.com](https://platform.openai.com)

### 5. Anthropic (Optionnel)
- Clé API pour Claude sur [console.anthropic.com](https://console.anthropic.com)

## 📚 Structure du Projet

```
VIBCO/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # Composants React
│   ├── lib/             # Utilitaires et configs
│   ├── agents/          # 10 Agents IA
│   ├── types/           # Types TypeScript
│   └── hooks/           # React Hooks personnalisés
├── public/
│   └── screenshots/     # Screenshots des tests
├── supabase/
│   └── migrations/      # Migrations DB
└── tests/               # Tests E2E
```

## 🎮 Utilisation

1. **Créer un nouveau projet**
2. **Fournir les informations obligatoires** :
   - URL du repo GitHub
   - Clés Supabase
   - Clés Stripe (si paiement)
3. **Répondre au questionnaire** sur le projet
4. **Choisir le langage** de programmation
5. **Lancer la génération** avec les 10 agents IA
6. **Suivre la progression** en temps réel avec screenshots

## 🔒 Sécurité

- Toutes les clés API sont stockées de manière sécurisée
- Authentification Supabase
- Validation des entrées utilisateur
- Protection CSRF
- Headers de sécurité

## 📄 Licence

MIT

## 🤝 Contribution

Les contributions sont les bienvenues ! Ouvrez une issue ou PR.

---

Créé avec ❤️ par VibeCoding
