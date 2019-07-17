const { stockModel } = require("../models/stock");
const { publishMessage } = require("../../publisher");

module.exports = {
  getById: function(req, res, next) {
    console.log("getting stock with id", req.params.id);
    stockModel.findById(req.params.id, function(err, stockInfo) {
      if (err) {
        next(err);
      } else {
        if (!!stockInfo) {
          res.json({
            status: "success",
            message: "stock found!!!",
            data: { stock: stockInfo }
          });
        } else {
          console.log("Stock with id", req.params.id, "not found");
          res.status(404).json({ message: "Not found" });
        }
      }
    });
  },

  getAll: function(req, res, next) {
    console.log("getting all stocks");
    let stocksList = [];

    stockModel.find({}, function(err, stocks) {
      if (err) {
        next(err);
      } else {
        for (let stock of stocks) {
          stocksList.push({
            id: stock._id,
            code: stock.ingredient_code,
            quantity: stock.quantity
          });
        }
        res.json({
          status: "success",
          message: "Stock list found!!!",
          data: { stocks: stocksList }
        });
      }
    });
  },

  updateById: function(req, res, next) {
    console.log("update stock with id", req.body.id);
    stockModel.findByIdAndUpdate(
      req.params.id,
      {
        ingredient_code: req.body.ingredient_code,
        quantity: req.body.quantity
      },
      function(err, stockInfo) {
        if (err) next(err);
        else {
          if (!!stockInfo) {
            res.json({
              status: "success",
              message: "Stock updated successfully!!!",
              data: null
            });
          } else {
            console.log("Stock with id", req.params.id, "not found");
            res.status(404).json({ message: "Not found" });
          }
        }
      }
    );
  },

  deleteById: function(req, res, next) {
    console.log("deleting stock with id", req.params.id);
    stockModel.findByIdAndRemove(req.params.id, function(err, stockInfo) {
      if (err) next(err);
      else {
        res.json({
          status: "success",
          message: "Stock deleted successfully!!!",
          data: stockInfo
        });
      }
    });
  },

  useIngredients: function(order, dish) {
    stockModel.find({}, function(err, results) {
      let canCook = true;
      console.log("ingredients", dish.ingredients);
      dish.ingredients.filter(ingredient => {
        const result = results.find(
          element => element.ingredient_code === ingredient.code
        );
        if (!result || (!!result && result.quantity < ingredient.quantity)) {
          canCook = false;
          return;
        }
      });
      if (canCook) {
        dish.ingredients.filter(ingredient => {
          const result = results.find(
            element => element.ingredient_code === ingredient.code
          );
          if (
            !(!result || (!!result && result.quantity < ingredient.quantity))
          ) {
            stockModel.findByIdAndUpdate(
              result._id,
              {
                ingredient_code: result.ingredient_code,
                quantity: Number(result.quantity) - Number(ingredient.quantity)
              },
              function(err, stockInfo) {
                if (err) {
                  console.log("could not update ingredients");
                } else {
                  if (!!stockInfo) {
                    console.log("Stock updated successfully!!!");
                    publishFulfilledOrder(order, dish);
                  } else {
                    console.log("Stock with id", result._id, "not found");
                  }
                }
              }
            );
          }
        });
      } else {
        console.log("no ingredients");
        publishRejectedOrder(order, dish);
      }
    });
  },

  create: function(req, res, next) {
    console.log(
      "creating stock with the params: ",
      req.body.ingredient_code,
      req.body.quantity
    );

    stockModel
      .find({
        ingredient_code: req.body.ingredient_code
      })
      .then(results => {
        if (results.length === 0) {
          stockModel.create(
            {
              ingredient_code: req.body.ingredient_code,
              quantity: req.body.quantity
            },
            function(err, result) {
              if (err) next(err);
              else
                res.json({
                  status: "success",
                  message: "Stock added successfully!!!",
                  data: result
                });
            }
          );
        } else {
          console.log("result 0 ", results[0]);
          stockModel.findByIdAndUpdate(
            results[0]._id,
            {
              ingredient_code: results[0].ingredient_code,
              quantity: Number(results[0].quantity) + Number(req.body.quantity)
            },
            function(err, stockInfo) {
              if (err) next(err);
              else {
                if (!!stockInfo) {
                  res.json({
                    status: "success",
                    message: "Stock updated successfully!!!",
                    data: null
                  });
                } else {
                  console.log("Stock with id", results[0]._id, "not found");
                  res.status(404).json({ message: "Not found" });
                }
              }
            }
          );
        }
      });
  }
};

const publishRejectedOrder = (order, dish) => {
  publishMessage(
    "order.rejected",
    JSON.stringify({ event: "order_rejected", object: { order, dish } })
  );
};
const publishFulfilledOrder = (order, dish) => {
  publishMessage(
    "order.fulfilled",
    JSON.stringify({ event: "order_fulfilled", object: { order, dish } })
  );
};
