# Home Organizer API – Backend with Frontend Integration

This project is a REST API that manages grocery items and weekly meals, with user authentication and structured data handling.

The backend is designed to be secure, consistent, and easy to maintain. The API enforces authentication, validates input, prevents duplicate records, and manages structured resources for users, items, and meals.

--- 

## Project Overview

The API is built around three main resources:

- Users  
- Items (grocery list)  
- Meals (weekly meal planning)  

Each user has isolated data and must be authenticated to access protected routes.

---

## Authentication and Security

Users register with an email and password.

Passwords are never stored in plain text. They are hashed using bcrypt before being saved in MongoDB.

When logging in, a JSON Web Token (JWT) is generated and returned to the client.

All item and meal routes are protected and require a valid token sent in the request header:

Authorization: Bearer YOUR_JWT_TOKEN

This ensures:

- Secure access to the API  
- Private user-specific data  


---

### Input Normalization

User input is processed before storage:

- Whitespace is trimmed  
- Case is normalized for comparisons  

This prevents inconsistent records such as duplicates caused by casing differences.

---

### Grocery Items – Duplicate Prevention

Items are normalized using a lowercase comparison field.

Examples treated as the same item:

Milk  
milk  
MILK  

Only one instance can exist per user.

Attempting to add a duplicate returns:

409 Conflict

This keeps grocery lists realistic and avoids redundant data.

---

### Meals – One Meal Per Day

Each user can only have one meal per weekday.

When posting a meal:

- If the day does not exist → a new meal is created  
- If the day already exists → the existing meal is updated  

This reflects real meal planning instead of behaving like a simple list.

Patch requests also prevent changing a meal into a day that already belongs to another meal.

---

## Backend Architecture

The backend is organized with clear separation of responsibilities.

### Server Layer
- require("dotenv").config();
- app.use(cors());
- app.use(express.json());
- db = await connectDB();
- req.db = db;
- app.use("/api/items", items);
- app.use("/api/meals", meals);
- app.use("/api/users", users);

---

### Database Layer

db.js creates the MongoDB connection and makes it available to all routes through req.db
---

### Route Layer

Each resource has its own dedicated file:

- users.js – registration and login  
- items.js – grocery item logic  
- meals.js – meal planning logic  

Each resource is separated into its own route file, making the API easier to maintain and update without affecting other parts of the system

---

### Middleware

authRequired.js validates JWT tokens and protects all private routes.

---

### Utility Functions

Repeated validation and normalization logic is extracted into reusable helper functions inside a utils folder.

This reduces code repetition and improves maintainability and scalability.

---

## API Endpoints

Authentication

POST /api/users/register  
POST /api/users/login  


Items (JWT required)

GET /api/items  
GET /api/items/:id  
POST /api/items  
PATCH /api/items/:id  
DELETE /api/items/:id  


Meals (JWT required)

GET /api/meals  
GET /api/meals/:id  
POST /api/meals  
PATCH /api/meals/:id  
DELETE /api/meals/:id  

POST example:

{
  "text": "Milk"
}

Duplicate items return 409 Conflict.

---

### Meals (JWT required)

GET /api/meals  
GET /api/meals/:id  
POST /api/meals  
PATCH /api/meals/:id  
DELETE /api/meals/:id  

POST example:

{
  "day": "Monday",
  "text": "Chicken and rice"
}

Invalid days return 400 Bad Request.  
Duplicate weekdays update instead of creating new records.

---

## HTTP Status Codes Used

200 OK  
201 Created  
400 Bad Request  
401 Unauthorized  
404 Not Found  
409 Conflict  
500 Server Error  

All responses follow REST conventions for smooth frontend integration.

---

## Running the Project Locally

Clone the repository:

git clone https://github.com/Dinelegacy/Home-Organizer-App.git  
cd Home-organizer-app/backend  
npm install  

Create backend/.env:

PORT=3000  
MONGODB_URI=mongodb://localhost:27017/homeOrganizer  
JWT_SECRET=create_your_jwt_secret_here  

Start MongoDB:

mongod  

Start the server:

npm start  

or for development:

npm run dev  

The API runs at:

http://localhost:3000

---

## Technologies Used

Node.js  
Express.js  
MongoDB  
JWT authentication  
bcrypt password hashing  