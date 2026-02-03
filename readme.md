Home Organizer App – Full Stack Project (Backend API + Frontend)

This web application helps users organize home life by:

• Tracking missing grocery items (shopping list)
• Planning weekly meals by selecting a day and adding meal names
• Keeping user data private through authentication

The backend is a RESTful API connected to MongoDB and secured with JWT.
The frontend provides a simple interface for managing grocery items and meals.


Clone and run locally:

git clone https://github.com/Dinelegacy/Home-Organizer-App.git
cd Home-organizer-app/backend
npm install


Create backend/.env file with:

PORT=3000
MONGODB_URI=mongodb://localhost:27017/homeOrganizer
JWT_SECRET=create_your_jwt_secret_here


Start MongoDB:

mongod


Start the server:

npm start
or
nodemon server.js


API runs on:
http://localhost:3000


Endpoints

Auth:
POST /api/users/register
POST /api/users/login


Items (grocery list – JWT required):
GET /api/items
POST /api/items
PATCH /api/items/:id
DELETE /api/items/:id


Meals (weekly meal planning – JWT required):
GET /api/meals
POST /api/meals
PATCH /api/meals/:id
DELETE /api/meals/:id


Status codes used:
200 OK
201 Created
400 Bad Request
401 Unauthorized
404 Not Found
500 Server Error


Features:
MongoDB database
RESTful API
Multiple HTTP methods (GET, POST, PATCH, DELETE)
Multiple HTTP status codes
JWT authentication
bcrypt password hashing
Protected routes
Structured and scalable backend design
Frontend included