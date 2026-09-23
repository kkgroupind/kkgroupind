# KK Group Backend: AWS EC2 + Docker + CI/CD Deployment Guide

This comprehensive guide walks you through deploying the KK Group NestJS backend onto an **AWS EC2** instance using **Docker**, **GitHub Actions (CI/CD)**, and **Neon PostgreSQL**.

---

## 1. Database Decision: Neon PostgreSQL vs AWS RDS

### Current Verdict: Stay with Neon Postgres
- **Zero Maintenance**: Automatic backups, branching, high availability, and connection pooling.
- **Cost**: Generous free tier; significantly cheaper than RDS when traffic fluctuates.
- **Zero Lock-In**: Because our codebase uses standard PostgreSQL through Prisma and `@prisma/adapter-pg`, switching to AWS RDS in the future requires **zero code changes**—only changing the `DATABASE_URL` in `.env`.

### ?? Crucial Best Practices for Neon + EC2
1. **Match AWS Regions**: Ensure your Neon database region matches your EC2 instance region (e.g. **AWS Asia Pacific / Mumbai `ap-south-1`**). If your EC2 is in Mumbai and Neon is in Europe or US, every single database query will suffer 120–160ms network round-trip delay.
2. **Use Connection Pooling**: In the Neon dashboard, use the **pooled connection string** (contains `-pooler.`) as your `DATABASE_URL` for production.

---

## 2. AWS EC2 Instance Setup

### Step 2.1: Launch EC2 Instance
1. Go to **AWS Console > EC2 > Launch an instance**.
2. **Name**: `kk-group-backend-prod`
3. **OS Image (AMI)**: **Ubuntu Server 24.04 LTS** (or 22.04 LTS) — 64-bit (x86).
4. **Instance Type**:
   - Minimum: `t3.micro` (1 vCPU, 1 GB RAM - use swap memory)
   - Recommended: `t3.small` (2 vCPU, 2 GB RAM) or `t3.medium` (2 vCPU, 4 GB RAM)
5. **Key Pair**: Create or select an existing `.pem` key pair (e.g., `kk-group-key.pem`). **Download and save this file safely**.
6. **Storage**: 20 GB to 30 GB gp3 SSD.

### Step 2.2: Configure Security Group (Firewall)
Under **Network settings**, configure the following inbound rules:

| Type | Port Range | Source | Purpose |
| :--- | :--- | :--- | :--- |
| **SSH** | `22` | `0.0.0.0/0` (or GitHub Actions IP range / your IP) | Remote management & CI/CD deployment |
| **HTTP** | `80` | `0.0.0.0/0` | Web traffic / SSL certificate issuance |
| **HTTPS** | `443` | `0.0.0.0/0` | Secure SSL web traffic |

> ?? **Security Notice**: Do **NOT** open Port `5000` to the public. The NestJS backend binds to `127.0.0.1:5000` internally and receives requests securely through a reverse proxy (Nginx or Caddy) with SSL.

### Step 2.3: Allocate an Elastic IP (Recommended)
1. Go to **EC2 > Network & Security > Elastic IPs**.
2. Click **Allocate Elastic IP address** and click **Allocate**.
3. Select the IP > **Actions > Associate Elastic IP address**.
4. Choose your backend instance and associate. *(This guarantees your server IP never changes when restarting the EC2 instance).*

---

## 3. Server Configuration & Docker Installation

Connect to your EC2 instance via SSH:
```bash
ssh -i /path/to/kk-group-key.pem ubuntu@<YOUR_EC2_PUBLIC_IP>
```

### Step 3.1: Update Server Packages & Configure 2GB Swap (Crucial for t3.micro/small)
```bash
sudo apt update && sudo apt upgrade -y

# Setup 2GB Swap memory to prevent Out-Of-Memory issues during peak loads
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Step 3.2: Install Docker Engine & Docker Compose Plugin
```bash
# Install Docker prerequisites
sudo apt install -y ca-certificates curl gnupg lsb-release

