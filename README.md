# 🚀 CODING 2.0 Platform

<div align="center">

**La plateforme next-gen qui révolutionne le développement logiciel**

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/votre-repo)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue.svg)](https://www.typescriptlang.org/)

[Démo](https://demo.coding2.dev) · [Documentation](GUIDE_INSTALLATION.md) · [Discord](https://discord.gg/coding2)

</div>

---

## ✨ Nouveautés Coding 2.0

### 🆕 Ce qui a changé depuis VibeCoding

- **11 Agents IA** (au lieu de 10) avec le nouvel **Agent Workflow** pour automatiser N8N/Make
- **Builder Visuel de Workflows** avec ReactFlow - créez des automatisations en drag & drop
- **Sécurité Renforcée** : Rate limiting, CSP, CSRF protection, headers sécurisés
- **Performances Optimales** : Caching en mémoire, lazy loading, code splitting, PWA
- **Architecture Modulaire** : Extensible et maintenable
- **UX Améliorée** : Interface plus responsive et fluide

---

## 🤖 Les 11 Agents IA Spécialisés

| # | Agent | Rôle | Nouveauté 2.0 |
|---|-------|------|--------------|
| 1 | 🎯 **Project Manager** | Analyse et planification du projet | - |
| 2 | 🎨 **Frontend** | Interface React/Vue/Angular | ✅ Optimisé |
| 3 | ⚙️ **Backend** | API et logique métier | ✅ Plus rapide |
| 4 | 🗄️ **Database** | Schéma Supabase et migrations | - |
| 5 | 📱 **Mobile** | Apps React Native/Flutter | - |
| 6 | 🎮 **Game** | Jeux Unity/Phaser/Three.js | - |
| 7 | 🔄 **Workflow** | **NOUVEAU** - Workflows N8N/Make automatiques | 🆕 |
| 8 | 🔍 **SEO** | Optimisation référencement | ✅ Amélioré |
| 9 | 🔒 **Security** | Audit sécurité OWASP | ✅ Renforcé |
| 10 | 🧪 **Testing** | Tests E2E + Screenshots | ✅ Plus rapide |
| 11 | 🚀 **DevOps** | CI/CD et déploiement | - |

---

## 🔥 Fonctionnalités Principales

### 🎨 **Builder Visuel de Workflows**

Créez des workflows d'automatisation visuellement avec notre builder basé sur ReactFlow :

- **Drag & Drop** de nœuds (Trigger, Action, Condition, Delay, API, Database, Email...)
- **Export N8N** et **Make.com** en 1 clic
- **Import/Export JSON** pour sauvegarder vos workflows
- **Prévisualisation en temps réel**
- **Validation automatique** des connexions

```
Accédez au builder : http://localhost:3000/workflow-builder
```

### 🔒 **Sécurité de Niveau Enterprise**

- ✅ **Rate Limiting** ultra-rapide (10 req/s général, 3 req/min endpoints sensibles)
- ✅ **Content Security Policy (CSP)** strict
- ✅ **Protection CSRF** avec tokens
- ✅ **Headers sécurisés** (XSS, Clickjacking, MIME sniffing)
- ✅ **HTTPS forcé** avec HSTS
- ✅ **Détection d'activité suspecte**
- ✅ **Validation des inputs** contre injections

### ⚡ **Performances Extrêmes**

- ✅ **Cache en mémoire** avec TTL automatique
- ✅ **Debounce/Throttle** pour optimiser les appels API
- ✅ **Batch Processing** pour requêtes multiples
- ✅ **Memoization** pour fonctions pures
- ✅ **Lazy Loading** des composants
- ✅ **Code Splitting** automatique
- ✅ **Image Optimization** (WebP, AVIF)
- ✅ **PWA** avec Service Worker
- ✅ **Preload** des ressources critiques

### 🎯 **Validation Obligatoire**

Le système **FORCE** l'utilisateur à fournir :

- ⚠️ **GitHub** : Repository URL + Token (OBLIGATOIRE)
- ⚠️ **Supabase** : URL + Key (OBLIGATOIRE)
- 💳 **Stripe** : Keys (OBLIGATOIRE si paiement activé)

Impossible de continuer sans ces informations !

### 🔄 **Workflows Automatiques**

L'agent Workflow génère automatiquement :

- Workflows d'**authentification** (signup, password reset)
- Workflows de **paiement** (success, failure)
- Workflows de **notification** (email, push, SMS)
- Workflows de **maintenance** (backup quotidien)
- Workflows de **monitoring** (health checks)
- Workflows **SEO** (optimization auto)
- Workflows **CRM** (lead nurturing)

**Formats supportés** : N8N (JSON) et Make.com (JSON)

---

## 📦 Installation Rapide

### Prérequis

- Node.js >= 18.0.0
- npm/yarn/pnpm
- Comptes : GitHub, Supabase, Stripe (optionnel), OpenAI/Anthropic

### Installation

```bash
# Cloner
git clone <votre-repo>
cd VIBCO

# Installer
npm install

# Configurer
cp .env.example .env
# Éditez .env avec vos clés API

# Lancer
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

**📖 Voir le [guide d'installation complet](GUIDE_INSTALLATION.md)**

---

## 🎯 Utilisation

### 1. Créer un Projet

Allez sur `/create` et suivez les étapes :

1. **Configuration** : Nom, description, type (Web/Mobile/Game)
2. **Technologies** : Langage + Framework
3. **Intégrations** : GitHub, Supabase, Stripe (validation obligatoire)
4. **Questionnaire** : Détails du projet
5. **Génération** : Les 11 agents travaillent !

### 2. Builder de Workflows

Allez sur `/workflow-builder` pour :

- Créer des workflows visuellement
- Exporter vers N8N ou Make
- Importer des workflows existants
- Tester en temps réel

### 3. Monitoring

Suivez la progression en temps réel :

- Statut de chaque agent
- Logs détaillés
- Screenshots des tests
- Progression en %

---

## 🏗️ Architecture Technique

### Stack

- **Frontend** : Next.js 14 (App Router), React 18, TypeScript
- **UI** : Tailwind CSS, Shadcn/ui, Radix UI, ReactFlow
- **Backend** : Next.js API Routes, Supabase
- **IA** : OpenAI GPT-4, Anthropic Claude
- **Workflows** : ReactFlow, N8N, Make.com
- **Testing** : Playwright, Puppeteer
- **Sécurité** : Rate-limiter-flexible, Helmet
- **Performance** : SWR, Immer, Service Workers

### Structure

```
VIBCO/
├── src/
│   ├── agents/                    # 🤖 11 agents IA
│   │   ├── workflow-agent.ts      # 🆕 Agent Workflow N8N/Make
│   │   └── orchestrator.ts        # Coordonne tout
│   │
│   ├── app/                       # Pages Next.js
│   │   ├── workflow-builder/      # 🆕 Builder visuel
│   │   └── create/                # Création de projet
│   │
│   ├── components/
│   │   ├── workflow/              # 🆕 Composants workflow
│   │   │   └── workflow-builder.tsx
│   │   └── project/               # Composants projet
│   │
│   ├── lib/
│   │   ├── security/              # 🆕 Sécurité renforcée
│   │   │   └── middleware.ts
│   │   ├── performance/           # 🆕 Optimisations
│   │   │   └── optimizations.ts
│   │   ├── github/
│   │   ├── supabase/
│   │   └── stripe/
│   │
│   └── middleware.ts              # 🆕 Middleware global
│
└── public/
    └── screenshots/               # Screenshots tests
```

---

## 🔐 Sécurité

### Headers Sécurisés

```
✅ Content-Security-Policy (CSP) strict
✅ X-XSS-Protection
✅ X-Content-Type-Options: nosniff
✅ X-Frame-Options: DENY
✅ Strict-Transport-Security (HSTS)
✅ Referrer-Policy
✅ Permissions-Policy
```

### Rate Limiting

```
Endpoints publics : 10 req/s par IP
Endpoints sensibles : 3 req/min par IP
Par utilisateur : 100 req/h
```

### CSRF Protection

Tous les endpoints non-GET requièrent un token CSRF valide.

---

## ⚡ Performances

### Métriques Cibles

- **First Contentful Paint (FCP)** : < 1.5s
- **Largest Contentful Paint (LCP)** : < 2.5s
- **Time to Interactive (TTI)** : < 3.5s
- **Cumulative Layout Shift (CLS)** : < 0.1

### Optimisations

- Cache en mémoire avec cleanup automatique
- Compression Brotli/Gzip
- Lazy loading des composants
- Code splitting par route
- Images optimisées (WebP/AVIF)
- Fonts préchargées
- PWA avec offline support

---

## 📊 Différences VibeCoding vs Coding 2.0

| Feature | VibeCoding | Coding 2.0 |
|---------|------------|------------|
| Agents IA | 10 | **11** (+Workflow) |
| Builder Visuel | ❌ | ✅ ReactFlow |
| Rate Limiting | ❌ | ✅ Avancé |
| CSRF Protection | ❌ | ✅ |
| CSP Headers | ❌ | ✅ Strict |
| Caching | Basique | ✅ Avancé |
| PWA | ❌ | ✅ |
| Workflows N8N | ❌ | ✅ |
| Workflows Make | ❌ | ✅ |
| Performance | Bon | **Excellent** |
| Sécurité | Basique | **Enterprise** |

---

## 🚀 Déploiement

### Vercel (Recommandé)

```bash
npm i -g vercel
vercel
```

### Autres Plateformes

- **Netlify** ✅
- **Railway** ✅
- **DigitalOcean** ✅
- **AWS Amplify** ✅

---

## 📝 Variables d'Environnement

```bash
# Supabase (OBLIGATOIRE)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe (OBLIGATOIRE si paiement)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# GitHub (OBLIGATOIRE)
GITHUB_TOKEN=

# IA (OBLIGATOIRE)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🤝 Contribution

Voir [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 📄 Licence

MIT License - Voir [LICENSE](LICENSE)

---

## 📞 Support

- 📧 Email : support@coding2.dev
- 💬 Discord : [discord.gg/coding2](https://discord.gg/coding2)
- 🐛 Issues : [GitHub Issues](https://github.com/votre-repo/issues)
- 📖 Docs : [docs.coding2.dev](https://docs.coding2.dev)

---

## 🌟 Roadmap 2.0

- [ ] Intégration Zapier
- [ ] Support GraphQL
- [ ] Mode offline complet
- [ ] Collaboration temps réel
- [ ] Templates marketplace
- [ ] API publique
- [ ] CLI tool
- [ ] VS Code extension

---

<div align="center">

**Créé avec ⚡ par Coding 2.0 Team**

Passez au niveau supérieur du développement logiciel

[⭐ Star sur GitHub](https://github.com/votre-repo) · [🐦 Suivez-nous](https://twitter.com/coding2dev)

</div>
