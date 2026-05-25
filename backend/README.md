# YSU Malaysia Backend API

> RESTful API backend for the Yemeni Students Union (YSU) Malaysia website built with NestJS, Fastify, Prisma, and PostgreSQL.

## 🎯 Project Overview

The YSU Backend provides a comprehensive API for managing the Yemeni Students Union website in Malaysia. It handles content management for news, events, gallery albums, branch information, team members, and provides secure admin authentication with JWT tokens.

**Live API**: https://ysumalaysia.org/api  
**Frontend**: https://ysumalaysia.org

---

## ✨ Features

### Core Functionality
- **Content Management System (CMS)**
  - News articles with rich content
  - Events with date and location
  - Photo gallery albums with multiple images
  - Branch information for different universities
  - Team member profiles (branch and union leadership)

### Authentication & Security
- **JWT-based authentication** for admin access
- **Password hashing** with bcrypt
- **Token expiration** (24-hour validity)
- **Protected routes** with Passport strategies
- **CORS enabled** for frontend communication

### Image Management
- **Local file storage** system
- **Sharp image processing** for WebP conversion
- **Automatic image optimization**
- **Organized folder structure** (news, events, gallery, branches, union-team)
- **Persistent uploads** at `/var/www/uploads`

### Database
- **PostgreSQL** with Prisma ORM
- **Type-safe queries** with generated Prisma Client
- **Relationship management** (one-to-many, cascade deletes)
- **Automatic timestamps** (createdAt, updatedAt)

---

## 🛠 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **NestJS** | ^11.0.1 | Backend framework |
| **Fastify** | ^5.3.2 | HTTP server (via @nestjs/platform-fastify) |
| **Prisma** | ^6.7.0 | ORM and database toolkit |
| **PostgreSQL** | 16+ | Primary database |
| **TypeScript** | ^5.7.3 | Programming language |
| **Sharp** | ^0.34.1 | Image processing |
| **JWT** | ^11.0.0 | Authentication tokens |
| **Bcrypt** | ^5.1.1 | Password hashing |
| **Class Validator** | ^0.14.1 | DTO validation |

---

## 📦 Prerequisites

- **Node.js**: v22 LTS (via nvm — see below)
- **nvm**: Node Version Manager
- **Docker**: For running PostgreSQL
- **Git**: Latest version

---

## 🚀 Installation

### 1. Install nvm

If you don't have nvm installed:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```

Restart your terminal, then verify:

```bash
nvm --version
```

### 2. Use Node 22

```bash
nvm install 22
nvm use 22
```

To make it the default for all future sessions:

```bash
nvm alias default 22
```

> ⚠️ Do not use Node 26+. Certain dependencies (`buffer-equal-constant-time`) are incompatible and will crash on startup.

### 3. Clone the Repository

```bash
git clone git@github.com:ya7ya-hussein/ysu-backend.git
cd ysu-backend
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Generate Prisma Client

```bash
npx prisma generate
```

---

## 🐳 Database Setup (Docker)

PostgreSQL runs in Docker. The `docker-compose.yml` is located in the `backend/` directory.

### 1. Set Up Environment Variables

Copy the development template and fill in your values:

```bash
cp .env.development .env
```

Open `.env` and replace all placeholders (`<...>`) with your actual values. Make sure `DB_USER`, `DB_PASSWORD`, and `DB_NAME` match the credentials in `DATABASE_URL`.

### 2. Start PostgreSQL

```bash
docker compose up -d
```

To stop it:

```bash
docker compose down
```

To stop and **wipe all data** (useful if you need to reinitialize with new credentials):

```bash
docker compose down -v
```

### 3. Push the Schema

```bash
npx prisma db push
```

### 4. View Database (Optional)

```bash
npx prisma studio
```

Access at: http://localhost:5555

---

## 🔐 Environment Variables

Use `.env.development` as a template. Copy it to `.env` and fill in your values.

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/ysu-backend` |
| `JWT_SECRET` | Secret key for JWT token signing | `myjwtsecret123` |
| `ADMIN_PASSWORD` | Admin login password | `supersecret123` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `BASE_URL` | Base URL for the API | `http://localhost:3333` |
| `UPLOADS_PATH` | Path for file uploads | `./uploads` |
| `DB_USER` | PostgreSQL user (Docker) | `postgres` |
| `DB_PASSWORD` | PostgreSQL password (Docker) | `secret` |
| `DB_NAME` | PostgreSQL database name (Docker) | `ysu-backend` |

---

## 🏃 Running the Application

### Development Mode

```bash
# Start with auto-reload
npm run start:dev
```

API will be available at: http://localhost:3333

