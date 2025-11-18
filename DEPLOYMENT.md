# 🚀 Guide de Déploiement - CODING 2.0

Ce guide vous accompagne dans le déploiement de CODING 2.0 en production.

## 📋 Prérequis

Avant de déployer, assurez-vous d'avoir:

- ✅ Compte Supabase avec base de données configurée
- ✅ Clés API OpenAI et/ou Anthropic
- ✅ Token GitHub (pour push automatique)
- ✅ Compte Stripe (si paiements activés)
- ✅ Domaine personnalisé (optionnel)

---

## 🌐 Option 1: Déploiement sur Vercel (Recommandé)

Vercel est la solution la plus simple pour déployer Next.js.

### Étape 1: Préparer le projet

```bash
# Installer Vercel CLI
npm i -g vercel

# Login
vercel login
```

### Étape 2: Configurer les variables d'environnement

Créez un fichier `.env.production`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-jwt-secret

# IA
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
AI_PROVIDER=both

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# GitHub
GITHUB_TOKEN=ghp_...

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production

# Security
CSRF_SECRET=generate-a-random-32-character-secret-key
RATE_LIMIT_MAX=10
RATE_LIMIT_BLOCK_DURATION=60
```

### Étape 3: Déployer

```bash
# Déploiement preview
vercel

# Déploiement production
vercel --prod
```

### Étape 4: Configurer le domaine personnalisé

Dans le dashboard Vercel:
1. Settings → Domains
2. Ajouter votre domaine
3. Configurer les DNS

### Étape 5: Configurer les webhooks Stripe

1. Dashboard Stripe → Developers → Webhooks
2. Ajouter endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Sélectionner événements:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

### Configuration Auto-Deploy

Dans `.github/workflows/ci.yml`, les secrets suivants sont requis:

```bash
# Dans GitHub Settings → Secrets → Actions
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
```

---

## 🐳 Option 2: Déploiement avec Docker

### Étape 1: Build l'image

```bash
docker build -t coding2:latest \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
  --build-arg NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
  .
```

### Étape 2: Lancer le container

```bash
docker run -d \
  --name coding2-app \
  -p 3000:3000 \
  -e OPENAI_API_KEY=$OPENAI_API_KEY \
  -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \
  -e SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY \
  -e STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY \
  -e GITHUB_TOKEN=$GITHUB_TOKEN \
  --restart unless-stopped \
  coding2:latest
```

### Étape 3: Avec Docker Compose

```bash
# Créer fichier .env avec toutes les variables
cp .env.example .env
# Éditer .env avec vos vraies valeurs

# Lancer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f app

# Arrêter
docker-compose down
```

---

## ☁️ Option 3: AWS ECS/Fargate

### Architecture

```
Internet → ALB → ECS Fargate → Supabase
                              → OpenAI/Anthropic
                              → Stripe
```

### Étape 1: Push l'image sur ECR

```bash
# Login AWS ECR
aws ecr get-login-password --region eu-west-1 | \
  docker login --username AWS --password-stdin 123456789.dkr.ecr.eu-west-1.amazonaws.com

# Tag l'image
docker tag coding2:latest 123456789.dkr.ecr.eu-west-1.amazonaws.com/coding2:latest

# Push
docker push 123456789.dkr.ecr.eu-west-1.amazonaws.com/coding2:latest
```

### Étape 2: Créer ECS Task Definition

```json
{
  "family": "coding2-app",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "coding2",
      "image": "123456789.dkr.ecr.eu-west-1.amazonaws.com/coding2:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        { "name": "NODE_ENV", "value": "production" },
        { "name": "NEXT_PUBLIC_APP_URL", "value": "https://your-domain.com" }
      ],
      "secrets": [
        {
          "name": "OPENAI_API_KEY",
          "valueFrom": "arn:aws:secretsmanager:eu-west-1:123456789:secret:coding2/openai-key"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/coding2",
          "awslogs-region": "eu-west-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3000/api/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      }
    }
  ]
}
```

### Étape 3: Créer le service ECS

```bash
aws ecs create-service \
  --cluster coding2-cluster \
  --service-name coding2-service \
  --task-definition coding2-app \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=coding2,containerPort=3000"
```

---

## 🔧 Option 4: DigitalOcean App Platform

### Étape 1: Créer app.yaml

```yaml
name: coding2
region: fra
services:
  - name: web
    github:
      repo: your-username/VIBCO
      branch: main
      deploy_on_push: true
    build_command: npm run build
    run_command: npm start
    environment_slug: node-js
    instance_count: 2
    instance_size_slug: professional-xs
    envs:
      - key: NODE_ENV
        value: production
      - key: NEXT_PUBLIC_SUPABASE_URL
        value: ${SUPABASE_URL}
        type: SECRET
      - key: OPENAI_API_KEY
        value: ${OPENAI_KEY}
        type: SECRET
    health_check:
      http_path: /api/health
```

### Étape 2: Déployer

```bash
# Installer doctl
brew install doctl

# Login
doctl auth init

# Créer l'app
doctl apps create --spec app.yaml

