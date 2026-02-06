const { ObjectId } = require("mongodb");

function getObjectIdOr400(req, res) {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
        res.status(400).json({ message: "Invalid id" });
        return null;
    }
    return new ObjectId(id);
}

function getItemTextOr400(req, res) {
    if (!req.body || !req.body.text) {
        res.status(400).json({ message: "Text is required" });
        return null;
    }

    const cleanText = String(req.body.text).trim();
    if (!cleanText) {
        res.status(400).json({ message: "Text is required" });
        return null;
    }

    return {
        text: cleanText,
        textNormalized: cleanText.toLowerCase(),
    };
}

const validDays = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
];

function getCleanDayOr400(req, res) {
    const dayValue = req.body?.day;

    if (!dayValue) {
        res.status(400).json({ message: "Day and text are required" });
        return null;
    }

    const normalizedDay = String(dayValue).trim().toLowerCase();

    if (!validDays.includes(normalizedDay)) {
        res.status(400).json({ message: "Invalid day. Use Monday-Sunday." });
        return null;
    }

    return normalizedDay.charAt(0).toUpperCase() + normalizedDay.slice(1);
}

module.exports = {
    getObjectIdOr400,
    getItemTextOr400,
    getCleanDayOr400,
};