### Production Mode

```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

### Other Commands

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:cov

# Lint code
npm run lint

# Format code
npm run format
```

---

## 📚 API Documentation

### Base URL
- **Development**: `http://localhost:3333`
- **Production**: `https://ysumalaysia.org/api`

### Authentication

All admin routes require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Endpoints

#### 🔐 Admin Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/admin-auth/login` | Admin login | No |

**Login Request Body:**
```json
{
  "password": "your-admin-password"
}
```

**Login Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": "24h"
}
```

---

#### 📰 News Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/news` | Get all news (public) | No |
| GET | `/news/:id` | Get news by ID (public) | No |
| POST | `/news` | Create news article | Yes |
| PATCH | `/news/:id` | Update news article | Yes |
| DELETE | `/news/:id` | Delete news article | Yes |

**News Object:**
```json
{
  "id": "clx123...",
  "title": "اتحاد الطلبة اليمنيين ينظم فعالية",
  "summary": "ملخص الخبر...",
  "content": "محتوى الخبر الكامل...",
  "imageUrl": "https://ysumalaysia.org/uploads/assets/news/image.webp",
  "createdAt": "2025-01-09T10:00:00.000Z",
  "updatedAt": "2025-01-09T10:00:00.000Z"
}
```

---

#### 📅 Events Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/events` | Get all events (public) | No |
| GET | `/events/:id` | Get event by ID (public) | No |
| POST | `/events` | Create event | Yes |
| PATCH | `/events/:id` | Update event | Yes |
| DELETE | `/events/:id` | Delete event | Yes |

**Event Object:**
```json
{
  "id": "clx456...",
  "title": "لقاء تعريفي للطلبة الجدد",
  "description": "وصف الفعالية...",
  "date": "2025-02-15T14:00:00.000Z",
  "location": "قاعة الاتحاد - كوالالمبور",
  "imageUrl": "https://ysumalaysia.org/uploads/assets/events/event.webp",
  "createdAt": "2025-01-09T10:00:00.000Z",
  "updatedAt": "2025-01-09T10:00:00.000Z"
}
```

---

#### 🖼 Gallery Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/gallery` | Get all albums (public) | No |
| GET | `/gallery/:id` | Get album by ID (public) | No |
| POST | `/gallery` | Create album | Yes |
| PATCH | `/gallery/:id` | Update album | Yes |
| DELETE | `/gallery/:id` | Delete album | Yes |

**Gallery Album Object:**
```json
{
  "id": "clx789...",
  "title": "فعالية رمضان 2025",
  "description": "صور من فعالية رمضان...",
  "mainImage": "https://ysumalaysia.org/uploads/assets/gallery/main.webp",
  "createdAt": "2025-01-09T10:00:00.000Z",
  "updatedAt": "2025-01-09T10:00:00.000Z",
  "images": [
    {
      "id": "img1...",
      "url": "https://ysumalaysia.org/uploads/assets/gallery/photo1.webp",
      "galleryId": "clx789..."
    }
  ]
}
```

---

#### 🏢 Branches Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/branches` | Get all branches (public) | No |
| GET | `/branches/:id` | Get branch by ID (public) | No |
| POST | `/branches` | Create branch | Yes |
| PATCH | `/branches/:id` | Update branch | Yes |
| DELETE | `/branches/:id` | Delete branch | Yes |

**Branch Object:**
```json
{
  "id": "clxabc...",
  "universityName": "جامعة مالايا",
  "city": "كوالالمبور",
  "address": "العنوان الكامل...",
  "phone": "+60123456789",
  "email": "um@ysumalaysia.org",
  "facebook": "https://facebook.com/ysu-um",
  "instagram": "https://instagram.com/ysu_um",
  "linkedin": "https://linkedin.com/company/ysu-um",
  "description": "وصف الفرع...",
  "imageUrl": "https://ysumalaysia.org/uploads/assets/branches/um.webp",
  "establishedAt": "2020-01-01T00:00:00.000Z",
  "createdAt": "2025-01-09T10:00:00.000Z",
  "updatedAt": "2025-01-09T10:00:00.000Z",
  "teamMembers": []
}
```

---

#### 👥 Team Members Management (Branch Teams)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/team-members/branch/:branchId` | Get team by branch (public) | No |
| POST | `/team-members` | Create team member | Yes |
| PATCH | `/team-members/:id` | Update team member | Yes |
| DELETE | `/team-members/:id` | Delete team member | Yes |

**Team Member Object:**
```json
{
  "id": "clxdef...",
  "name": "أحمد محمد",
  "position": "رئيس الفرع",
  "type": "الهيئة التنفيذية",
  "imageUrl": "https://ysumalaysia.org/uploads/assets/branches/member.webp",
  "branchId": "clxabc..."
}
```

