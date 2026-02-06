const authRequired = require("../middleware/authRequired");
const express = require("express");

const router = express.Router();

const { getObjectIdOr400, getCleanDayOr400 } = require("../utils/routeHelpers");

const mealsCollection = (req) => req.db.collection("meals");

router.get("/", authRequired, async (req, res) => {
  try {
    const meals = await mealsCollection(req)
      .find({ userId: req.user.userId })
      .toArray();
    res.status(200).json(meals);
  } catch (error) {
    console.error("DB ERROR (GET MEALS):", error);
    res.status(500).json({ message: "Database error" });
  }
});

router.get("/:id", authRequired, async (req, res) => {
  try {
    const _id = getObjectIdOr400(req, res);
    if (!_id) return;

    const meal = await mealsCollection(req).findOne({
      _id,
      userId: req.user.userId,
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

router.post("/", authRequired, async (req, res) => {
  try {
    const cleanDay = getCleanDayOr400(req, res);
    if (!cleanDay) return;

    const text = req.body?.text;

    if (!text) {
      return res.status(400).json({ message: "Day and text are required" });
    }

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
      createdAt: new Date(),
    };

    const result = await mealsCollection(req).insertOne(doc);
    res.status(201).json({ _id: result.insertedId, ...doc });
  } catch (error) {
    console.error("DB ERROR (POST MEALS):", error);
    res.status(500).json({ message: "Database error" });
  }
});

router.patch("/:id", authRequired, async (req, res) => {
  try {
    const _id = getObjectIdOr400(req, res);
    if (!_id) return;

    const dayValue = req.body?.day;
    const text = req.body?.text;

    const set = {};

    if (dayValue) {
      const cleanDay = getCleanDayOr400(req, res);
      if (!cleanDay) return;

      // ✅ Prevent duplicate day for the same user (if another meal already uses this day)
      const existingDay = await mealsCollection(req).findOne({
        userId: req.user.userId,
        day: cleanDay,
        _id: { $ne: _id },
      });

      if (existingDay) {
        return res.status(409).json({ message: "Meal already exists for this day" });
      }

      set.day = cleanDay;
    }

    if (text) {
      set.text = text;
    }

    if (Object.keys(set).length === 0) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const result = await mealsCollection(req).findOneAndUpdate(
      { _id, userId: req.user.userId },
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
router.delete("/:id", authRequired, async (req, res) => {
  try {
    const _id = getObjectIdOr400(req, res);
    if (!_id) return;

    const result = await mealsCollection(req).deleteOne({
      _id,
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