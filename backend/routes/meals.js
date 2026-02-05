const authRequired = require("../middleware/authRequired");
const express = require("express");
const { ObjectId } = require("mongodb");

const router = express.Router();

const mealsCollection = (req) => req.db.collection("meals");

// GET all meals
router.get("/", authRequired, async (req, res) => {
  try {
    const meals = await mealsCollection(req).find({ userId: req.user.userId }).toArray();
    res.status(200).json(meals);
  } catch (error) {
    console.error("DB ERROR (GET MEALS):", error);
    res.status(500).json({ message: "Database error" });
  }
});

// GET single meal by id
router.get("/:id", authRequired, async (req, res) => {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const meal = await mealsCollection(req).findOne({
      _id: new ObjectId(id),
      userId: req.user.userId
    });

    if (!meal) {
      return res.status(404).json({ message: "Meal not found" });
    }

    res.status(200).json(meal);

  } catch (error) {
    console.error("DB ERROR (GET MEAL):", error);
    res.status(500).json({ message: "Database error" });
  }
});

// POST meal
router.post("/", authRequired, async (req, res) => {
  try {
    const dayValue = req.body?.day;
    const text = req.body?.text;


    if (!dayValue || !text) {
      return res.status(400).json({ message: "Day and text are required" });
    }

    const validDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

    const normalizedDay = dayValue.trim().toLowerCase();

    if (!validDays.includes(normalizedDay)) {
      return res.status(400).json({ message: "Invalid day. Use Monday-Sunday." })
    }

    const cleanDay = normalizedDay.charAt(0).toUpperCase() + normalizedDay.slice(1);

    const existing = await mealsCollection(req).findOne({
      userId: req.user.userId,
      day: cleanDay,
    });

    if (existing) {
      await mealsCollection(req).updateOne(
        { _id: existing._id },
        { $set: { text, updatedAt: new Date() } }
      );

      return res.status(200).json({
        _id: existing._id,
        userId: req.user.userId,
        day: cleanDay,
        text,
        updatedAt: new Date(),
      });
    }

    const doc = {
      userId: req.user.userId,
      day: cleanDay,
      text,
      createdAt: new Date()
    };
    const result = await mealsCollection(req).insertOne(doc);

    res.status(201).json({ _id: result.insertedId, ...doc });
  } catch (error) {
    console.error("DB ERROR (POST MEALS):", error);
    res.status(500).json({ message: "Database error" });
  }
});

// PATCH meal
router.patch("/:id", authRequired, async (req, res) => {
  try {
    const id = req.params.id;
    const dayValue = req.body?.day;
    const text = req.body?.text;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const set = {};

    if (dayValue) {
      const validDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
      const normalizedDay = dayValue.trim().toLowerCase();

      if (!validDays.includes(normalizedDay)) {
        return res.status(400).json({ message: "Invalid day. Use Monday-Sunday." })
      }
      const cleanDay = normalizedDay.charAt(0).toUpperCase() + normalizedDay.slice(1);
      set.day = cleanDay;
    }
    if (text) {
      set.text = text;
    }

    if (Object.keys(set).length === 0) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const result = await mealsCollection(req).findOneAndUpdate(
      { _id: new ObjectId(id), userId: req.user.userId },
      { $set: set },
      { returnDocument: "after" }
    );

    if (!result) {
      return res.status(404).json({ message: "Meal not found" });
    }
    return res.status(200).json(result);

  } catch (error) {
    console.error("DB ERROR (PATCH MEALS):", error);
    res.status(500).json({ message: "Database error" });
  }
});

// DELETE meal
router.delete("/:id", authRequired, async (req, res) => {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const result = await mealsCollection(req).deleteOne({
      _id: new ObjectId(id),
      userId: req.user.userId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Meal not found" });
    }

    res.status(200).json({ message: "Meal deleted" });
  } catch (error) {
    console.error("DB ERROR (DELETE MEALS):", error);
    res.status(500).json({ message: "Database error" });
  }
});

module.exports = router;
