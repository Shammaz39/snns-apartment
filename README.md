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

To deploy this project to your own domain (e.g. `apartment.yourdomain.com`) on any Cloud VPS (DigitalOcean, AWS, Linode, Hostinger, GCP):

### Step 1: Configure DNS
Log in to your domain DNS provider (GoDaddy, Namecheap, Cloudflare) and create an **A Record**:
- **Type:** `A`
- **Name / Host:** `@` *(or subdomain like `apartment`)*
- **Value:** `<YOUR_SERVER_IP>`
- **TTL:** `Auto`

### Step 2: Install Docker on your VPS
SSH into your server and run:
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

### Step 3: Clone & Start Application
```bash
git clone https://github.com/Shammaz39/snns-apartment.git
cd snns-apartment
docker compose up -d --build
```

### Step 4: Configure HTTPS (Free SSL via Let's Encrypt)
Install Host Nginx and Certbot:
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

Enable the configuration and obtain SSL:
```bash
sudo ln -s /etc/nginx/sites-available/snns /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Your platform is now securely accessible worldwide at **`https://yourdomain.com`**! 🚀

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
