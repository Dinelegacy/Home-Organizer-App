// Imports
require("dotenv").config();

const express = require("express");
const cors = require("cors"); // Allows external origins/domains to access this API
const connectDB = require("./db"); // connect to database

const items = require("./routes/items"); // items routes file
const meals = require("./routes/meals"); // meals routes file
const users  = require("./routes/users"); //  users routes file

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

// database reference
let db;

// connect to database and start server
(async () => {
  try {
    db = await connectDB();

    // make db available to all routes
    app.use((req, res, next) => {
      req.db = db;
      next();
    });

    // routes
    app.use("/api/items", items);
    app.use("/api/meals", meals);
    app.use("/api/users", users);


    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("Failed to connect to DB:", err);
    process.exit(1);
  }
})();
