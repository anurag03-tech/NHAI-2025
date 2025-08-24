# NHAI Toilets Management System

A comprehensive toilet management system for NHAI (National Highways Authority of India) consisting of an admin panel, backend API, and mobile application.

## 🏗️ Project Structure

```
NHAI-2025/
├── Admin/          # React Admin Panel (For NHAI Admin + Moderator)
├── Backend/        # Node.js Express API Server (Common)
├── Mobile App/     # React Native Mobile App (For Users)
└── README.md       # This file
```

## 🚀 Quick Start

### Clone Repository

```bash
git clone https://github.com/anurag03-tech/NHAI-2025.git
cd NHAI-2025
```

## 📱 Components Overview

### 1. Admin Panel (React + Vite)

Web-based dashboard for managing toilets, users, and monitoring system analytics.

**Features:**

- User authentication (Admin/Moderator roles)
- Toilet location management
- Real-time analytics
- User management

**Tech Stack:** React, Vite, Material-UI/Tailwind CSS

### 2. Backend API (Node.js + Express)

RESTful API server handling all business logic and database operations.

**Features:**

- JWT authentication
- Email notifications
- Role-based access control
- MongoDB integration
- RESTful endpoints

**Tech Stack:** Node.js, Express.js, MongoDB, Mongoose, JWT

### 3. Mobile App (React Native + Expo)

Cross-platform mobile application for end users to locate and rate toilets.

**Features:**

- Google Maps integration
- Location-based toilet search
- User reviews and ratings
- Real-time navigation

**Tech Stack:** React Native, Expo, Google Maps API

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

## 🌐 Live Demo

- **Admin Panel:** [Deploy your admin panel here](https://nhai-toilets-webapp.onrender.com/)
- **Android API:**
- **Backend API:** [https://nhai-toilets.onrender.com](https://nhai-toilets.onrender.com)
