const DB = require("./database");
const validator = require("validator");

module.exports = {
  // create a new category, this is for admin only
  async createCategory(name) {
    try {
      let obj = { category_name: name };
      let [result] = await DB.query("INSERT INTO categories SET ?", obj);
      obj.category_id = result.insertId;

      return obj;
    } catch (err) {
      if (err instanceof Error && err.code === "ER_DUP_ENTRY") {
        if (err.message.endsWith("'category_name'")) throw "Duplicate category";
      }

      throw err;
    }
  },
  // create a new product, this is for admin only
  async createProduct(postData) {
    let obj = {
      category_id: postData.category_id,
      product_name: postData.product_name,
      price: postData.price,
      image_url: postData.image_url
    };

    let [result] = await DB.query("INSERT INTO products SET ?", obj);
    obj.product_id = result.insertId;

    return obj;
  },
  // update a product, this is for admin only
  async updateProduct(postData) {
    let obj = {
      product_name: postData.product_name,
      price: postData.price,
      image_url: postData.image_url
    };

    await DB.query("UPDATE products SET ? WHERE product_id=?", [obj, postData.product_id]);

    return postData;
  },
  // fetch products within a category
  async fetchProductsByCategory(id) {
    let [result] = await DB.query("SELECT * FROM products WHERE category_id=?", id);
    return result;
  },
  // fetch products by name
  async fetchProductsByName(search) {
    let [result] = await DB.query("SELECT * FROM products WHERE product_name LIKE ?", `%${search}%`);
    return result;
  },
  // fetch product by id
  async fetchProductById(id) {
    let [result] = await DB.query("SELECT * FROM products WHERE product_id=?", id);
    return result[0];
  },
  // fetch last user cart, and optionally all its items
  async fetchLastCart(user_id, withItems = true) {
    let [cart] = await DB.query(
      "SELECT * FROM shopping_carts WHERE user_id=? GROUP BY shopping_cart_id DESC LIMIT 1",
      user_id
    );
    cart = cart[0];
    if (cart) cart.items = [];

    if (withItems && cart && !cart.closed) {
      let [result] = await DB.query(
        "SELECT i.*,p.product_name,p.image_url FROM cart_items i JOIN products p ON i.product_id=p.product_id WHERE shopping_cart_id=?",
        cart.shopping_cart_id
      );
      cart.items = result;
      cart.final_cost = 0;
      for (const item of cart.items) cart.final_cost += item.total_cost;
    }

    return cart;
  },
  // create cart
  async createCart(user_id) {
    let [result] = await DB.query("INSERT INTO shopping_carts SET user_id=?", user_id);

    return { shopping_cart_id: result.insertId, created_date: new Date(), closed: 0, items: [], final_cost: 0 };
  },
  // fetch stats
  async fetchStats() {
    let [resProducts] = await DB.query("SELECT COUNT(*) AS total FROM products");
    let [resOrders] = await DB.query("SELECT COUNT(*) AS total FROM orders");

    return {
      totalProducts: resProducts[0].total,
      totalOrders: resOrders[0].total
    };
  },
  // fetch categories
  async fetchCategories() {
    let [result] = await DB.query("SELECT * FROM categories");
    return result;
  },
  // add cart item for a user based on cart id
  async createCartItem(shopping_cart_id, product, quantity) {
    let obj = {
      shopping_cart_id,
      product_id: product.product_id,
      quantity,
      total_cost: product.price * quantity
    };

    await DB.query("INSERT INTO cart_items SET ?", obj);
    obj.product_name = product.product_name;
    obj.image_url = product.image_url;

    return obj;
  },
  // delete cart item based on cart id and product id
  async deleteCartItem(shopping_cart_id, product_id) {
    return DB.query("DELETE FROM cart_items WHERE shopping_cart_id=? AND product_id=?", [shopping_cart_id, product_id]);
  },
  // delete cart
  async deleteCart(user_id) {
    return DB.query("DELETE FROM shopping_carts WHERE closed=0 AND user_id=?", user_id);
  },
  // update cart item based on cart id and product id
  async updateCartItem(shopping_cart_id, product, quantity) {
    let obj = {
      quantity,
      total_cost: product.price * quantity
    };

    let [result] = await DB.query("UPDATE cart_items SET ? WHERE shopping_cart_id=? AND product_id=?", [
      obj,
      shopping_cart_id,
      product.product_id
    ]);

    if (!result.affectedRows) throw "item doesn't exist";

    // fill missing data in obj
    obj.product_name = product.product_name;
    obj.product_id = product.product_id;
    obj.shopping_cart_id = shopping_cart_id;
    obj.image_url = product.image_url;

    return obj;
  },
  async makeOrder(user_id, cart, city, street, delivery_date, creditCard) {
    if (!validator.isCreditCard(creditCard)) throw "credit card is invalid";
    if (!delivery_date || new Date(delivery_date).toString() === "Invalid Date") throw "invalid date";

    // first check if this date is busy
    let [resOrders] = await DB.query("SELECT COUNT(*) AS total FROM orders WHERE delivery_date=?", delivery_date);
    if (resOrders[0].total >= 3) throw "busy date";

    let obj = {
      user_id,
      city,
      street,
      delivery_date,
      shopping_cart_id: cart.shopping_cart_id,
      final_cost: cart.final_cost,
      card_last_digits: creditCard.slice(-4)
    };

    await DB.query("INSERT INTO orders SET ?", obj);
    await DB.query("UPDATE shopping_carts SET closed=TRUE WHERE shopping_cart_id=?", cart.shopping_cart_id);
    cart.closed = true;
  }
};
