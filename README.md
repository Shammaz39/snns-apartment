<div align="center">

# 🏢 SNNS Apartment Management System

**ഒരു ഫുൾ-സ്റ്റാക്ക് അപ്പാർട്ട്‌മെന്റ് & കമ്മ്യൂണിറ്റി മാനേജ്‌മെന്റ് പ്ലാറ്റ്‌ഫോം**

![Java](https://img.shields.io/badge/Java-17-orange?logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen?logo=springboot)
![React](https://img.shields.io/badge/React-18.3-blue?logo=react)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?logo=mysql)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?logo=tailwindcss)

</div>

---

## 📋 Table of Contents

1. [Overview](#-overview)
2. [Tech Stack & Versions](#-tech-stack--versions)
3. [Features](#-features)
4. [Project Structure](#-project-structure)
5. [Prerequisites](#-prerequisites)
6. [Quick Start with Docker (Recommended)](#-quick-start-with-docker-recommended)
7. [Manual Setup (Without Docker)](#-manual-setup-without-docker)
8. [Default Login Credentials](#-default-login-credentials)
9. [API Documentation](#-api-documentation)
10. [Deployment to Production Server](#-deployment-to-production-server)
11. [Environment Variables](#-environment-variables)
12. [Screenshots](#-screenshots)

---

## 🏗 Overview

SNNS Apartment Management System is a complete web-based platform to manage residential apartment complexes. It covers tenant onboarding, rent billing with payment proof verification, visitor management with real-time notifications, community events, complaints, security gate operations, and emergency contacts — all in one unified dashboard.

---

## 🛠 Tech Stack & Versions

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Java** | 17 (LTS) | Core language |
| **Spring Boot** | 3.3.4 | Application framework |
| **Spring Security** | 6.3.3 | Authentication & Authorization (JWT) |
| **Spring Data JPA** | 3.3.4 | ORM & Database access |
| **Hibernate** | 6.5.x | JPA implementation |
| **MySQL Connector/J** | 8.x | Database driver |
| **JJWT** | 0.12.5 | JSON Web Token library |
| **SpringDoc OpenAPI** | 2.6.0 | Swagger API documentation |
| **Maven** | 3.9+ | Build tool |

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 18.3.1 | UI framework |
| **React Router** | 6.26.2 | Client-side routing |
| **Axios** | 1.7.7 | HTTP client |
| **Lucide React** | 0.446.0 | Icon library |
| **Tailwind CSS** | 3.4.13 | Utility-first CSS |
| **Vite** | 5.4.8 | Build tool & dev server |
| **Node.js** | 22 (LTS) | JavaScript runtime |

### Database
| Technology | Version | Purpose |
|-----------|---------|---------|
| **MySQL** | 8.0 | Primary relational database |

### Infrastructure
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Docker** | 24+ | Containerization |
| **Docker Compose** | 2.x | Multi-container orchestration |
| **Nginx** | Alpine (latest) | Frontend static file server & API reverse proxy |

---

## ✨ Features

### 👤 Admin Dashboard
- Real-time stats: occupied/vacant rooms, revenue, pending verifications
- Floor & Room management (add, edit, delete, status tracking)
- Tenant onboarding & deboarding with KYC documents
- Monthly rent bill generation (single room or bulk)
- Payment receipt verification (approve / reject with admin remarks)
- Community events & circular notices with popup alerts
- Emergency contacts management (plumber, electrician, hospital, etc.)
- Security guard account creation
- Apartment-level settings (name, logo, UPI ID, bank details)

### 🏠 Resident (Tenant) Portal
- View monthly bills & payment history
- Upload payment screenshot + UTR reference
- Pre-approve expected visitors (gate pass)
- Real-time visitor entry notifications (approve / deny)
- Edit personal profile & KYC (Aadhaar, photo, family members)
- View emergency service contacts
- Submit & track maintenance complaints

### 🛡 Security Gate Terminal
- Register visitors at gate → send live notification to resident
- Direct entry approval (after phone call verification with audit log)
- Check-in pre-approved visitors with single click
- Check-out visitors
- Resident phone directory for quick reference
- Only OCCUPIED rooms shown (vacant rooms blocked)

### 🔔 Visitor Management (3 Modes)
1. **Security Request → Resident Notification → Resident Approves → Gate Check-In**
2. **Security Direct Approval** (phone call verified, guard name + audit note auto-logged)
3. **Tenant Pre-Approval** (expected guest registered in advance, room locked to own flat)

---

## 📁 Project Structure

```
SNNS Apartment/
├── backend/                    # Spring Boot REST API
│   ├── src/main/java/com/snns/apartment/
│   │   ├── config/            # Security, JWT, CORS, Web config
│   │   ├── controller/        # REST API endpoints (14 controllers)
│   │   ├── dataseed/          # Auto-creates default admin on first run
│   │   ├── dto/               # Request/Response data transfer objects
│   │   ├── model/             # JPA entities (19 models)
│   │   ├── repository/        # Spring Data JPA repositories
│   │   └── service/           # Business logic layer
│   ├── src/main/resources/
│   │   └── application.yml    # App configuration
│   ├── Dockerfile             # Multi-stage Docker build
│   └── pom.xml                # Maven dependencies
│
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── api/client.js      # Axios HTTP client with JWT interceptor
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # 13 page components
│   │   └── App.jsx            # Router & layout
│   ├── nginx.conf             # Nginx reverse proxy config
│   ├── Dockerfile             # Multi-stage Docker build
│   └── package.json           # npm dependencies
│
├── docker-compose.yml          # One-command full stack orchestration
├── .gitignore                  # Git ignore rules
└── README.md                   # This file
```

---

## ⚙ Prerequisites

You need **only Docker** installed to run this project. Nothing else.

| Tool | Minimum Version | Download Link |
|------|----------------|---------------|
| **Docker Desktop** | 4.0+ | [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop) |
| **Git** | 2.30+ | [https://git-scm.com/downloads](https://git-scm.com/downloads) |

> **Note:** Docker Desktop includes Docker Compose. After installing, make sure Docker Desktop is **running** (check the system tray icon).

### If Running Without Docker (Manual Setup)
| Tool | Version | Download Link |
|------|---------|---------------|
| Java JDK | 17 | [https://adoptium.net/temurin/releases/?version=17](https://adoptium.net/temurin/releases/?version=17) |
| Maven | 3.9+ | [https://maven.apache.org/download.cgi](https://maven.apache.org/download.cgi) |
| Node.js | 22 LTS | [https://nodejs.org/](https://nodejs.org/) |
| MySQL Server | 8.0 | [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/) |

---

## 🚀 Quick Start with Docker (Recommended)

This is the **easiest way** — one command starts everything (database, backend, frontend).

### Step 1: Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/snns-apartment.git
cd snns-apartment
```

### Step 2: Start All Services
```bash
docker compose up --build -d
```

This command will:
1. ✅ Download MySQL 8.0 image
2. ✅ Build the Java backend (compiles code inside Docker)
3. ✅ Build the React frontend (builds inside Docker)
4. ✅ Start MySQL database on port **3306**
5. ✅ Start Backend API on port **8080**
6. ✅ Start Frontend UI on port **3000**
7. ✅ Auto-create the database schema (Hibernate auto-DDL)
8. ✅ Auto-create default admin account

> ⏱ **First run takes 3–5 minutes** (downloads images + compiles code). Subsequent runs start in seconds.

### Step 3: Open the Application
Open your browser and go to:

👉 **[http://localhost:3000](http://localhost:3000)**

### Step 4: Stop All Services
```bash
docker compose down
```

To stop and **delete all data** (fresh start):
```bash
docker compose down -v
```

### Useful Docker Commands
```bash
# View running containers
docker compose ps

# View backend logs (useful for debugging)
docker compose logs -f backend

# View frontend logs
docker compose logs -f frontend

# Restart only the backend
docker compose restart backend

# Rebuild after code changes
docker compose up --build -d
```

---

## 🔧 Manual Setup (Without Docker)

### Step 1: Install MySQL 8.0
1. Download and install MySQL 8.0 from [https://dev.mysql.com/downloads/](https://dev.mysql.com/downloads/)
2. Open MySQL Command Line or MySQL Workbench
3. Create the database:
```sql
CREATE DATABASE snns_apartment_db;
CREATE USER 'snns_user'@'%' IDENTIFIED BY 'snns_password';
GRANT ALL PRIVILEGES ON snns_apartment_db.* TO 'snns_user'@'%';
FLUSH PRIVILEGES;
```

### Step 2: Run the Backend
```bash
cd backend

# Option A: Using Maven Wrapper (no Maven installation needed)
./mvnw spring-boot:run

# Option B: Using installed Maven
mvn spring-boot:run
```

The backend starts at **http://localhost:8080**

> The database tables are auto-created by Hibernate on first startup.

### Step 3: Run the Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend starts at **http://localhost:5173** (Vite dev server)

> In development mode, update `frontend/vite.config.js` to proxy API calls to `localhost:8080`.

### Step 4: Build Frontend for Production
```bash
cd frontend
npm run build
```

The built files appear in `frontend/dist/`. Serve them with Nginx or any static file server.

---

## 🔑 Default Login Credentials

On first startup, the system auto-creates a **Super Admin** account:

| Field | Value |
|-------|-------|
| **Username** | `admin@snnsapartment` or `admin` |
| **Password** | `Abc@123` |
| **Role** | ADMIN |

> ⚠️ **Important:** Change the admin password immediately after first login in a production environment.

### Other User Types (created by Admin)
| Role | Username Format | Default Password | Example |
|------|----------------|-----------------|---------|
| **Tenant** | Room number (e.g., `101`, `201`) | `Abc@123` | Login with `201` |
| **Security Guard** | Phone number (e.g., `+91 9777111222`) | `Abc@123` | Login with phone |

---

## 📡 API Documentation

Once the backend is running, access the interactive Swagger UI:

👉 **[http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)**

### Key API Endpoints

| Module | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| **Auth** | POST | `/api/auth/login` | Login (returns JWT token) |
| **Floors** | GET/POST | `/api/floors` | Manage floors |
| **Rooms** | GET/POST/PUT/DELETE | `/api/rooms` | Manage rooms |
| **Tenants** | GET/POST/PUT/DELETE | `/api/tenants` | Manage tenants |
| **Bills** | GET/POST | `/api/bills` | Billing & payment |
| **Visitor Passes** | GET/POST/PUT | `/api/visitor-passes` | Visitor management |
| **Notifications** | GET | `/api/notifications` | Real-time alerts |
| **Complaints** | GET/POST/PUT | `/api/complaints` | Maintenance tickets |
| **Events** | GET/POST/PUT/DELETE | `/api/events` | Community events |
| **Emergency Contacts** | GET/POST/PUT/DELETE | `/api/emergency-contacts` | Service helplines |
| **Settings** | GET/PUT | `/api/settings` | Apartment configuration |

---

## 🌐 Deployment to Production Server

### Option A: Deploy with Docker on a VPS/Cloud Server

#### 1. Get a Server
Purchase a VPS from providers like:
- **DigitalOcean** (Droplet — \$6/month)
- **AWS EC2** (t3.micro — free tier eligible)
- **Google Cloud** (e2-micro — free tier)
- **Hostinger VPS** (\$5/month)

Requirements: **Ubuntu 22.04+**, minimum **2GB RAM**, **20GB disk**

#### 2. Install Docker on Server
```bash
# SSH into your server
ssh root@YOUR_SERVER_IP

# Install Docker
curl -fsSL https://get.docker.com | sh

# Add your user to docker group
sudo usermod -aG docker $USER

# Verify
docker --version
docker compose version
```

#### 3. Clone & Deploy
```bash
git clone https://github.com/YOUR_USERNAME/snns-apartment.git
cd snns-apartment
docker compose up --build -d
```

#### 4. Point Your Domain
In your domain's DNS settings (GoDaddy / Namecheap / Cloudflare):
```
Type: A
Name: @ (or subdomain like "apartment")
Value: YOUR_SERVER_IP
TTL: Auto
```

#### 5. Setup Nginx Reverse Proxy with SSL (HTTPS)
```bash
# Install Nginx & Certbot on server
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx -y

# Create Nginx config
sudo nano /etc/nginx/sites-available/snns-apartment
```

Paste this config (replace `yourdomain.com`):
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 20M;
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/snns-apartment /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Get free SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Your app is now live at **https://yourdomain.com** 🎉

### Option B: Deploy on Railway / Render (Easiest, No Server Management)
1. Push code to GitHub
2. Go to [Railway.app](https://railway.app) or [Render.com](https://render.com)
3. Connect your GitHub repository
4. Add a MySQL service
5. Deploy — done!

---

## 🔐 Environment Variables

These can be set in `docker-compose.yml` or as system environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `SPRING_DATASOURCE_URL` | `jdbc:mysql://mysql-db:3306/snns_apartment_db...` | JDBC connection string |
| `SPRING_DATASOURCE_USERNAME` | `snns_user` | MySQL username |
| `SPRING_DATASOURCE_PASSWORD` | `snns_password` | MySQL password |
| `MYSQL_ROOT_PASSWORD` | `rootpassword` | MySQL root password |
| `MYSQL_DATABASE` | `snns_apartment_db` | Database name |
| `FILE_UPLOAD_DIR` | `/app/uploads` | File upload directory |

> ⚠️ **Production Security:** Change all default passwords before deploying to production!

---

## 📸 Screenshots

| Admin Dashboard | Resident Portal |
|:-:|:-:|
| Floor & room stats, pending receipts, quick actions | Bill payments, visitor pre-approval, profile |

| Gatekeeper Terminal | Visitor Notification |
|:-:|:-:|
| Register visitors, check-in/out, resident directory | Real-time approve/deny alerts for tenants |

---

## 📄 License

This project is developed for **SNNS Apartment** community management.

---

<div align="center">
  <b>Built with ❤️ using Spring Boot + React + MySQL</b>
</div>