# Add Docker GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker official repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Allow 'ubuntu' user to run Docker without sudo
sudo usermod -aG docker $USER
```

> ?? Log out and log back in for docker group permissions to activate:
```bash
exit
ssh -i /path/to/kk-group-key.pem ubuntu@<YOUR_EC2_PUBLIC_IP>
docker ps   # Verify this succeeds without sudo!
```

---

## 4. Setup Application Directory on EC2

On your EC2 terminal, create the deployment directory:
```bash
mkdir -p /home/ubuntu/app
cd /home/ubuntu/app
```

### Step 4.1: Create `docker-compose.prod.yml`
Copy the contents of `infrastructure/docker-compose.prod.yml` or create it directly:
```bash
nano /home/ubuntu/app/docker-compose.prod.yml
```
Paste:
```yaml
services:
  backend:
    image: ${BACKEND_IMAGE:-kk-backend:latest}
    container_name: kk-backend
    restart: unless-stopped
    ports:
      - "127.0.0.1:5000:5000"
    env_file:
      - .env
    environment:
      - NODE_ENV=production
      - PORT=5000
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:5000/api || exit 1"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 15s
```

### Step 4.2: Create `.env` on EC2
```bash
nano /home/ubuntu/app/.env
```
Fill in your actual production values:
```env
NODE_ENV=production
PORT=5000

# Neon PostgreSQL pooled connection string
DATABASE_URL="postgresql://user:password@ep-cool-fog-123456-pooler.ap-south-1.aws.neon.tech/kkgroup?sslmode=require"

# Production Frontend URL(s) separated by commas
CORS_ORIGIN="https://kkgroup.in,https://admin.kkgroup.in"

# Strong 32+ character random secret
JWT_SECRET="generate_a_secure_random_string_here_min_32_characters"
JWT_EXPIRES_IN="7d"

# Initial Super Admin credentials
SUPER_ADMIN_EMAIL="admin@kkgroup.in"
SUPER_ADMIN_USERNAME="superadmin"
SUPER_ADMIN_PASSWORD="YourStrongPassword#2026"

# Email / SMTP credentials (e.g. Amazon SES, Brevo, or Gmail App Password)
APP_EMAIL="info@kkgroup.in"
APP_PASSWORD="your-app-password"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="info@kkgroup.in"
SMTP_PASS="your-app-password"
SMTP_FROM="\"KK Group\" <noreply@kkgroup.in>"
```

---

## 5. Reverse Proxy with SSL (HTTPS)

You need a reverse proxy on ports 80/443 pointing to `127.0.0.1:5000`.

### Option A: Standard Nginx + Certbot (Recommended)
1. Install Nginx and Certbot:
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

2. Create an Nginx site configuration for your domain (e.g. `api.kkgroup.in`):
```bash
sudo nano /etc/nginx/sites-available/kk-backend
```

Paste:
```nginx
server {
    server_name api.kkgroup.in; # Replace with your subdomain pointing to EC2 IP

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. Enable the site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/kk-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

4. Obtain a free Let's Encrypt SSL certificate:
```bash
sudo certbot --nginx -d api.kkgroup.in
```
Certbot will automatically install the SSL certificates and configure auto-renewal!

---

## 6. Configure GitHub Repository Secrets for CI/CD

In your GitHub repository:
1. Navigate to **Settings > Secrets and variables > Actions**.
2. Click **New repository secret** and add the following 3 secrets:

| Secret Name | Value |
| :--- | :--- |
| `EC2_HOST` | Your EC2 Public IPv4 or Elastic IP (e.g. `13.233.x.x`) or domain |
| `EC2_USERNAME` | `ubuntu` |
| `EC2_SSH_KEY` | Paste the **entire content** of your downloaded `.pem` key file (including `-----BEGIN ...-----` and `-----END ...-----`) |
| `EC2_PORT` | `22` (Optional, defaults to 22) |

---

## 7. How the CI/CD Pipeline Works

When you push code changes to `backend/**` on `main`:
```
   [Push to main]
          ¦
          ?
   1. Lint & TypeScript Build Validation (GitHub Runner)
          ¦
          ?
   2. Build Docker Image & Push to GHCR (ghcr.io/<repo>/backend:latest)
          ¦
          ?
   3. SSH into EC2 (via appleboy/ssh-action)
          ¦
          +-? Pull latest Docker image
          +-? Run Prisma migrations: `npx prisma migrate deploy`
          +-? Zero-downtime container swap: `docker compose up -d`
          +-? Prune old images: `docker image prune -f`
          ¦
          ?
   [Live on EC2: https://api.kkgroup.in/api]
```

### Manual Trigger
You can also manually trigger a deployment at any time from GitHub:
**GitHub Repository > Actions > "Build and Deploy Backend to AWS EC2" > Run workflow**.

---

## 8. Useful EC2 Maintenance Commands

```bash
# View real-time backend logs
docker logs -f kk-backend

# Check container health and uptime
docker ps

# Restart backend service
cd /home/ubuntu/app && docker compose -f docker-compose.prod.yml restart backend

# View server memory and CPU consumption
htop
# or
docker stats
```
