const express = require("express");
const router = express.Router();
const sessions = require("../modules/sessions");
const shop = require("../modules/shop");

router.post("/categories", sessions.loginMiddleware, async (req, res, next) => {
  try {
    if (!req.user.is_admin) throw "not an admin";
    let category = await shop.createCategory(req.body.category);
    res.json(category);
  } catch (err) {
    next(err);
  }
});

router.post("/products", sessions.loginMiddleware, async (req, res, next) => {
  try {
    if (!req.user.is_admin) throw "not an admin";
    let product = await shop.createProduct(req.body);
    res.json(product);
  } catch (err) {
    next(err);
  }
});

router.put("/products", sessions.loginMiddleware, async (req, res, next) => {
  try {
    if (!req.user.is_admin) throw "not an admin";
    let product = await shop.updateProduct(req.body);
    res.json(product);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
