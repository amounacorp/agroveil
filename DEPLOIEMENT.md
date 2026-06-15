# AgroVeil — Guide de redéploiement serveur

Ce document décrit l'intégralité du stack serveur AgroVeil et les étapes pour
le reproduire sur un nouveau serveur depuis zéro.

---

## Serveur actuel

| Élément          | Valeur                                          |
|------------------|-------------------------------------------------|
| Provider         | Google Cloud Platform (GCP)                     |
| Zone             | `us-central1-c`                                 |
| Nom              | `cortex-agents.com`                             |
| IP publique      | `35.224.208.173`                                |
| OS               | Ubuntu 26.04 LTS                                |
| CPU / RAM        | 2 vCPUs / 3.8 GB RAM                           |
| Disque           | 77 GB (70 GB libres)                            |
| Utilisateur SSH  | `root`                                          |
| Clé SSH          | `C:\SQL2022\projects\ssh_key_finova\as-key-openssh` |

```bash
ssh -i C:\SQL2022\projects\ssh_key_finova\as-key-openssh root@35.224.208.173
```

---

## Architecture globale

```
Internet
   │
   ▼
Nginx 1.28 (reverse proxy + SSL)
   │
   ├── cortex-agents.com/           → Next.js (port 3000, PM2)
   ├── cortex-agents.com/gateway    → Cortex WebSocket (port 4242)
   │
   ├── cortex-agents.com/agroveil/api/   → FastAPI AgroVeil (Docker, port 8000)
   ├── cortex-agents.com/agroveil/ws/    → WebSocket AgroVeil  (Docker, port 8000)
   ├── cortex-agents.com/agroveil/admin/ → React Admin (fichiers statiques)
   ├── cortex-agents.com/agroveil/portail/ → React Portail (fichiers statiques)
   └── cortex-agents.com/agroveil/media/ → MinIO S3 (Docker, port 9000)

Docker Network : agroveil_network
   ├── agroveil_postgres  (TimescaleDB/PG16, port interne 5432)
   ├── agroveil_redis     (Redis 7, port interne 6379)
   ├── agroveil_minio     (MinIO, ports internes 9000/9001)
   └── agroveil_api       (FastAPI, port interne 8000)

Fichiers statiques (servis par Nginx) :
   ├── /opt/agroveil/frontend/admin/dist/
   └── /opt/agroveil/frontend/portail/dist/
```

---

## Répertoire du projet sur le serveur

```
/opt/agroveil/
├── .env                    ← Variables d'environnement (chmod 600)
├── CREDENTIALS.txt         ← Mots de passe en clair (chmod 600)
├── docker-compose.yml      ← Définition des services Docker
├── backend/                ← Code source FastAPI
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py
│       ├── database.py
│       ├── models.py
│       ├── schemas.py
│       ├── auth.py
│       ├── deps.py
│       └── routers/
│           ├── auth.py
│           ├── farmers.py
│           ├── alerts.py
│           ├── analytics.py
│           └── subscriptions.py
├── frontend/
│   ├── admin/dist/         ← Build React Admin (déployé)
│   └── portail/dist/       ← Build React Portail (déployé)
├── data/
│   ├── postgres/           ← Données PostgreSQL (volume Docker)
│   ├── redis/              ← Données Redis (volume Docker)
│   └── minio/              ← Données MinIO (volume Docker)
└── logs/
```

---

## Variables d'environnement (`/opt/agroveil/.env`)

```env
# PostgreSQL
POSTGRES_DB=agroveil_db
POSTGRES_USER=agroveil
POSTGRES_PASSWORD=Od7NyIkxRpaSeQS8Ffrs8JKmU
DATABASE_URL=postgresql://agroveil:Od7NyIkxRpaSeQS8Ffrs8JKmU@postgres:5432/agroveil_db

# Redis
REDIS_PASSWORD=qc5Xc8jW1WgyISOfy96evCjgc
REDIS_URL=redis://:qc5Xc8jW1WgyISOfy96evCjgc@redis:6379/0

# MinIO
MINIO_ROOT_USER=agroveil_minio
MINIO_ROOT_PASSWORD=Mi2eY1w8RcW6J19dxGJS9WAu2
MINIO_ENDPOINT=http://minio:9000
MINIO_BUCKET=agroveil

# API
JWT_SECRET=hU466LtirzPMhEvsbAhHhetqGRo1CrXzLAywkTPH0rib3RsHNeinTwkjIpiTt2jfpY2shSw
API_ENV=production
API_HOST=0.0.0.0
API_PORT=8000

# Externes (à configurer)
WHATSAPP_API_TOKEN=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
```

> **Important :** sur un nouveau serveur, régénérer tous les mots de passe
> et le `JWT_SECRET` (minimum 64 caractères aléatoires).
> Commande utile : `openssl rand -hex 32`

