# 🏠 Home Organizer App – Full Stack Project (Backend API + Frontend)

This web application helps users organize home life by:

- Tracking missing grocery items (shopping list)
- Planning weekly meals by selecting a day and adding meal names
- Keeping user data private through authentication

The backend is a RESTful API connected to MongoDB and secured with JWT.  
The frontend provides a simple interface for managing grocery items and meals.

---

## 📁 Project Structure

```
Home-organizer-app/

backend/
├── middleware/
│   └── authRequired.js
├── node_modules/
├── routes/
│   ├── items.js
│   ├── meals.js
│   └── users.js
├── .env
├── .env.example
├── db.js
├── package-lock.json
├── package.json
├── server.js
└── test.http

frontend/
├── .vscode/
├── assets/
├── index.css
├── index.html
└── index.js

.gitignore
README.md
```

---

## 🚀 Clone & Run Locally

```bash
git clone https://github.com/Dinelegacy/Home-Organizer-App.git
cd Home-organizer-app/backend
npm install
```

---

## 🔐 Environment Setup

Create file:

```
backend/.env
```

Add:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/homeOrganizer
JWT_SECRET=create_your_jwt_secret_here
```

---

## 🗄 Start MongoDB

```bash
mongod
```

---

## ▶️ Start Server

```bash
npm start
```

or

```bash
nodemon server.js
```

API runs at:

```
http://localhost:3000
```

---

## 🔑 Authentication Flow

### 1️⃣ Register user (email must be unique)

```
POST /api/users/register
```

Request body example:

```json
{
  "email": "user@example.com",
  "password": "mypassword"
}
```

---

### 2️⃣ Login to receive JWT token

```
POST /api/users/login
```

Request body:

```json
{
  "email": "user@example.com",
  "password": "mypassword"
}
```

Response returns token.

---

### 3️⃣ Use token for protected routes

Add header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📡 API Endpoints

### Auth

```
POST /api/users/register
POST /api/users/login
```

---

### Items (grocery list – JWT required)

```
GET    /api/items
POST   /api/items
PATCH  /api/items/:id
DELETE /api/items/:id
```

POST example:

```json
{
  "text": "Milk"
}
```

---

### Meals (weekly meal planning – JWT required)

```
GET    /api/meals
POST   /api/meals
PATCH  /api/meals/:id
DELETE /api/meals/:id
```

POST example:

```json
{
  "day": "Monday",
  "text": "Chicken and rice"
}
```

---

## 📊 Status Codes Used

- 200 OK  
- 201 Created  
- 400 Bad Request  
- 401 Unauthorized  
- 404 Not Found  
- 500 Server Error  

---

## ✨ Features

- MongoDB database
- RESTful API
- Multiple HTTP methods (GET, POST, PATCH, DELETE)
- Multiple HTTP status codes
- JWT authentication
- bcrypt password hashing
- Protected routes
- Scalable backend design
- Frontend included