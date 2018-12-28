const express = require("express");
const router = express.Router();
const sessions = require("../modules/sessions");
const users = require("../modules/users");
const shop = require("../modules/shop");

router.get("/fetchAppData", async (req, res, next) => {
  try {
    let stats = await shop.fetchStats();
    let categories = await shop.fetchCategories();
    let user = await sessions.fetchLoggedUser(req.cookies);
    let cart = null;

    if (user) {
      cart = await shop.fetchLastCart(user.user_id);
      user = user.clientOutput();
    }

    res.json({ stats, user, cart, categories });
  } catch (err) {
    next(err);
  }
});

router.get("/logOut", async (req, res, next) => {
  try {
    let user = await sessions.fetchLoggedUser(req.cookies);
    if (user) await sessions.destroySession(user.user_id, res);
    res.send("");
  } catch (err) {
    next(err);
  }
});

router.post("/register", async (req, res, next) => {
  try {
    let user = await users.register(req.body);
    await sessions.createLoginSession(user.user_id, res);
    res.json(user.clientOutput());
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    let user;
    try {
      user = await users.login(req.body);
    } catch (err) {
      // don't give info to the client what failed
      throw "credentials don't match";
    }
    await sessions.createLoginSession(user.user_id, res);
    let cart = await shop.fetchLastCart(user.user_id);
    res.json({ user: user.clientOutput(), cart });
  } catch (err) {
    next(err);
  }
});

router.post("/checkDuplicates", async (req, res, next) => {
  try {
    res.json(await users.checkDuplicates(req.body));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
