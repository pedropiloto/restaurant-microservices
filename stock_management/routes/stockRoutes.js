const express = require("express");
const router = express.Router();
const stockController = require("../app/api/controllers/stockController");

router.get("/", stockController.getAll);
router.post("/", stockController.create);
router.get("/:id", stockController.getById);
router.put("/:id", stockController.updateById);
router.delete("/:id", stockController.deleteById);

module.exports = router;