---

#### 🏛 Union Team Management (General Union Leadership)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/union-team` | Get all union members (public) | No |
| GET | `/union-team/periods` | Get all periods (public) | No |
| GET | `/union-team/period/:period` | Get members by period (public) | No |
| POST | `/union-team` | Create union member | Yes |
| PATCH | `/union-team/:id` | Update union member | Yes |
| DELETE | `/union-team/:id` | Delete union member | Yes |

**Union Team Member Object:**
```json
{
  "id": "clxghi...",
  "name": "محمد أحمد",
  "position": "رئيس الاتحاد العام",
  "type": "الهيئة الإدارية للاتحاد العام",
  "imageUrl": "https://ysumalaysia.org/uploads/assets/union-team/president.webp",
  "period": "2025-2026",
  "createdAt": "2025-01-09T10:00:00.000Z",
  "updatedAt": "2025-01-09T10:00:00.000Z"
}
```

---

### Deployment Updates

```bash
# SSH to server
ssh deploy@your-server-ip

# Navigate to project
cd /var/www/ysumalaysia.org/backend/ysu-backend

# Pull latest changes
git pull origin main

# Install new dependencies (if any)
npm install

# Generate Prisma Client (if schema changed)
npx prisma generate

# Run migrations (if needed)
npx prisma migrate deploy

# Build
npm run build

# Restart PM2
pm2 restart ysu-backend

# Check logs
pm2 logs ysu-backend --lines 100
```

---

## 🔧 Troubleshooting

### Wrong Node Version

```bash
nvm use 22
```

If you see `buffer-equal-constant-time` or `SlowBuffer` errors, you're on Node 26+. Switch to Node 22.

### Database Authentication Failed

Credentials in `DATABASE_URL` must match `DB_USER` and `DB_PASSWORD`. If you changed credentials after the container was already created, wipe the volume and recreate:

```bash
docker compose down -v
docker compose up -d
```

### Permission Denied on Uploads

Make sure `UPLOADS_PATH` in your `.env` points to a directory your user can write to. For development, `./uploads` works fine.

### PM2 Process Not Starting

```bash
# Check logs
pm2 logs ysu-backend

# Restart PM2
pm2 restart ysu-backend

# Delete and restart
pm2 delete ysu-backend
pm2 start ecosystem.config.js
```

---

## 📝 Database Schema

### Models

#### News
- `id`: String (CUID)
- `title`: String
- `summary`: String
- `content`: String (rich text)
- `imageUrl`: String
- `createdAt`: DateTime
- `updatedAt`: DateTime

#### Event
- `id`: String (CUID)
- `title`: String
- `description`: String
- `date`: DateTime
- `location`: String
- `imageUrl`: String
- `createdAt`: DateTime
- `updatedAt`: DateTime

#### Gallery
- `id`: String (CUID)
- `title`: String
- `description`: String (optional)
- `mainImage`: String
- `images`: GalleryImage[] (one-to-many)
- `createdAt`: DateTime
- `updatedAt`: DateTime

#### GalleryImage
- `id`: String (CUID)
- `url`: String
- `galleryId`: String (foreign key)
- `gallery`: Gallery (relation)

#### Branch
- `id`: String (CUID)
- `universityName`: String
- `city`: String
- `address`: String
- `phone`: String
- `email`: String (optional)
- `facebook`: String (optional)
- `instagram`: String (optional)
- `linkedin`: String (optional)
- `description`: String
- `imageUrl`: String
- `establishedAt`: DateTime
- `teamMembers`: TeamMember[] (one-to-many, cascade delete)
- `createdAt`: DateTime
- `updatedAt`: DateTime

#### TeamMember
- `id`: String (CUID)
- `name`: String
- `position`: String
- `type`: String (الهيئة التنفيذية / لجنة الرقابة والتفتيش)
- `imageUrl`: String
- `branchId`: String (foreign key)
- `branch`: Branch (relation)

#### UnionTeamMember
- `id`: String (CUID)
- `name`: String
- `position`: String
- `type`: String (الهيئة الإدارية / هيئة الرقابة)
- `imageUrl`: String
- `period`: String (e.g., "2025-2026")
- `createdAt`: DateTime
- `updatedAt`: DateTime

---

## 📄 License

This project is private and proprietary.

---

## 👥 Team

**Yemeni Students Union (YSU) Malaysia**
- Website: https://ysumalaysia.org
- Contact: info@ysumalaysia.org

---

**Built by YSU Malaysia Development Team**
