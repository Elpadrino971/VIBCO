# 🚀 PLAN DE DÉPLOIEMENT COMPLET - CODING 2.0

Plan d'action détaillé pour déployer CODING 2.0 en production en **moins de 2 heures**.

---

## 📋 Vue d'Ensemble

```
Temps estimé: 1h30 - 2h00
Difficulté: Intermédiaire
Coût initial: ~50-100€/mois (selon le plan choisi)
```

---

## PHASE 1: PRÉPARATION (15 min)

### ✅ Checklist des Comptes Requis

Créer les comptes suivants (si pas déjà fait):

- [ ] **Supabase** - https://supabase.com/dashboard
  - Plan: Free (gratuit) ou Pro (25$/mois)
  - Créer un nouveau projet
  - Noter: Project URL + anon key + service role key

- [ ] **OpenAI** - https://platform.openai.com
  - Ajouter méthode de paiement
  - Créer API key
  - Définir spending limit: 50-100$/mois recommandé

- [ ] **Anthropic** - https://console.anthropic.com
  - Ajouter méthode de paiement
  - Créer API key
  - Définir spending limit: 50-100$/mois recommandé

- [ ] **GitHub** - https://github.com
  - Créer Personal Access Token
  - Scopes requis: `repo`, `workflow`, `write:packages`

- [ ] **Stripe** - https://dashboard.stripe.com
  - Créer compte (ou utiliser existant)
  - Activer mode Test d'abord
  - Noter: Publishable key + Secret key

- [ ] **Vercel** - https://vercel.com
  - Créer compte avec GitHub OAuth
  - Plan: Hobby (gratuit) ou Pro (20$/mois)

### 💰 Budget Estimé

| Service | Plan | Coût Mensuel |
|---------|------|--------------|
| Supabase | Pro | 25$ |
| OpenAI API | Usage | 30-100$ |
| Anthropic API | Usage | 30-100$ |
| Vercel | Pro | 20$ |
| Stripe | Commission | 0$ (2.9% + 0.30€/transaction) |
| **Total** | | **~105-245$/mois** |

> Note: Plan Free possible pour tests (Supabase Free + Vercel Hobby + limites API)

---

## PHASE 2: CONFIGURATION SUPABASE (20 min)

### Étape 1: Créer le Projet Supabase

```bash
# 1. Aller sur https://supabase.com/dashboard
# 2. Cliquer "New Project"
# 3. Remplir:
#    - Name: coding-2-0-production
#    - Database Password: [générer un mot de passe fort]
#    - Region: Europe West (Paris) ou proche de vos users
#    - Plan: Free (pour commencer) ou Pro

# 4. Attendre 2-3 minutes que le projet soit créé
```

### Étape 2: Noter les Credentials

Dans Dashboard → Settings → API:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (secret!)
```

Dans Dashboard → Settings → Database:

```env
SUPABASE_JWT_SECRET=your-super-secret-jwt-token
```

### Étape 3: Appliquer le Schema SQL

**Option A: Via Dashboard (Simple)**

1. Aller dans SQL Editor
2. Copier tout le contenu de `supabase/migrations/001_initial_schema.sql`
3. Coller dans l'éditeur
4. Cliquer "Run"
5. Vérifier qu'il n'y a pas d'erreurs

**Option B: Via CLI (Recommandé)**

```bash
# Installer Supabase CLI
npm install -g supabase

# Login
supabase login

# Lier au projet
supabase link --project-ref xxxxx

# Appliquer les migrations
supabase db push
```

### Étape 4: Vérifier les Tables

Dans Dashboard → Table Editor, vérifier que ces tables existent:

- ✅ `profiles`
- ✅ `projects`
- ✅ `agent_executions`
- ✅ `workflows`
- ✅ `api_usage`

### Étape 5: Configurer l'Authentification

Dans Dashboard → Authentication → Providers:

1. **Email** - Activé par défaut ✅
2. **Google OAuth**
   - Activer
   - Créer OAuth app: https://console.cloud.google.com/apis/credentials
   - Copier Client ID + Secret
   - Callback URL: `https://xxxxx.supabase.co/auth/v1/callback`
3. **GitHub OAuth**
   - Activer
   - Créer OAuth app: https://github.com/settings/developers
   - Callback URL: `https://xxxxx.supabase.co/auth/v1/callback`

### Étape 6: Configurer le Storage (Optionnel)

Dans Dashboard → Storage:

```sql
-- Créer bucket pour screenshots
CREATE BUCKET IF NOT EXISTS screenshots
  WITH (public = false);

-- Policy pour authenticated users
CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'screenshots');
```

---

## PHASE 3: CONFIGURATION DES VARIABLES D'ENVIRONNEMENT (10 min)