---

## Compte admin par défaut

| Champ        | Valeur                  |
|--------------|-------------------------|
| Email        | `admin@agroveil.com`    |
| Mot de passe | `Admin@2026!`           |
| Rôle         | `super_admin`           |

Le compte est créé automatiquement au premier démarrage du conteneur `agroveil_api`
si aucun utilisateur n'existe dans la table `admin_users`.

> **Changer le mot de passe après le premier login.**

---

## Procédure de redéploiement complet

### 1. Prérequis sur le nouveau serveur

```bash
# Mettre à jour le système
apt update && apt upgrade -y

# Installer Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker && systemctl start docker

# Installer Nginx
apt install -y nginx certbot python3-certbot-nginx

# Installer les outils utiles
apt install -y curl git rsync
```

### 2. Créer la structure de dossiers

```bash
mkdir -p /opt/agroveil/{backend,frontend/admin/dist,frontend/portail/dist,data/{postgres,redis,minio},logs,scripts}
chmod 700 /opt/agroveil
```

### 3. Copier les fichiers de configuration

Depuis la machine locale :

```bash
# Copier le .env (adapter les mots de passe !)
scp .env root@NOUVEAU_SERVEUR:/opt/agroveil/.env
chmod 600 /opt/agroveil/.env

# Copier le docker-compose.yml
scp docker-compose.yml root@NOUVEAU_SERVEUR:/opt/agroveil/docker-compose.yml

# Copier le code backend
scp -r agroveil-backend/ root@NOUVEAU_SERVEUR:/opt/agroveil/backend/
```

### 4. Démarrer la base de données, Redis et MinIO

```bash
cd /opt/agroveil
docker compose up -d postgres redis minio

# Attendre que postgres soit healthy (~15s)
docker compose ps
```

### 5. Initialiser le schéma de base de données

```bash
# Copier et exécuter le schéma SQL
docker cp /tmp/schema.sql agroveil_postgres:/tmp/schema.sql
docker exec agroveil_postgres psql -U agroveil -d agroveil_db -f /tmp/schema.sql
```

Le schéma crée les tables suivantes :
- `admin_users` — comptes administrateurs (UUID PK)
- `farmers` — éleveurs (PK format `FRM-XXXX`, séquence `farmers_seq`)
- `farms` — fermes
- `cameras` — caméras par ferme
- `subscriptions` — abonnements (`free` / `eleveur` / `pro` / `cooperative`)
- `alerts` — alertes IA (**hypertable TimescaleDB**, partitionnée par `created_at`)
- `payments` — paiements
- `ai_model_metrics` — métriques de précision des modèles IA

Extensions activées : `uuid-ossp`, `pgcrypto`, `timescaledb`.

### 6. Builder et démarrer l'API FastAPI

```bash
cd /opt/agroveil/backend
docker build -t agroveil_api:latest .

cd /opt/agroveil
docker compose up -d api

# Vérifier les logs (doit afficher "Application startup complete")
docker logs agroveil_api
```

### 7. Déployer les frontends React

Depuis la machine de développement :

```bash
# Admin Dashboard
cd agroveil-admin
# Créer .env.production avec la nouvelle URL
echo "VITE_API_URL=https://NOUVEAU_DOMAINE/agroveil/api" > .env.production
echo "VITE_WS_URL=wss://NOUVEAU_DOMAINE/agroveil/ws/admin" >> .env.production
echo "VITE_MOCK_MODE=false" >> .env.production
npm run build
scp -r dist/. root@NOUVEAU_SERVEUR:/opt/agroveil/frontend/admin/dist/

# Portail Éleveur
cd ../agroveil-portail
npm run build
scp -r dist/. root@NOUVEAU_SERVEUR:/opt/agroveil/frontend/portail/dist/

# Corriger les permissions pour Nginx
ssh root@NOUVEAU_SERVEUR "chmod -R 755 /opt/agroveil/frontend/"
```

### 8. Configurer Nginx

Créer `/etc/nginx/sites-available/agroveil` :

```nginx
server {
    listen 443 ssl;
    server_name NOUVEAU_DOMAINE;

    ssl_certificate     /etc/letsencrypt/live/NOUVEAU_DOMAINE/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/NOUVEAU_DOMAINE/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;

    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;

    # AgroVeil FastAPI
    location /agroveil/api/ {
        rewrite ^/agroveil/api/(.*) /$1 break;
        proxy_pass http://127.0.0.1:8000;
        proxy_read_timeout 300s;
    }

    # AgroVeil WebSocket
    location /agroveil/ws/ {
        rewrite ^/agroveil/ws/(.*) /$1 break;
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade    $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_read_timeout 86400s;
    }

    # React Admin (fichiers statiques)
    location /agroveil/admin/ {
        alias /opt/agroveil/frontend/admin/dist/;
        try_files $uri $uri/ /agroveil/admin/index.html;
    }

    # React Portail (fichiers statiques)
    location /agroveil/portail/ {
        alias /opt/agroveil/frontend/portail/dist/;
        try_files $uri $uri/ /agroveil/portail/index.html;
    }

    # MinIO stockage
    location /agroveil/media/ {
        rewrite ^/agroveil/media/(.*) /$1 break;
        proxy_pass http://127.0.0.1:9000;
        client_max_body_size 500M;
        proxy_set_header Host $host;
    }
}

server {
    listen 80;
    server_name NOUVEAU_DOMAINE;
    return 301 https://$host$request_uri;
}
```

