# YSU Malaysia Frontend

> Modern, bilingual (Arabic/English) web application for the Yemeni Students Union in Malaysia built with Angular 19.

## 🎯 Project Overview

The YSU Frontend is a comprehensive web platform serving the Yemeni Students Union community in Malaysia. It provides information about branches, events, news, university guides, team members, and serves as the primary digital presence for the union.

**Live Website**: https://ysumalaysia.org  
**Backend API**: https://ysumalaysia.org/api

---


## 🛠 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Angular** | 19.2.0 | Frontend framework |
| **TypeScript** | 5.7.2 | Programming language |
| **RxJS** | 7.8.0 | Reactive programming |
| **SCSS** | - | Styling |
| **EmailJS** | 3.2.0 | Contact form integration |
| **Nginx** | 1.24+ | Web server (production) |

### Angular Features Used
- **Standalone Components** - Modern component architecture
- **Signals** - Reactive state management
- **Router** - Client-side routing with lazy loading
- **HTTP Client** - RESTful API communication
- **Forms** - Reactive and template-driven forms
- **Guards** - Route protection
- **Interceptors** - HTTP request/response handling
- **Directives** - Custom directives for lazy loading
- **Pipes** - Custom date formatting

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: >= 18.19.1 or >= 20.11.1 or >= 22.0.0
- **npm**: >= 8.0.0
- **Angular CLI**: >= 19.0.0
- **Git**: Latest version

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone git@github.com:ya7ya-hussein/ysu-frontend.git
cd ysu-frontend
```

### 2. Install Angular CLI (if not installed)

```bash
npm install -g @angular/cli@19
```

### 3. Install Dependencies

```bash
npm install
```

---

## 🔐 Environment Configuration

### Development Environment

Create `src/app/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3333'
};
```

### Production Environment

Create `src/app/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://ysumalaysia.org/api'
};
```

### Environment Variables

| Variable | Description | Development | Production |
|----------|-------------|-------------|------------|
| `production` | Production mode flag | `false` | `true` |
| `apiUrl` | Backend API base URL | `http://localhost:3333` | `https://ysumalaysia.org/api` |

---

## 🏃 Running the Application

### Development Server

```bash
# Start development server
ng serve

# Or use npm script
npm start
```

Navigate to: http://localhost:4200

The application will automatically reload when you change source files.

### Build for Production

```bash
# Production build
ng build

# Or use npm script
npm run build
```

Build artifacts will be stored in the `dist/ysu-frontend/` directory.

### Other Commands

```bash
# Run unit tests
ng test

# Run tests with code coverage
ng test --code-coverage

# Generate component
ng generate component component-name

# Generate service
ng generate service service-name

# Lint code
ng lint
```


**Features:**
- Automatic president/vice-president ordering
- Separate display for leadership and regular members
- Period-based filtering (current/historical)
- Administrative and supervisory team separation

---

## 🔐 Admin Panel

### Access

**URL**: https://ysumalaysia.org/admin-ysu-login-e47b9f2ac81e4ffdb47d9a87c36c1abf

**Default Credentials**: Check with system administrator

### Admin Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/admin-panel` | AdminPanelComponent | Main admin layout |
| `/admin-panel/dashboard` | DashboardComponent | Statistics overview |
| `/admin-panel/news` | AdminNewsComponent | News management |
| `/admin-panel/events` | AdminEventsComponent | Events management |
| `/admin-panel/gallery` | AdminGalleryComponent | Gallery management |
| `/admin-panel/branches` | AdminBranchesComponent | Branches listing |
| `/admin-panel/branches/:id` | BranchDetailComponent | Branch details |
| `/admin-panel/branches/:id/team` | BranchTeamComponent | Branch team management |
| `/admin-panel/union-team` | UnionTeamComponent | Union leadership |

### Features

1. **Dashboard**
   - Content statistics (news, events, branches, gallery)
   - Quick navigation to management pages

2. **Content Management**
   - Create, read, update, delete (CRUD) operations
   - Rich text editor for content
   - Image upload with preview
   - Form validation

3. **Branch Management**
   - Manage university branches
   - Add/edit branch teams
   - Team member roles and positions

4. **Team Management**
   - Union leadership by period
   - Administrative and supervisory teams
   - Historical period management

---

## 🌐 Deployment

### Production Build

```bash
# Create production build
npm run build

# Output: dist/ysu-frontend/browser/
```

### Deployment Workflow

```bash
# On local machine
git add .
git commit -m "Your commit message"
git push origin main

# On production server
ssh deploy@your-server-ip
cd /var/www/ysumalaysia.org/frontend/ysu-frontend

# Pull latest changes
git pull origin main

# Install dependencies (if needed)
npm install

# Build
npm run build

# Copy to web directory
sudo cp -r dist/ysu-frontend/browser/* /var/www/ysumalaysia.org/frontend/

# Restart Nginx
sudo systemctl reload nginx
```

---

## 🎨 Styling & Theming

### Color Palette

```scss
// Primary colors
$primary-blue: #5174b9;      // Main brand color
$primary-blue-dark: #3f5a8f; // Hover states
$primary-blue-light: #6b8dd6; // Light accents

// Neutral colors
$text-dark: #2c3e50;          // Primary text
$text-light: #5a6c7d;         // Secondary text
$background-light: #f5f7fa;   // Page background
$white: #ffffff;              // Cards, sections

// Functional colors
$success: #28a745;
$error: #dc3545;
$warning: #ffc107;
```

### Typography

```scss
// Font family
font-family: 'Cairo', sans-serif; 
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; // For English

// Font sizes
$font-size-xs: 12px;
$font-size-sm: 14px;
$font-size-base: 16px;
$font-size-lg: 18px;
$font-size-xl: 24px;
$font-size-2xl: 32px;
$font-size-3xl: 42px;
```

### Responsive Breakpoints

```scss
// Breakpoints
$mobile: 480px;
$tablet: 768px;
$desktop: 991px;
$large-desktop: 1200px;

// Media query mixins
@mixin mobile {
  @media (max-width: #{$mobile}) { @content; }
}

@mixin tablet {
  @media (max-width: #{$tablet}) { @content; }
}

@mixin desktop {
  @media (min-width: #{$desktop}) { @content; }
}
```

---

## 🧪 Testing

```bash
# Run unit tests
ng test

# Run tests with coverage
ng test --code-coverage

# View coverage report
open coverage/index.html
```

---


#### 4. Admin Panel Not Accessible

```bash
# Check admin login route
https://ysumalaysia.org/admin-ysu-login-e47b9f2ac81e4ffdb47d9a87c36c1abf

# Check token in localStorage
console.log(localStorage.getItem('admin_token'));
```

---


## 📄 License

This project is private and proprietary.

---


**Built for the Yemeni Students community in Malaysia**# YSU-Frontend-Refrence
# YSU-Frontend-Refrence