# Voir le statut
doctl apps list
```

---

## 📊 Configuration Post-Déploiement

### 1. Migrer la base de données Supabase

```bash
# Installer Supabase CLI
npm install -g supabase

# Login
supabase login

# Lier au projet
supabase link --project-ref your-project-ref

# Appliquer les migrations
supabase db push
```

### 2. Configurer les sauvegardes

```bash
# Backup automatique quotidien (Supabase)
# → Dashboard Supabase → Database → Backups

# Pour Docker: volume persistant
docker volume create coding2-backups
```

### 3. Monitoring et Logs

#### Avec Sentry (Errors)

```bash
npm install @sentry/nextjs

# Dans .env
SENTRY_DSN=https://xxx@sentry.io/xxx
```

#### Avec Datadog (Metrics)

```bash
# Dans .env
DATADOG_API_KEY=your-api-key
DATADOG_APP_KEY=your-app-key
```

#### Avec LogTail (Logs)

```bash
# Dans .env
LOGTAIL_SOURCE_TOKEN=your-token
```

### 4. CDN et Performance

#### CloudFlare

1. Ajouter votre site sur CloudFlare
2. Configurer les DNS
3. Activer:
   - Caching automatique
   - Minification (HTML, CSS, JS)
   - Brotli compression
   - HTTP/3

#### Vercel Edge Network

- Activé par défaut avec Vercel
- CDN global automatique
- Edge Functions disponibles

---

## 🔒 Sécurité Production

### 1. Variables d'environnement

```bash
# JAMAIS commit les secrets dans Git
# Utiliser des managers de secrets:

# AWS Secrets Manager
aws secretsmanager create-secret \
  --name coding2/openai-key \
  --secret-string "sk-..."

# Vercel
vercel env add OPENAI_API_KEY

# DigitalOcean
doctl apps create-deployment your-app-id
```

### 2. Rate Limiting

Déjà configuré dans `src/lib/security/middleware.ts`:
- 10 requêtes/seconde par IP
- Block 60 secondes après dépassement

### 3. HTTPS

- Vercel: Automatique (Let's Encrypt)
- AWS: Configurer ACM Certificate sur ALB
- Docker: Utiliser nginx avec certbot

```bash
# Certbot avec Docker
docker run -it --rm \
  -v /etc/letsencrypt:/etc/letsencrypt \
  certbot/certbot certonly \
  --standalone \
  -d your-domain.com
```

### 4. CORS

Configuré dans `next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://your-domain.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
        ],
      },
    ];
  },
};
```

---

## 📈 Scaling

### Horizontal Scaling

#### Vercel
- Auto-scaling inclus
- Serverless par défaut

#### AWS ECS
```bash
# Auto-scaling policy
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/coding2-cluster/coding2-service \
  --min-capacity 2 \
  --max-capacity 10
```

#### Docker Swarm
```bash
docker service scale coding2-app=5
```

### Vertical Scaling

- Vercel: Upgrade plan (Pro, Enterprise)
- AWS: Augmenter CPU/Memory dans task definition
- Docker: Modifier `--memory` et `--cpus`

---

## 🎯 Checklist Pré-Lancement

- [ ] **Base de données**
  - [ ] Migrations appliquées
  - [ ] Row Level Security activé
  - [ ] Backup configuré
  - [ ] Indexes créés

- [ ] **APIs**
  - [ ] OpenAI/Anthropic testées
  - [ ] Stripe webhooks configurés
  - [ ] GitHub token avec bon scope

- [ ] **Sécurité**
  - [ ] HTTPS actif
  - [ ] CSRF protection
  - [ ] Rate limiting
  - [ ] CORS configuré
  - [ ] Secrets dans vault (pas .env)

- [ ] **Performance**
  - [ ] CDN configuré
  - [ ] Images optimisées
  - [ ] Caching activé
  - [ ] Lighthouse score > 90

- [ ] **Monitoring**
  - [ ] Sentry pour errors
  - [ ] Analytics (Mixpanel, GA)
  - [ ] Uptime monitoring
  - [ ] Logs centralisés

- [ ] **Tests**
  - [ ] Tests unitaires passent
  - [ ] Tests E2E passent
  - [ ] Load testing fait

- [ ] **Documentation**
  - [ ] API docs à jour
  - [ ] Guide utilisateur
  - [ ] Changelog maintenu

---

## 🆘 Rollback

### Vercel

```bash
# Liste des déploiements
vercel list

# Rollback vers deployment précédent
vercel rollback deployment-url
```

### Docker

```bash
# Revenir à l'image précédente
docker pull coding2:previous-tag
docker-compose up -d
```

### AWS ECS

```bash
# Revenir à la task definition précédente
aws ecs update-service \
  --cluster coding2-cluster \
  --service coding2-service \
  --task-definition coding2-app:previous-version
```

---

## 📞 Support

En cas de problème:

1. **Logs**: `vercel logs` ou `docker logs coding2-app`
2. **Health check**: `curl https://your-domain.com/api/health`
3. **Sentry**: Dashboard pour erreurs détaillées
4. **GitHub Issues**: Créer un ticket

---

**🎉 Votre plateforme CODING 2.0 est prête pour la production !**