```bash
ln -s /etc/nginx/sites-available/agroveil /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### 9. Obtenir un certificat SSL

```bash
certbot --nginx -d NOUVEAU_DOMAINE
# Configurer le renouvellement auto
systemctl enable certbot.timer
```

### 10. Vérification finale

```bash
# Conteneurs
docker ps

# API
curl https://NOUVEAU_DOMAINE/agroveil/api/health
# Attendu : {"status":"ok","service":"agroveil-api"}

# Admin frontend
curl -o /dev/null -w "%{http_code}" https://NOUVEAU_DOMAINE/agroveil/admin/
# Attendu : 200

# Test login
curl -X POST https://NOUVEAU_DOMAINE/agroveil/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@agroveil.com","password":"Admin@2026!"}'
```

---

## Docker Compose (`docker-compose.yml`)

```yaml
services:

  postgres:
    image: timescale/timescaledb:latest-pg16
    container_name: agroveil_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - /opt/agroveil/data/postgres:/var/lib/postgresql/data
    ports:
      - "127.0.0.1:5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: agroveil_redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD} --appendonly yes
    volumes:
      - /opt/agroveil/data/redis:/data
    ports:
      - "127.0.0.1:6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  minio:
    image: minio/minio:latest
    container_name: agroveil_minio
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
    volumes:
      - /opt/agroveil/data/minio:/data
    ports:
      - "127.0.0.1:9000:9000"
      - "127.0.0.1:9001:9001"
    healthcheck:
      test: ["CMD", "mc", "ready", "local"]
      interval: 15s
      timeout: 10s
      retries: 5

  api:
    image: agroveil_api:latest   # builder avec : docker build -t agroveil_api:latest ./backend/
    container_name: agroveil_api
    restart: unless-stopped
    env_file: .env
    ports:
      - "127.0.0.1:8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

networks:
  default:
    name: agroveil_network
```

---

## Stack technique détaillé

### Backend — FastAPI

| Composant       | Version  | Rôle                              |
|-----------------|----------|-----------------------------------|
| FastAPI         | 0.115.5  | Framework API REST                |
| Uvicorn         | 0.32.1   | Serveur ASGI                      |
| SQLAlchemy      | 2.0.36   | ORM async (asyncpg driver)        |
| asyncpg         | 0.30.0   | Driver PostgreSQL async           |
| Pydantic        | 2.10.3   | Validation des données            |
| python-jose     | 3.3.0    | JWT (HS256, 24h d'expiration)     |
| passlib         | 1.7.4    | Hash bcrypt des mots de passe     |
| bcrypt          | 4.0.1    | Backend bcrypt (pinné, compat passlib) |
| redis           | 5.2.1    | Client Redis async                |

**Endpoints API :**

```
POST   /auth/login              → JWT + profil admin
POST   /auth/logout
POST   /auth/refresh            → Nouveau JWT

GET    /farmers                 → Liste paginée (filtres: country, plan, status, search)
GET    /farmers/{id}
POST   /farmers
PUT    /farmers/{id}
POST   /farmers/{id}/suspend
DELETE /farmers/{id}

GET    /alerts                  → Liste paginée (filtres: severity, is_resolved, farmer_id)
GET    /alerts/{id}
POST   /alerts/{id}/resolve
POST   /alerts/{id}/whatsapp

GET    /analytics/dashboard     → KPIs (farmers, alertes, MRR, précision IA)
GET    /analytics/farmer-growth → Croissance mensuelle (12 mois)
GET    /analytics/alert-distribution → Alertes par semaine par type (8 semaines)
GET    /analytics/plan-distribution  → Répartition des abonnements actifs
GET    /analytics/ai-metrics    → Précision par type de modèle IA

GET    /subscriptions           → Liste paginée (filtres: plan, status)

