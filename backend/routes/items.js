const authRequired = require("../middleware/authRequired");
const express = require("express");

const router = express.Router();

const { getObjectIdOr400, getItemTextOr400 } = require("../utils/routeHelpers");

const itemsCollection = (req) => req.db.collection("items");

router.get("/", authRequired, async (req, res) => {
  try {
    const items = await itemsCollection(req)
      .find({ userId: req.user.userId })
      .toArray();
    res.status(200).json(items);
  } catch (error) {
    console.error("DB ERROR (GET ITEMS):", error);
    res.status(500).json({ message: "Database error" });
  }
});

router.get("/:id", authRequired, async (req, res) => {
  try {
    const _id = getObjectIdOr400(req, res);
    if (!_id) return;

    const item = await itemsCollection(req).findOne({
      _id,
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
    const payload = getItemTextOr400(req, res);
    if (!payload) return;

    const { text, textNormalized } = payload;

    const existing = await itemsCollection(req).findOne({
      userId: req.user.userId,
      textNormalized,
    });

    if (existing) {
      return res.status(409).json({ message: "Item already exists" });
    }

    const doc = {
      userId: req.user.userId,
      text,
      textNormalized,
      createdAt: new Date(),
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
    const _id = getObjectIdOr400(req, res);
    if (!_id) return;

    const payload = getItemTextOr400(req, res);
    if (!payload) return;

    const { text, textNormalized } = payload;

    const duplicate = await itemsCollection(req).findOne({
      userId: req.user.userId,
      textNormalized,
      _id: { $ne: _id },
    });

    if (duplicate) {
      return res.status(409).json({ message: "Item already exists" });
    }

    const result = await itemsCollection(req).findOneAndUpdate(
      { _id, userId: req.user.userId },
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
    const _id = getObjectIdOr400(req, res);
    if (!_id) return;

    const result = await itemsCollection(req).deleteOne({
      _id,
      userId: req.user.userId,
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