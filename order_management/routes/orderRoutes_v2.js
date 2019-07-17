const express = require("express");
const router = express.Router();
const orderController = require("../app/api/controllers/orderController");

router.get("/", orderController.getAllV2);
router.get("/:id", orderController.getByIdV2);
router.delete("/:id", orderController.removeById);
module.exports = router;
