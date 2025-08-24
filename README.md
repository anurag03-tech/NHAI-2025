# NHAI Toilets Management System

A complete solution for managing toilet facilities across India’s National Highways, featuring a mobile app for travelers and a comprehensive web dashboard for moderators and NHAI administrators.

## 🚀 Get Started

- 📱 **Mobile App for Users (Highway Travelers):** [Download Android APK](https://drive.google.com/file/d/1gwN6LDuOGszCzBJ49tpcCIHqDoa_PC9O/view?usp=sharing)
- 🔧 **Webapp for Moderators & NHAI Administrators:** [nhai-toilets-webapp.onrender.com](https://nhai-toilets-webapp.onrender.com)

## 🏗️ System Architecture

```
NHAI-2025/
├── Admin/          # React Admin Panel (For NHAI Admin + Moderator)
├── Backend/        # Node.js Express API Server (Common)
├── Mobile App/     # React Native Mobile App (For Users)
└── README.md       # This file
```

### 1. 📱 Mobile App (React Native + Expo)

**For Users - Cross-platform mobile application for highway travelers**

**Features:**

- 📍 Find Nearby Toilets - Locate facilities along your route with real-time GPS tracking
- 🌐 Real-time Updates - Get current facility status, cleanliness, and availability
- ⭐ Rate & Review - Share your experience and help improve facilities for everyone
- ⚠️ Submit Complaints - Report facility issues, cleanliness problems, and maintenance concerns

**Tech Stack:** React Native, Expo, Google Maps API, Real-time location services, Cross-platform compatibility (iOS/Android)

### 2. 🖥️ Moderator Web Dashboard (React + Vite)

**For Moderators - Facility management and user support interface**

**Features:**

- 🛡️ Facility Management - Add and update toilet information and details
- 💬 Resolve User Complaints - Handle and respond to facility-related issues
- ✅ Status Updates - Maintain real-time facility availability status
- ⭐ Review Monitoring - Oversee and manage user feedback and ratings

**Tech Stack:** React 18, Vite, Material-UI/Tailwind CSS

### 3. 🏛️ Admin Control Panel (React + Vite)

**For NHAI Admins - Comprehensive system oversight and management**

**Features:**

- 📊 Dashboard Control - Centralized management of all highway facilities
- 📈 Analytics & Reports - Comprehensive moderator statistics and performance metrics
- 🗨️ Complaint Resolution - Efficient handling of user feedback and issues
- 🚫 Send Penalties - Issue penalties for moderator violations and non-compliance

**Tech Stack:** React 18, Vite, Material-UI/Tailwind CSS

### 4. 🔧 Backend API (Node.js + Express)

**RESTful API server handling all business logic and database operations**

**Features:**

- 🔐 JWT Authentication - Secure user authentication and session management
- 📧 Email Notifications - Automated alerts and communication system
- 👥 Role-based Access Control - Multi-level user permissions (User/Moderator/Admin)
- 🗄️ MongoDB Integration - Scalable database operations and data management
- 🔗 RESTful Endpoints - Clean API architecture for all platform interactions

**Tech Stack:** Node.js, Express.js, MongoDB, JWT authentication, Email service integration, RESTful API design

## 🚀 Quick Start

### Clone Repository

```bash
git clone https://github.com/anurag03-tech/NHAI-2025.git
cd NHAI-2025
```

## 🔧 Environment Setup

Each component requires specific environment variables. Create `.env` files in respective directories:

### Admin Panel (.env)

```env
VITE_BACKEND_URL=http://localhost:3000
VITE_ADMIN_EMAIL=admin@nahi.toilets
VITE_ADMIN_PASSWORD=Admin@12345
VITE_MODERATOR_EMAIL=demo-moderator@nahi.toilets
VITE_MODERATOR_PASSWORD=Demo@12345
```

### Backend (.env)

```env
MONGO_URI=your_mongodb_connection_string
NODE_ENV=development
PORT=3000
JWT_SECRET=your_jwt_secret_key
EMAIL=your_email@gmail.com
EMAIL_PASSWORD=your_google_app_password
ADMIN_EMAIL=admin@nahi.toilets
ADMIN_PASSWORD=Admin@12345
MODERATOR_EMAIL=demo-moderator@nahi.toilets
MODERATOR_PASSWORD=Demo@12345
BACKEND_URL=http://localhost:3000
```

### Mobile App (.env)

```env
EXPO_PUBLIC_BACKEND_URI=https://192.168.xx.xx:3000
EXPO_PUBLIC_GOOGLE_API_KEY=your_google_maps_api_key
```

## 🚀 Installation & Setup

### 1. Setup Backend (Start Here)

```bash
cd Backend
npm install
npm run dev
```

### 2. Setup Admin Panel

```bash
cd Admin
npm install
npm run dev
```

### 3. Setup Mobile App

```bash
cd "Mobile App"
npm install
npx expo start
```

## 🔐 Default Credentials

### Admin Login

- Email: `admin@nahi.toilets`
- Password: `Admin@12345`

### Moderator Login

- Email: `demo-moderator@nahi.toilets`
- Password: `Demo@12345`
