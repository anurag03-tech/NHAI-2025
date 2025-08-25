# NHAI Toilets Management System

A complete solution for managing toilet facilities across India’s National Highways, featuring a mobile app for travelers and a comprehensive web dashboard for operators and NHAI administrators.

## 🚀 Get Started

- 📱 **Mobile App for Users (Highway Travelers):** [Download Android APK](https://drive.google.com/file/d/1gwN6LDuOGszCzBJ49tpcCIHqDoa_PC9O/view?usp=sharing)
- 🔧 **Webapp for Operators & NHAI Administrators:** [nhai-toilets-webapp.onrender.com](https://nhai-toilets-webapp.onrender.com)

## 🏗️ System Architecture

```
NHAI-2025/
├── Admin/          # React Admin Panel (For NHAI Admin + Operator)
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

**Tech Stack:** React Native, Expo, Google Maps API, Real-time location services

### 2. 🖥️ Operator Web Dashboard (React + Vite)

**For Operators - Facility management and user support interface**

**Features:**

- 🛡️ Facility Management - Add and update toilet information and details
- 💬 Resolve User Complaints - Handle and respond to facility-related issues
- ✅ Status Updates - Maintain real-time facility availability status
- ⭐ Review Monitoring - Oversee and manage user feedback and ratings

**Tech Stack:** React 18, Vite, Tailwind CSS, shadcn ui

### 3. 🏛️ Admin Control Panel (React + Vite)

**For NHAI Admins - Comprehensive system oversight and management**

**Features:**

- 📊 Dashboard Control - Centralized management of all highway facilities
- 📈 Analytics & Reports - Comprehensive operator statistics and performance metrics
- 🗨️ Complaint Resolution - Efficient handling of user feedback and issues
- 🚫 Send Penalties - Issue penalties for operator violations and non-compliance

**Tech Stack:** React 18, Vite, Tailwind CSS, shadcn ui

### 4. 🔧 Backend API (Node.js + Express)

**RESTful API server handling all business logic and database operations**

**Features:**

- 🔐 JWT Authentication - Secure user authentication and session management
- 📧 Email Notifications - Communication system
- 👥 Role-based Access Control - Multi-level user permissions (User/Operator/Admin)
- 🗄️ MongoDB Integration - Scalable database operations and data management
- 🔗 RESTful Endpoints - Clean API architecture for all platform interactions

**Tech Stack:** Node.js, Express.js, MongoDB, JWT authentication, Nodemailer

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
VITE_ADMIN_EMAIL=admin@nhai.toilets
VITE_ADMIN_PASSWORD=Admin@12345
VITE_OPERATOR_EMAIL=demo-operator@nhai.toilets
VITE_OPERATOR_PASSWORD=Demo@12345
```

### Backend (.env)

```env
MONGO_URI=your_mongodb_connection_string
NODE_ENV=development
PORT=3000
JWT_SECRET=your_jwt_secret_key
EMAIL=your_email@gmail.com
EMAIL_PASSWORD=your_google_app_password
ADMIN_EMAIL=admin@nhai.toilets
ADMIN_PASSWORD=Admin@12345
OPERATOR_EMAIL=demo-operator@nhai.toilets
OPERATOR_PASSWORD=Demo@12345
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

- Email: `admin@nhai.toilets`
- Password: `Admin@12345`

### Operator Login

- Email: `demo-operator@nhai.toilets`
- Password: `Demo@12345`
