# KK Group Backend: High-Efficiency EC2 Deployment Guide (PM2 + GitHub Actions)

This guide walks you through setting up a **lightweight, Docker-free deployment** tailored specifically for the **AWS Free Tier (t2.micro / t3.micro)**.

### Why This Architecture Is Best for AWS Free Tier:
- **Zero Docker Overhead**: Saves ~3–4 GB of disk space and 300 MB of RAM.
- **100% Cloud Build**: GitHub Actions builds the project on GitHub’s powerful servers (16 GB RAM, 4 vCPUs) and securely uploads only the compiled bundle to your EC2 instance.
- **Zero EC2 CPU Spikes**: Your EC2 server never builds TypeScript or runs heavy compilation.
- **Auto-Recovery**: PM2 restarts your backend automatically if it crashes or if the EC2 instance restarts.

---

## 1. Launch New EC2 Instance (AWS Console)

1. Go to **AWS Console > EC2 > Launch an instance**.
2. **Name**: `kk-group-backend`
3. **OS**: **Ubuntu Server 24.04 LTS** (64-bit x86).
4. **Instance Type**: `t3.micro` or `t2.micro` (Free tier eligible).
5. **Key pair**: Select or create your `.pem` key pair.
6. **Network settings (Security Group)**:
   - Allow **SSH** (Port `22`) from anywhere (`0.0.0.0/0`)
   - Allow **HTTP** (Port `80`) from anywhere (`0.0.0.0/0`)
   - Allow **HTTPS** (Port `443`) from anywhere (`0.0.0.0/0`)
7. **Storage**: Set storage to **20 GB** or **30 GB gp3** (AWS gives 30 GB free storage per month).
8. Click **Launch Instance**.

---

## 2. One-Time Server Setup (Takes 3 Minutes)

SSH into your new EC2 instance:
```bash
ssh -i /path/to/your-key.pem ubuntu@<YOUR_EC2_PUBLIC_IP>
```

### Step 2.1: Update System & Setup 2GB Swap Memory (Prevents RAM crashes)
```bash
sudo apt update && sudo apt upgrade -y

# Setup 2GB swap file
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Step 2.2: Install Node.js 22 LTS & PM2
```bash
# Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node and npm
node -v   # Should show v22.x
npm -v

# Install PM2 globally
sudo npm install -g pm2
```

### Step 2.3: Setup Application Directory and `.env` File
```bash
mkdir -p /home/ubuntu/app
cd /home/ubuntu/app
```

Create your production environment file:
```bash
nano /home/ubuntu/app/.env
```

Paste your production variables (ensure NO spaces around `=`):
```env
NODE_ENV=production
PORT=5000

# Neon PostgreSQL Connection URL
DATABASE_URL="postgresql://neondb_owner:npg_BUPpDG4EvZN9@ep-dry-dew-b3av848h-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Production Frontend URLs
CORS_ORIGIN="http://localhost:3000,https://kkgroup.in,https://admin.kkgroup.in"

# JWT Secret (minimum 32 characters)
JWT_SECRET="kk_group_sec_2026_9f8b2c4e1d7a5f3e8b0a2c4e6f8d0b2a4c6e8f0a2b4d6e8f"
JWT_EXPIRES_IN="7d"

# Admin Defaults
SUPER_ADMIN_EMAIL="admin@kkgroup.com"
SUPER_ADMIN_USERNAME="superadmin"
SUPER_ADMIN_PASSWORD="AdminPassword@123"

# Mailer Credentials
APP_EMAIL="kkgroupnetwork@gmail.com"
APP_PASSWORD="zihe yasl zmxe ozba"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="kkgroupnetwork@gmail.com"
SMTP_PASS="zihe yasl zmxe ozba"
SMTP_FROM="\"KK Group\" <kkgroupnetwork@gmail.com>"
```
*(Press `Ctrl + O`, `Enter` to save, then `Ctrl + X` to exit).*

### Step 2.4: Enable PM2 Auto-Start on System Boot
```bash
pm2 startup systemd -u ubuntu --hp /home/ubuntu
```
*(Copy and run any command PM2 outputs on your screen).*

---

## 3. Configure Nginx Reverse Proxy with SSL

### Step 3.1: Install Nginx & Certbot
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

### Step 3.2: Create Nginx Site Configuration
```bash
sudo nano /etc/nginx/sites-available/kk-backend
```

Paste:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com; # Or your EC2 Public IP / Domain

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

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/kk-backend /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### Step 3.3: Issue Free SSL Certificate (When domain is pointed)
```bash
sudo certbot --nginx -d api.yourdomain.com
```

---

## 4. GitHub Actions CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/backend-deploy.yml`) is already configured:
1. **GitHub Runner**: Runs `npm ci`, generates Prisma client, runs `npm run build`, and prunes devDependencies.
2. **Artifact Packaging**: Compresses `dist/`, `node_modules/`, `prisma/`, and `package.json` into `deploy.tar.gz`.
3. **Secure Transfer**: Transfers `deploy.tar.gz` to your EC2 instance over SSH/SCP.
4. **Zero-Downtime Reload**:
   - Extracts files into `/home/ubuntu/app/`.
   - Runs `npx prisma migrate deploy` directly against Neon DB.
   - Reloads the app seamlessly: `pm2 reload kk-backend || pm2 start dist/main.js --name kk-backend`.

---

## 5. GitHub Secrets Required

Go to your repository **Settings > Secrets and variables > Actions**:
- `EC2_HOST`: Your new EC2 Public IPv4 or Elastic IP (e.g. `13.233.x.x`).
- `EC2_USERNAME`: `ubuntu`
- `EC2_SSH_KEY`: Content of your `.pem` key file.
- `EC2_PORT`: `22` (optional, defaults to 22).

---

## 6. Useful Maintenance Commands on EC2

```bash
# Check running status
pm2 status

# View live real-time backend logs
pm2 logs kk-backend

# Restart server manually
pm2 restart kk-backend

# Test API locally on EC2
curl http://localhost:5000/api
```