### Étape 1: Créer le fichier .env local

```bash
# Copier le template
cp .env.example .env.local

# Éditer
nano .env.local
```

### Étape 2: Remplir TOUTES les Variables

```env
# ===========================================
# SUPABASE (OBLIGATOIRE)
# ===========================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-super-secret-jwt-token

# ===========================================
# IA APIs (OBLIGATOIRE - au moins une)
# ===========================================
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-api03-...
AI_PROVIDER=both

# ===========================================
# STRIPE (OBLIGATOIRE si paiements)
# ===========================================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ===========================================
# GITHUB (OBLIGATOIRE)
# ===========================================
GITHUB_TOKEN=ghp_...
NEXT_PUBLIC_GITHUB_CLIENT_ID=Iv1...
GITHUB_CLIENT_SECRET=...

# ===========================================
# APP CONFIG
# ===========================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# ===========================================
# SÉCURITÉ
# ===========================================
# Générer avec: openssl rand -base64 32
CSRF_SECRET=générer-avec-openssl-rand-base64-32

# ===========================================
# RATE LIMITING
# ===========================================
RATE_LIMIT_MAX=10
RATE_LIMIT_BLOCK_DURATION=60

# ===========================================
# MONITORING (OPTIONNEL)
# ===========================================
SENTRY_DSN=https://xxx@sentry.io/xxx
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
MIXPANEL_TOKEN=...
```

### Étape 3: Générer les Secrets

```bash
# CSRF Secret
openssl rand -base64 32

# Ou si pas d'openssl:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Étape 4: Tester Localement

```bash
# Installer les dépendances
npm install

# Lancer en dev
npm run dev

# Ouvrir http://localhost:3000
# Vérifier que la page charge sans erreur
```

---

## PHASE 4: TESTS EN LOCAL (15 min)

### Étape 1: Tests Unitaires

```bash
# Lancer les tests
npm test

# Avec coverage
npm test -- --coverage

# Résultat attendu: All tests pass ✅
```

### Étape 2: Tests E2E

```bash
# Installer Playwright browsers
npx playwright install

# Lancer les tests E2E
npm run test:e2e

# Résultat attendu: All tests pass ✅
```

### Étape 3: Build de Production

```bash
# Build
npm run build

# Vérifier qu'il n'y a pas d'erreurs TypeScript
# Résultat attendu: Build successful ✅
```

### Étape 4: Test Manuel

Tester manuellement:

- [ ] Page d'accueil charge
- [ ] Navigation fonctionne
- [ ] Workflow builder s'affiche
- [ ] Formulaire de création projet valide les champs

---

## PHASE 5: DÉPLOIEMENT PRODUCTION (30 min)

### 🎯 Option A: Vercel (RECOMMANDÉ - Le Plus Simple)

#### Étape 1: Installer Vercel CLI

```bash
npm install -g vercel
```

#### Étape 2: Login

```bash
vercel login
```

#### Étape 3: Lier le Projet

```bash
# Dans le dossier du projet
vercel link

# Suivre les prompts:
# - Set up and deploy? Yes
# - Which scope? [Votre compte]
# - Link to existing project? No
# - Project name? coding-2-0
# - Directory? ./
```

#### Étape 4: Configurer les Variables d'Environnement

```bash
# Méthode 1: Via CLI (recommandé pour secrets)
vercel env add OPENAI_API_KEY
# Coller la valeur quand demandé
# Sélectionner: Production, Preview, Development

vercel env add ANTHROPIC_API_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add STRIPE_SECRET_KEY
vercel env add GITHUB_TOKEN
vercel env add CSRF_SECRET
vercel env add SUPABASE_JWT_SECRET

# Méthode 2: Via Dashboard (pour variables publiques)
# https://vercel.com/[votre-compte]/coding-2-0/settings/environment-variables
```

Variables à ajouter (via Dashboard ou CLI):

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_JWT_SECRET
OPENAI_API_KEY
ANTHROPIC_API_KEY
AI_PROVIDER
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
GITHUB_TOKEN
NEXT_PUBLIC_GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
NEXT_PUBLIC_APP_URL (mettre https://coding-2-0.vercel.app)
NODE_ENV (mettre production)
CSRF_SECRET
RATE_LIMIT_MAX
RATE_LIMIT_BLOCK_DURATION
```

#### Étape 5: Déployer

```bash
# Preview deployment (test)
vercel

# Production deployment
vercel --prod
```

#### Étape 6: Configurer le Domaine Personnalisé (Optionnel)

```bash
# Via CLI
vercel domains add votredomaine.com

# Ou via Dashboard:
# Settings → Domains → Add
```

Configurer les DNS chez votre registrar:

