const express = require("express");
const router = express.Router();
const dishController = require("../app/api/controllers/dishController");

router.get("/", dishController.getAll);
router.get("/wso2", dishController.getAllWSO2);
router.post("/", dishController.create);
router.get("/:id", dishController.getById);
router.put("/:id", dishController.updateById);
router.delete("/:id", dishController.deleteById);

module.exports = router;
