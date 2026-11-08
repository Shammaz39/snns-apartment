<div align="center">

# 🏢 SNNS Apartment Management Platform

**A Modern, Full-Stack Residential Community & Smart Security ERP**

[![Java 17](https://img.shields.io/badge/Java-17%20LTS-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://adoptium.net)
[![Spring Boot 3.3.4](https://img.shields.io/badge/Spring%20Boot-3.3.4-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React 18](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![MySQL 8.0](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<p align="center">
  <a href="#-quick-start-run-in-3-commands">Quick Start</a> •
  <a href="#-core-features--roles">Features & Roles</a> •
  <a href="#-tech-stack--versions">Tech Stack</a> •
  <a href="#-system-architecture">Architecture</a> •
  <a href="#-production-deployment-custom-domain">Production Deployment</a> •
  <a href="#-api-documentation">API Docs</a>
</p>

---

</div>

## 📖 Introduction

**SNNS Apartment** is a production-ready, enterprise-grade apartment and residential community management system. Designed for gated communities, residential towers, and housing societies, it unifies **Super Admin oversight**, **Resident self-service portals**, and **Security Gatekeeper terminals** into a seamless, automated workflow.

Key differentiators include **Stateless JWT security**, **QR bill verification**, **live cross-room isolated visitor approvals**, **resident KYC file storage**, and **single-command Docker deployment**.

---

## 🚀 Quick Start (Run in 3 Commands)

> **Prerequisite**: You only need [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running on your machine. No Java, Node.js, or MySQL installation required!

### 1. Clone the repository
```bash
git clone https://github.com/Shammaz39/snns-apartment.git
cd snns-apartment
```

### 2. Launch the entire stack
```bash
docker compose up -d --build
```
*Docker will automatically build the Java backend, bundle the React frontend with Vite, launch MySQL 8.0, create all database tables via Hibernate, and seed the default Super Admin.*

### 3. Open your browser
👉 **Web Application:** [http://localhost:3000](http://localhost:3000)  
👉 **Interactive Swagger API Docs:** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

---

## 🔑 Default Login Credentials

On initial startup, the platform automatically provisions a default Super Admin account:

| Portal | Username / Login ID | Password | Access Level |
|---|---|---|---|
| **Super Admin** | `admin@snnsapartment` *(or `admin`)* | `Abc@123` | Full access to floors, rooms, billing, KYC, staff, settings |
| **Resident (Tenant)** | Flat / Room Number *(e.g. `101`, `201`)* | `Abc@123` | Personal bills, payments, visitor pre-approvals, KYC edit |
| **Security Gatekeeper** | Guard Phone Number *(e.g. `+91 9777111222`)* | `Abc@123` | Gate entry logging, check-in, check-out, resident lookup |

> 🔒 **Security Notice:** Always update the default admin password from the **Settings** or **Profile** menu in production environments.

---

## 🛠 Tech Stack & Exact Versions

### Backend
- **Java**: `17 (LTS)` (Eclipse Temurin)
- **Framework**: Spring Boot `3.3.4`
- **Security**: Spring Security `6.3.3` with Stateless JWT Authentication (`jjwt 0.12.5`)
- **Database Access**: Spring Data JPA / Hibernate `6.5.x` with automatic schema updates (`ddl-auto: update`)
- **API Documentation**: SpringDoc OpenAPI `2.6.0` (Swagger UI v3)
- **Build Tool**: Apache Maven `3.9+`

### Frontend
- **Framework**: React `18.3.1` (Single Page Application with React Router DOM `6.26.2`)
- **Build Engine**: Vite `5.4.8` (Lightning-fast HMR and optimized production bundling)
- **Styling**: Tailwind CSS `3.4.13` + PostCSS `8.4.47` + Autoprefixer
- **Icons**: Lucide React `0.446.0`
- **HTTP Client**: Axios `1.7.7` with automated JWT Bearer interceptor & 401 handling
- **Runtime**: Node.js `22 (LTS)`

### Database & Infrastructure
- **Database Engine**: MySQL `8.0` (InnoDB, UTF-8 unicode collation)
- **Web Server & Reverse Proxy**: Nginx `Alpine` (routes static assets & proxies `/api/` to backend)
- **Containerization**: Docker Multi-stage Builds (`Dockerfile` in backend & frontend) + Docker Compose v2

---

## 🌟 Core Features & Roles

### 1. 🛡 Super Admin Dashboard
- **Analytics & Financials**: Live occupied vs. vacant room counters, monthly revenue, pending payment proofs.
- **Floor & Room Architecture**: Add floors, bulk room creation, configure default rent, lift maintenance, and waste fees.
- **Tenant Lifecycle**: Onboard tenants with member details, lease dates, photo upload, and Aadhaar document capture.
- **Deboarding Guard**: Safe deboarding check preventing tenant exit if outstanding bills are unpaid.
- **Billing Engine**: Generate individual or society-wide monthly bills.
- **Payment Verification**: Review resident payment receipts and UTR reference codes with 1-click **Approve** or **Reject** (with audit remarks).
- **Emergency Service Contacts**: Manage society helplines (Plumber, Electrician, Supermarket, Hospital, Police) with categories.
- **Community Circulars & Events**: Post society announcements with optional popup modal alerts for residents upon login.

### 2. 🏠 Resident (Tenant) Portal
- **Bill Settle & Receipts**: View current and historical rent/maintenance charges, scan UPI QR code, and upload UTR transaction proof.
- **Pre-Approved Visitor Passes**: Register expected guests or delivery couriers in advance (flat locked strictly to the resident's unit).
- **Live Gate Notifications**: Real-time polling for unscheduled visitors waiting at the gate; instant **"Allow Entry"** or **"Deny Entry"** buttons.
- **KYC & Profile Management**: Update personal phone, email, Aadhaar number, family member counts, and upload fresh KYC proofs.
- **Community Helplines**: 1-click access to verified local services and emergency numbers.
- **Maintenance Tickets**: Log complaints (Plumbing, Electrical, Noise, Other) and track resolution progress.

### 3. 🚪 Security Gatekeeper Terminal
- **Vacant Flat Lockout**: Dropdown dynamically excludes vacant rooms—visitors cannot be allocated to unrented units.
- **Entry Mode A (Resident Approval)**: Request gate entry → Resident receives live in-app alert → Approves → Guard checks in.
- **Entry Mode B (Direct Phone Approval)**: Guard confirms entry via intercom/phone → Guard selects direct entry → Auto-logs guard name & audit note *(e.g. "Confirmed with resident via phone call by Security Guard Babu")*.
- **Entry Mode C (Pre-Approved Check-In)**: 1-click check-in for expected guests pre-registered by residents.
- **Visitor Directory**: Read-only lookup of resident names and room numbers for quick reference.
- **Check-Out Tracking**: Complete history of visitor entry/exit timestamps and vehicle numbers.

---

## 🏛 System Architecture

```
                    Internet / Users (Browser)
                               │
                               ▼ Port 80 / 443
               ┌───────────────────────────────┐
               │    Nginx (Reverse Proxy)      │
               └───────────────┬───────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            │                                     │
            ▼ (Static SPA)                        ▼ (API Calls: /api/*)
 ┌──────────────────────┐              ┌───────────────────────────┐
 │  Frontend Container  │              │     Backend Container     │
 │   React 18 + Vite    │              │   Spring Boot 3 (Port 8080)
 └──────────────────────┘              └─────────────┬─────────────┘
                                                     │
                                                     ▼ (Port 3306)
                                       ┌───────────────────────────┐
                                       │      MySQL 8 Container    │
                                       │     (Persistent Volume)   │
                                       └───────────────────────────┘
```

---

## 📂 Project Directory Structure

```
snns-apartment/
├── docker-compose.yml          # Multi-container orchestration (DB, Backend, Frontend)
├── README.md                   # Complete system documentation
├── .gitignore                  # Security-first Git ignore rules
│
├── backend/                    # Spring Boot Application
│   ├── Dockerfile              # Multi-stage Eclipse Temurin JRE build
│   ├── pom.xml                 # Maven dependencies & plugins
│   └── src/
│       ├── main/java/com/snns/apartment/
│       │   ├── config/         # SecurityConfig, JwtAuthFilter, JwtUtil, SwaggerConfig
│       │   ├── controller/     # 14 REST Controllers (Auth, Bills, Visitors, Tenants, etc.)
│       │   ├── dataseed/       # DataInitializer (Default admin & settings auto-provisioning)
│       │   ├── dto/            # Data Transfer Objects & validation annotations
│       │   ├── model/          # 19 JPA Entities (Room, Tenant, Bill, VisitorPass, etc.)
│       │   ├── repository/     # Spring Data JPA interfaces
│       │   └── service/        # Transactional business logic layer
│       └── main/resources/
│           └── application.yml # Database, JWT secret, and multipart configuration
│
└── frontend/                   # React Single Page Application
    ├── Dockerfile              # Multi-stage Node.js build + Nginx Alpine server
    ├── nginx.conf              # SPA route fallback & /api/ reverse proxy configuration
    ├── package.json            # React, Tailwind CSS, Lucide icons dependencies
    ├── vite.config.js          # Vite build settings
    └── src/
        ├── api/client.js       # Axios client with JWT authorization interceptors
        ├── components/         # Modals, Navbar, Sidebar, Verification dialogs
        ├── context/            # AuthContext (user session & roles)
        └── pages/              # 13 Application Views (Dashboard, Bills, Gatekeeper, etc.)
```

---

## 🌐 Production Deployment (Custom Domain)

To deploy SNNS Apartment to your own domain or subdomain (e.g. `apartment.yourdomain.com` or `yourdomain.com`) on any Cloud VPS provider (Ubuntu / Debian on AWS EC2, DigitalOcean, Linode, Hostinger, Hetzner, GCP), choose between two production architectures:

- **[Option A: Containerized Deployment with Docker (Recommended)](#option-a-docker-compose-deployment-recommended)** — One-command deployment managing DB, Backend, and Frontend containers with zero host package conflicts.
- **[Option B: Bare-Metal / Native VPS Deployment (Non-Docker)](#option-b-native-vps-deployment-non-docker)** — Runs directly on Linux host using native MySQL 8.0, Systemd service for Spring Boot Java 17, and Host Nginx serving React static build.

---

### Step 0: Point Your Domain DNS (Common for Both Options)
Log in to your DNS registrar (Cloudflare, GoDaddy, Namecheap, Hostinger) and create an **A Record**:
- **Type:** `A`
- **Name / Host:** `@` *(for root domain)* or `apartment` *(for subdomain)*
- **Value (IPv4):** `<YOUR_SERVER_PUBLIC_IP>`
- **TTL:** `Auto` (or `300 seconds`)

---

### Option A: Docker Compose Deployment (Recommended)

#### 1. Install Docker on your VPS
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Log out and log back in, or run:
newgrp docker
```

#### 2. Clone the Repository & Launch
```bash
git clone https://github.com/Shammaz39/snns-apartment.git
cd snns-apartment
docker compose up -d --build
```
*The stack will automatically spin up MySQL 8, build the Java 17 JAR, bundle the React UI, and launch on port 3000.*

#### 3. Setup Host Nginx Reverse Proxy & Free SSL
Install Nginx and Certbot:
```bash
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx
```

Create `/etc/nginx/sites-available/snns`:
```nginx
server {
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 25M;
}
```

Enable and acquire SSL:
```bash
sudo ln -s /etc/nginx/sites-available/snns /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

### Option B: Native VPS Deployment (Non-Docker)

Deploy directly on Ubuntu 22.04 / 24.04 LTS without Docker containers.

#### 1. Install Required System Packages
```bash
# Update package repositories
sudo apt update && sudo apt upgrade -y

# 1. Install Java 17 JDK & Maven
sudo apt install -y openjdk-17-jdk maven

# 2. Install MySQL Server 8.0
sudo apt install -y mysql-server

# 3. Install Node.js 22 LTS & Build tools
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# 4. Install Nginx & Certbot SSL
sudo apt install -y nginx certbot python3-certbot-nginx git
```

Verify installed runtimes:
```bash
java -version    # OpenJDK 17
mvn -v           # Apache Maven 3.x
node -v          # v22.x
mysql --version  # MySQL 8.x
```

#### 2. Setup Production MySQL Database
Log into MySQL:
```bash
sudo mysql
```

Run the following SQL commands to provision the database and application user:
```sql
CREATE DATABASE snns_apartment_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'snns_user'@'localhost' IDENTIFIED BY 'StrongPassword123!';
GRANT ALL PRIVILEGES ON snns_apartment_db.* TO 'snns_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 3. Clone Repository & Setup Application Directory
```bash
sudo mkdir -p /var/www/snns-apartment
sudo chown -R $USER:$USER /var/www/snns-apartment
git clone https://github.com/Shammaz39/snns-apartment.git /var/www/snns-apartment
cd /var/www/snns-apartment
```

Create uploads storage directory:
```bash
sudo mkdir -p /var/www/snns-apartment/uploads
sudo chown -R $USER:$USER /var/www/snns-apartment/uploads
sudo chmod -R 755 /var/www/snns-apartment/uploads
```

#### 4. Build & Package Spring Boot Backend
```bash
cd /var/www/snns-apartment/backend

# Package Spring Boot application JAR
mvn clean package -DskipTests
```
*The compiled runnable JAR will be located at `/var/www/snns-apartment/backend/target/snns-apartment-0.0.1-SNAPSHOT.jar`.*

#### 5. Configure Backend as a Systemd Background Service
Create a persistent Systemd daemon so the backend starts automatically on system boot and restarts on crashes:
```bash
sudo nano /etc/systemd/system/snns-backend.service
```

Paste the following service configuration:
```ini
[Unit]
Description=SNNS Apartment Management Spring Boot Backend
After=network.target mysql.service
Requires=mysql.service

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/snns-apartment/backend

# Environment Variables
Environment=SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/snns_apartment_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
Environment=SPRING_DATASOURCE_USERNAME=snns_user
Environment=SPRING_DATASOURCE_PASSWORD=StrongPassword123!
Environment=FILE_UPLOAD_DIR=/var/www/snns-apartment/uploads
Environment=SERVER_PORT=8080

ExecStart=/usr/bin/java -Xms256m -Xmx768m -jar /var/www/snns-apartment/backend/target/snns-apartment-0.0.1-SNAPSHOT.jar

SuccessExitStatus=143
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Reload Systemd daemon, enable, and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable snns-backend
sudo systemctl start snns-backend
```

Check backend status:
```bash
sudo systemctl status snns-backend
# View live application logs:
# journalctl -u snns-backend -f
```

#### 6. Build the React Frontend
```bash
cd /var/www/snns-apartment/frontend
npm install
npm run build
```
*The compiled high-performance production assets will be generated in `/var/www/snns-apartment/frontend/dist`.*

#### 7. Configure Nginx Web Server & Reverse Proxy
Remove default Nginx welcome page and create a dedicated virtual host:
```bash
sudo rm -f /etc/nginx/sites-enabled/default
sudo nano /etc/nginx/sites-available/snns-apartment
```

Paste the following Nginx configuration (replace `yourdomain.com` with your actual domain):
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Maximum file upload size (Aadhaar KYC docs, payment receipts)
    client_max_body_size 25M;

    # 1. Frontend SPA Static Files (Vite Production Build)
    root /var/www/snns-apartment/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 2. Uploaded Document & Photo Delivery
    location /api/files/ {
        alias /var/www/snns-apartment/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # 3. REST API Reverse Proxy to Spring Boot (Port 8080)
    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 4. Interactive Swagger OpenAPI Docs
    location /swagger-ui/ {
        proxy_pass http://127.0.0.1:8080/swagger-ui/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    location /v3/api-docs/ {
        proxy_pass http://127.0.0.1:8080/v3/api-docs/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Enable the configuration and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/snns-apartment /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 8. Secure with HTTPS (Free Let's Encrypt SSL)
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
*Certbot will automatically obtain the SSL certificates, configure HTTPS encryption, and setup an auto-renewal cron timer.*

#### 9. Production Maintenance & Quick Commands
| Task | Command |
|---|---|
| **View Backend Live Logs** | `journalctl -u snns-backend -f` |
| **Restart Backend** | `sudo systemctl restart snns-backend` |
| **Check Nginx Syntax** | `sudo nginx -t` |
| **Reload Nginx Configuration** | `sudo systemctl reload nginx` |
| **Re-deploy Frontend Changes** | `cd /var/www/snns-apartment/frontend && git pull && npm run build` |
| **Re-deploy Backend Changes** | `cd /var/www/snns-apartment/backend && git pull && mvn package -DskipTests && sudo systemctl restart snns-backend` |
| **Test SSL Auto-Renewal** | `sudo certbot renew --dry-run` |

---

## 🛠 Manual Local Setup (Without Docker)

If you prefer to run services individually without Docker:

### 1. Database Setup
Install MySQL 8.0 locally and execute:
```sql
CREATE DATABASE snns_apartment_db;
CREATE USER 'snns_user'@'%' IDENTIFIED BY 'snns_password';
GRANT ALL PRIVILEGES ON snns_apartment_db.* TO 'snns_user'@'%';
FLUSH PRIVILEGES;
```

### 2. Start Backend
```bash
cd backend
mvn clean spring-boot:run
```
*(Runs at `http://localhost:8080`)*

### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
*(Runs at `http://localhost:5173`)*

---

## 📡 API Documentation & Swagger

When the backend is active, complete interactive OpenAPI documentation is available at:
👉 **[http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)**

### Core API Groups:
- **`/api/auth/**`** — Authentication (Login, Register, Refresh)
- **`/api/floors/**`** — Floor layout configuration
- **`/api/rooms/**`** — Flat inventory & status tracking
- **`/api/tenants/**`** — Resident onboarding, directory, KYC
- **`/api/bills/**`** — Rent generation, proof uploads, receipt verification
- **`/api/visitor-passes/**`** — Pre-approvals, gate requests, check-in, check-out
- **`/api/notifications/**`** — Unread alerts for tenant portals
- **`/api/complaints/**`** — Maintenance issue tracking
- **`/api/emergency-contacts/**`** — Local community service directory
- **`/api/settings/**`** — Society metadata, UPI QR codes, bank details

---

## 📄 License

This software is released under the **MIT License**. Feel free to use, modify, and distribute for personal or commercial community management.

<div align="center">
  <b>Developed for SNNS Apartment Community • Built with Java, Spring Boot, React, and MySQL</b>
</div>