```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

#### Étape 7: Vérifier le Déploiement

```bash
# Ouvrir l'URL donnée par Vercel
# Exemple: https://coding-2-0.vercel.app

# Tester:
# - Page charge ✅
# - HTTPS actif ✅
# - Pas d'erreurs console ✅
```

---

### 🐳 Option B: Docker + VPS

#### Étape 1: Préparer le VPS

```bash
# Se connecter au VPS
ssh root@your-server-ip

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Installer Docker Compose
apt-get install docker-compose-plugin
```

#### Étape 2: Cloner le Projet

```bash
# Sur le VPS
git clone https://github.com/Elpadrino971/VIBCO.git
cd VIBCO
git checkout claude/vibecoding-platform-01UNBYkpHpMnHBuxT6fFNadz
```

#### Étape 3: Configurer les Variables

```bash
# Créer .env
cp .env.example .env
nano .env

# Remplir TOUTES les variables comme ci-dessus
# IMPORTANT: Changer NEXT_PUBLIC_APP_URL vers votre domaine
```

#### Étape 4: Build et Lancer

```bash
# Build
docker-compose build

# Lancer
docker-compose up -d

# Vérifier les logs
docker-compose logs -f app
```

#### Étape 5: Configurer Nginx (Reverse Proxy)

```bash
# Installer Nginx
apt-get install nginx

