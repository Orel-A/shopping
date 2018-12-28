const express = require("express");
const router = express.Router();
const sessions = require("../modules/sessions");
const shop = require("../modules/shop");

// fetch all products within a category
router.get("/category/:id/products", sessions.loginMiddleware, async (req, res, next) => {
  try {
    let products = await shop.fetchProductsByCategory(req.params.id);
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// initate a search by product name within all categories
router.get("/products/:name", sessions.loginMiddleware, async (req, res, next) => {
  try {
    let products = await shop.fetchProductsByName(req.params.name);
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// assign new cart item for a user
router.post("/cartItems", sessions.loginMiddleware, async (req, res, next) => {
  try {
    if (!req.body.product_id || !req.body.quantity) throw "bad params";

    // first we obtain the last cart id for this user
    let cart = await shop.fetchLastCart(req.user.user_id, false);
    // if it's not created or already closed we create anew
    if (!cart || cart.closed) cart = await shop.createCart(req.user.user_id);
    // now fetch current price for this product
    let product = await shop.fetchProductById(req.body.product_id);
    if (!product) throw "Product doesn't exist";

    // assign new cart item for this cart
    let cartItem = await shop.createCartItem(cart.shopping_cart_id, product, req.body.quantity);

    res.json(cartItem);
  } catch (err) {
    next(err);
  }
});

// delete cart item based on product id
router.delete("/cartItems/:productId", sessions.loginMiddleware, async (req, res, next) => {
  try {
    // first we obtain the last cart id for this user
    let cart = await shop.fetchLastCart(req.user.user_id, false);
    // if it's not created or already closed we error out
    if (!cart || cart.closed) throw "cart doesn't exist or already closed";
    // delete entry in database
    await shop.deleteCartItem(cart.shopping_cart_id, req.params.productId);

    res.json({});
  } catch (err) {
    next(err);
  }
});

// update cart item based on product id
router.put("/cartItems/:productId", sessions.loginMiddleware, async (req, res, next) => {
  try {
    // first we obtain the last cart id for this user
    let cart = await shop.fetchLastCart(req.user.user_id, false);
    // if it's not created or already closed we error out
    if (!cart || cart.closed) throw "cart doesn't exist or already closed";
    // now fetch current price for this product
    let product = await shop.fetchProductById(req.params.productId);
    if (!product) throw "Product doesn't exist";
    // update entry in database
    let item = await shop.updateCartItem(cart.shopping_cart_id, product, req.body.quantity);

    res.json(item);
  } catch (err) {
    next(err);
  }
});

/* // create a new cart for this user
router.post("/cart", sessions.loginMiddleware, async (req, res, next) => {
  try {
    // get the last user cart
    let cart = await shop.fetchLastCart(req.user.user_id);
    // if doesn't exist, create it
    if (!cart || cart.closed) cart = await shop.createCart(req.user.user_id);

    res.json(cart);
  } catch (err) {
    next(err);
  }
}); */

// delete last cart for this user and only if not closed already
router.delete("/cart", sessions.loginMiddleware, async (req, res, next) => {
  try {
    await shop.deleteCart(req.user.user_id);

    res.json({});
  } catch (err) {
    next(err);
  }
});

// make a new order
router.post("/order", sessions.loginMiddleware, async (req, res, next) => {
  try {
    // first we obtain the last cart id for this user
    let cart = await shop.fetchLastCart(req.user.user_id);
    // if it's not created or already closed we error out
    if (!cart || cart.closed) throw "cart doesn't exist or already closed";

    await shop.makeOrder(
      req.user.user_id,
      cart,
      req.body.city,
      req.body.street,
      req.body.delivery_date,
      req.body.creditCard
    );

    res.json(cart);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
