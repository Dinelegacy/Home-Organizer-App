// Imports
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./db");

const items = require("./routes/items");
const meals = require("./routes/meals");
const users = require("./routes/users");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let db;

(async () => {
  try {
    db = await connectDB();

    app.use((req, res, next) => {
      req.db = db;
      next();
    });

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
