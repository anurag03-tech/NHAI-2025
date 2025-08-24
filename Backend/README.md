# NHAI Backend

Node.js Express backend project with MongoDB.

## Features

- Express server setup
- MongoDB connection
- Basic folder structure for routes, middlewares, controllers, models
- Ready for API development

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start development server:
   ```bash
   npm run dev
   ```
3. Production start:
   ```bash
   npm start
   ```

## Folder Structure

- `src/index.js`: Entry point
- `src/routes/`: API route files
- `src/middlewares/`: Express middlewares
- `src/controllers/`: Route controllers
- `src/models/`: Mongoose models

## MongoDB

- Default connection string: `mongodb://localhost:27017/nhai`
- Change in `src/index.js` as needed
