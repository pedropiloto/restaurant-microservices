const express = require("express");
const router = express.Router();
const customerController = require("../app/api/controllers/customerController");

router.get("/", customerController.getAll);
router.post("/", customerController.create);
router.get("/:id", customerController.getById);
router.delete("/:id", customerController.deleteById);

module.exports = router;