GET    /health                  → {"status":"ok","service":"agroveil-api"}
```

### Base de données — PostgreSQL 16 + TimescaleDB

Image Docker : `timescale/timescaledb:latest-pg16`

**Tables et rôles :**

| Table              | Clé primaire         | Notes                                    |
|--------------------|----------------------|------------------------------------------|
| `admin_users`      | UUID                 | Mot de passe bcrypt                      |
| `farmers`          | `FRM-{seq}`          | Séquence `farmers_seq` (démarre à 7001)  |
| `farms`            | `VARCHAR(20)`        |                                          |
| `cameras`          | `VARCHAR(20)`        |                                          |
| `subscriptions`    | `VARCHAR(20)`        | Plans : free / eleveur / pro / cooperative |
| `alerts`           | `(id, created_at)`   | **Hypertable TimescaleDB**               |
| `payments`         | `VARCHAR(20)`        | Méthodes : mtn_momo / orange_money / ... |
| `ai_model_metrics` | SERIAL               | Pré-remplie avec 6 modèles               |

**Types d'alertes :** `mortality`, `heat_stress`, `inactivity`, `cannibalism`, `feeder_empty`, `abnormal_movement`

**Sévérités :** `critical`, `warning`, `info`

### Cache — Redis 7

Utilisé pour les sessions et les queues de tâches futures.
Accessible en interne uniquement (`127.0.0.1:6379`), protégé par mot de passe.

### Stockage — MinIO

Compatible S3, utilisé pour stocker les snapshots des caméras.
- Endpoint interne : `http://minio:9000`
- Console admin : `http://127.0.0.1:9001` (via tunnel SSH)
- Bucket : `agroveil`

Accès depuis l'extérieur via Nginx : `https://DOMAINE/agroveil/media/`

### Frontends React

| App             | Framework                 | Build output                          |
|-----------------|---------------------------|---------------------------------------|
| Admin Dashboard | React 18 + Vite 5 + TS   | `/opt/agroveil/frontend/admin/dist/`  |
| Portail Éleveur | React 18 + Vite 5 + TS   | `/opt/agroveil/frontend/portail/dist/`|

Variables d'environnement pour le build production (`.env.production`) :

```env
VITE_API_URL=https://NOUVEAU_DOMAINE/agroveil/api
VITE_WS_URL=wss://NOUVEAU_DOMAINE/agroveil/ws/admin
VITE_MOCK_MODE=false
```

> En développement local (`.env.local`), pointer vers le serveur de production
> ou lancer une instance locale avec `VITE_MOCK_MODE=false`.

---

## Commandes de maintenance courantes

```bash
# Voir l'état des conteneurs
docker ps
docker compose -f /opt/agroveil/docker-compose.yml ps

# Logs de l'API
docker logs agroveil_api -f --tail 50

# Redémarrer un service
docker compose -f /opt/agroveil/docker-compose.yml restart api

# Mettre à jour l'API après modification du code backend
cd /opt/agroveil/backend
docker build -t agroveil_api:latest .
cd /opt/agroveil
docker compose up -d api

# Connexion PostgreSQL
docker exec -it agroveil_postgres psql -U agroveil -d agroveil_db

# Connexion Redis
docker exec -it agroveil_redis redis-cli -a <REDIS_PASSWORD>

# Backup de la base de données
docker exec agroveil_postgres pg_dump -U agroveil agroveil_db | gzip > /opt/backups/agroveil_$(date +%Y%m%d).sql.gz

# Renouvellement SSL (auto via systemd timer)
certbot renew --dry-run
```

---

## Ports réseau

| Port  | Service          | Exposition              |
|-------|------------------|-------------------------|
| 80    | Nginx HTTP       | Public (→ HTTPS)        |
| 443   | Nginx HTTPS      | Public                  |
| 3000  | Next.js          | Interne uniquement      |
| 4242  | Cortex WebSocket | Interne uniquement      |
| 5432  | PostgreSQL       | `127.0.0.1` uniquement  |
| 6379  | Redis            | `127.0.0.1` uniquement  |
| 8000  | FastAPI          | `127.0.0.1` uniquement  |
| 9000  | MinIO API        | `127.0.0.1` uniquement  |
| 9001  | MinIO Console    | `127.0.0.1` uniquement  |
| 10000 | Webmin           | Interne (accès IP:10000)|

---

## Certificats SSL

Gérés par **Certbot + Let's Encrypt**.

| Domaine                   | Expiration    |
|---------------------------|---------------|
| `cortex-agents.com`       | 2026-08-04    |
| `nvamnzama.com`           | 2026-09-04    |

Le renouvellement automatique est configuré via `systemctl` (timer certbot).
Le hook de déploiement doit reloader Nginx (et non Apache) :

```bash
# Vérifier le hook
ls /etc/letsencrypt/renewal-hooks/deploy/
# Doit contenir un script avec : systemctl reload nginx
```

---

## Rollback Nginx → Apache (urgence)

```bash
systemctl stop nginx
systemctl start apache2
systemctl enable apache2
```

---

*Dernière mise à jour : 2026-06-15*