# Créer config
nano /etc/nginx/sites-available/coding2
```

```nginx
server {
    listen 80;
    server_name votredomaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Activer le site
ln -s /etc/nginx/sites-available/coding2 /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### Étape 6: Configurer HTTPS (Let's Encrypt)

```bash
# Installer Certbot
apt-get install certbot python3-certbot-nginx

# Obtenir certificat
certbot --nginx -d votredomaine.com

# Auto-renewal est configuré automatiquement
```

---

## PHASE 6: POST-DÉPLOIEMENT (20 min)

### Étape 1: Configurer Stripe Webhooks

1. Aller sur https://dashboard.stripe.com/webhooks
2. Cliquer "Add endpoint"
3. URL: `https://votredomaine.com/api/webhooks/stripe`
4. Sélectionner événements:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copier le **Signing Secret** → Variable `STRIPE_WEBHOOK_SECRET`
6. Redéployer avec la nouvelle variable

### Étape 2: Configurer GitHub OAuth

1. Aller sur https://github.com/settings/developers
2. New OAuth App
3. Remplir:
   - Name: Coding 2.0 Production
   - Homepage URL: `https://votredomaine.com`
   - Callback URL: `https://[votre-supabase-id].supabase.co/auth/v1/callback`
4. Copier Client ID + Secret
5. Ajouter dans Supabase Dashboard → Auth → Providers → GitHub

### Étape 3: Configurer Google OAuth

1. https://console.cloud.google.com/apis/credentials
2. Create Credentials → OAuth 2.0 Client ID
3. Application type: Web application
4. Authorized redirect URIs: `https://[votre-supabase-id].supabase.co/auth/v1/callback`
5. Copier Client ID + Secret
6. Ajouter dans Supabase Dashboard → Auth → Providers → Google

### Étape 4: Configurer le Monitoring

#### A. Sentry (Errors)

```bash
# Créer compte sur https://sentry.io
# Créer nouveau projet Next.js
# Copier DSN

# Ajouter variable
vercel env add SENTRY_DSN

# Installer
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

#### B. Google Analytics

```bash
# Créer propriété GA4
# Copier Measurement ID

# Ajouter variable
vercel env add NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
```

#### C. Uptime Monitoring

Services recommandés (gratuits):
- UptimeRobot: https://uptimerobot.com
- BetterUptime: https://betteruptime.com

Configurer:
- URL: `https://votredomaine.com`
- Interval: 5 minutes
- Alerts: Email + SMS

### Étape 5: Configurer les Backups

#### Supabase Backups

Dans Supabase Dashboard → Database → Backups:
- Plan Pro: Backups quotidiens automatiques (7 jours)
- Plan Free: Export manuel recommandé 1x/semaine

```bash
# Export manuel via CLI
supabase db dump -f backup-$(date +%Y%m%d).sql
```

### Étape 6: Performance & SEO

#### A. Vérifier Lighthouse Score

```bash
# Installer Lighthouse CI
npm install -g @lhci/cli

# Tester
lhci autorun --collect.url=https://votredomaine.com
```

Objectifs:
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

#### B. Sitemap

Créer `public/sitemap.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://votredomaine.com</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://votredomaine.com/about</loc>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://votredomaine.com/workflow-builder</loc>
    <priority>0.8</priority>
  </url>
</urlset>
```

Soumettre à Google Search Console.

---

## PHASE 7: SÉCURITÉ (10 min)

### Checklist Sécurité

- [ ] **HTTPS actif** (Let's Encrypt ou Vercel auto)
- [ ] **Variables secrètes** ne sont PAS dans le code
- [ ] **CSRF protection** activée (déjà dans middleware)
- [ ] **Rate limiting** configuré (10 req/s par IP)
- [ ] **RLS Supabase** activé sur toutes les tables
- [ ] **CORS** configuré uniquement pour votre domaine
- [ ] **Headers de sécurité** configurés (CSP, X-Frame-Options)

### Tester la Sécurité

```bash
# Scan de sécurité avec npm audit
npm audit

# Scan avec Snyk (gratuit)
npm install -g snyk
snyk auth
snyk test
```

### Headers de Sécurité (Vercel)

Créer `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ]
}
```

---

## PHASE 8: VALIDATION FINALE (10 min)

### ✅ Checklist de Validation

#### Fonctionnalités

- [ ] Page d'accueil charge correctement
- [ ] Navigation entre pages fonctionne
- [ ] Signup/Login fonctionne (email + OAuth)
- [ ] Création de projet valide les champs obligatoires
- [ ] Workflow builder s'affiche
- [ ] 11 agents IA sont visibles sur la homepage

#### Performance

- [ ] Lighthouse Performance > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Time to Interactive < 3.5s

#### Sécurité

- [ ] HTTPS actif (cadenas vert)
- [ ] Aucune erreur console
- [ ] Aucune API key visible dans le code source
- [ ] Rate limiting fonctionne (tester 20 requêtes rapides)

#### Base de Données

- [ ] Tables créées dans Supabase
- [ ] RLS activé
- [ ] Connexion fonctionne depuis l'app

#### APIs

- [ ] OpenAI répond (tester génération)
- [ ] Anthropic répond (tester génération)
- [ ] Stripe checkout fonctionne (mode test)
- [ ] GitHub API fonctionne

#### Monitoring

- [ ] Sentry capture les erreurs
- [ ] Google Analytics reçoit des événements
- [ ] Uptime monitoring actif

---

## 📊 MONITORING POST-LANCEMENT

### Métriques à Surveiller (Jour 1-7)

#### Technique

- **Uptime**: Doit être > 99.9%
- **Response time**: < 500ms (P95)
- **Error rate**: < 0.1%
- **Build time**: < 2 minutes

#### Business

- **Signups**: Nombre d'inscriptions
- **Activations**: % qui créent un projet
- **Retention D1**: % qui reviennent le lendemain
- **API Usage**: Coût OpenAI + Anthropic par jour

### Alerts à Configurer

```
1. Downtime > 5 min → Email + SMS
2. Error rate > 1% → Email
3. Response time > 2s → Email
4. API cost > 50$/jour → Email
5. Database size > 80% → Email
```

---

## 🚨 PLAN DE ROLLBACK

En cas de problème critique:

### Vercel

```bash
# Voir les déploiements
vercel list

# Rollback vers version précédente
vercel rollback [deployment-url]
```

### Docker

```bash
# Revenir à l'image précédente
docker-compose down
docker pull coding2:previous-tag
docker-compose up -d
```

### Base de Données

```bash
# Restore depuis backup
supabase db dump -f backup-latest.sql
psql -h db.xxx.supabase.co -U postgres < backup-latest.sql
```

---

## 📞 SUPPORT

### Logs de Debug

**Vercel:**
```bash
vercel logs
vercel logs --follow
```

**Docker:**
```bash
docker-compose logs -f app
docker-compose logs --tail=100 app
```

**Supabase:**
- Dashboard → Logs → Query Logs

### Ressources

- **Documentation Vercel**: https://vercel.com/docs
- **Documentation Supabase**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Support Discord**: (créer un serveur communauté)

---

## 🎉 FÉLICITATIONS!

Si vous avez suivi toutes les étapes, **CODING 2.0 est maintenant en PRODUCTION**! 🚀

### Prochaines Étapes

1. **Tester avec vrais utilisateurs** (beta testers)
2. **Collecter feedback**
3. **Itérer et améliorer**
4. **Préparer launch Product Hunt**
5. **Commencer marketing** (SEO, ads, content)

### Timeline Post-Lancement

**Semaine 1:**
- Monitoring 24/7
- Fix des bugs critiques
- Optimisation performance

**Semaine 2-4:**
- Ajouter features demandées
- Améliorer UX
- Augmenter limites si besoin

**Mois 2:**
- Launch Product Hunt
- Première campagne marketing
- Objectif: 100-500 signups

**Mois 3-6:**
- Scale infrastructure
- Ajouter plans payants
- Objectif: 1000+ users, premiers revenus

---

**Bon lancement! 🎊**

*Des questions? Consultez `DEPLOYMENT.md` pour plus de détails techniques.*
