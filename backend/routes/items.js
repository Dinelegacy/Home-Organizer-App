const authRequired = require("../middleware/authRequired");
const express = require("express");
const { ObjectId } = require("mongodb");

const router = express.Router();

const itemsCollection = (req) => req.db.collection("items");

router.get("/", authRequired, async (req, res) => {
  try {
    const items = await itemsCollection(req).find({ userId: req.user.userId }).toArray();
    res.status(200).json(items);

  } catch (error) {
    console.error("DB ERROR (GET ITEMS):", error);
    res.status(500).json({ message: "Database error" });
  }
});

router.get("/:id", authRequired, async (req, res) => {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const item = await itemsCollection(req).findOne({
      _id: new ObjectId(id),
      userId: req.user.userId,
    });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json(item);
  } catch (error) {
    console.error("DB ERROR (GET ITEM):", error);
    res.status(500).json({ message: "Database error" });
  }
});

router.post("/", authRequired, async (req, res) => {
  try {

    if (!req.body || !req.body.text) {
      return res.status(400).json({ message: "Text is required" });
    }

    const cleanText = req.body.text.trim();
    const normalizedText = cleanText.toLowerCase();

    const existing = await itemsCollection(req).findOne({
      userId: req.user.userId,
      textNormalized: normalizedText
    });

    if (existing) {
      return res.status(409).json({ message: "Item already exists" });
    }

    const doc = {
      userId: req.user.userId,
      text: cleanText,
      textNormalized: normalizedText,
      createdAt: new Date()
    };

    const result = await itemsCollection(req).insertOne(doc);

    res.status(201).json({ _id: result.insertedId, ...doc });

  } catch (error) {
    console.error("DB ERROR (POST ITEMS):", error);
    res.status(500).json({ message: "Database error" });
  }
});

router.patch("/:id", authRequired, async (req, res) => {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    if (!req.body || !req.body.text) {
      return res.status(400).json({ message: "Text is required" });
    } const text = String(req.body.text).trim();
    const textNormalized = text.toLowerCase();

    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    const duplicate = await itemsCollection(req).findOne({
      userId: req.user.userId,
      textNormalized,
      _id: { $ne: new ObjectId(id) },
    });

    if (duplicate) {
      return res.status(409).json({ message: "Item already exists" });
    }
    const result = await itemsCollection(req).findOneAndUpdate(
      { _id: new ObjectId(id), userId: req.user.userId },
      { $set: { text, textNormalized, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    if (!result) {
      return res.status(404).json({ message: "Item not found" });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("DB ERROR (PATCH ITEMS):", error);
    res.status(500).json({ message: "Database error" });
  }
});

router.delete("/:id", authRequired, async (req, res) => {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const result = await itemsCollection(req).deleteOne({
      _id: new ObjectId(id), userId: req.user.userId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({ message: "Item deleted" });
  } catch (error) {
    console.error("DB ERROR (DELETE ITEMS):", error);
    res.status(500).json({ message: "Database error" });
  }
});

module.exports = router;
