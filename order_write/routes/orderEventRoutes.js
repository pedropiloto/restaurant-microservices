const express = require("express");
const router = express.Router();
const orderEventController = require("../app/api/controllers/orderEventController");

router.get("/", orderEventController.getAll);
router.post("/", orderEventController.create);
router.post(
  "/wso2/:customer_id/:dish_id",
  orderEventController.createWSO2Order
);

module.exports = router;
