const mysql = require("mysql2/promise");

const connectionObj = {
  host: "localhost",
  user: "root",
  password: ""
};

// Create database skeleton if it doesn't exist
(async () => {
  let con = await mysql.createConnection(connectionObj);

  con.query("CREATE DATABASE IF NOT EXISTS shopping_site CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
  con.query("USE shopping_site");

  //con.query("DROP TABLE users");
  con.query(`CREATE TABLE IF NOT EXISTS users (
    user_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(45) NOT NULL,
    last_name VARCHAR(45) NOT NULL,
    id VARCHAR(45) NOT NULL,
    email VARCHAR(45) NOT NULL,
    city VARCHAR(45) NOT NULL,
    street VARCHAR(45) NOT NULL,
    pass_hash CHAR(60) NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (user_id),
    UNIQUE KEY (id),
    UNIQUE KEY (email)
    )`);

  //con.query("DROP TABLE sessions");
  con.query(`CREATE TABLE IF NOT EXISTS sessions (
    session_id CHAR(64) NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    expires DATETIME NOT NULL,
    PRIMARY KEY (session_id),
    UNIQUE KEY (user_id),
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    )`);

  //con.query("DROP TABLE categories");
  con.query(`CREATE TABLE IF NOT EXISTS categories (
    category_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    category_name VARCHAR(45) NOT NULL,
    PRIMARY KEY (category_id),
    UNIQUE KEY (category_name)
    )`);

  //con.query("DROP TABLE products");
  con.query(`CREATE TABLE IF NOT EXISTS products (
    product_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    category_id INT UNSIGNED NOT NULL,
    product_name VARCHAR(45) NOT NULL,
    price FLOAT UNSIGNED NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    PRIMARY KEY (product_id),
    FOREIGN KEY (category_id) REFERENCES categories (category_id)
    )`);

  //con.query("DROP TABLE shopping_carts");
  con.query(`CREATE TABLE IF NOT EXISTS shopping_carts (
    shopping_cart_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (shopping_cart_id),
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    )`);

  //con.query("DROP TABLE cart_items");
  con.query(`CREATE TABLE IF NOT EXISTS cart_items (
    shopping_cart_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    quantity INT UNSIGNED NOT NULL,
    total_cost FLOAT UNSIGNED NOT NULL,
    PRIMARY KEY (shopping_cart_id, product_id),
    FOREIGN KEY (shopping_cart_id) REFERENCES shopping_carts (shopping_cart_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (product_id)
    )`);

  //con.query("DROP TABLE orders");
  con.query(`CREATE TABLE IF NOT EXISTS orders (
    order_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    shopping_cart_id INT UNSIGNED NOT NULL,
    final_cost FLOAT UNSIGNED NOT NULL,
    city VARCHAR(45) NOT NULL,
    street VARCHAR(45) NOT NULL,
    delivery_date DATETIME NOT NULL,
    order_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    card_last_digits CHAR(4) NOT NULL,
    PRIMARY KEY (order_id),
    FOREIGN KEY (user_id) REFERENCES users (user_id),
    FOREIGN KEY (shopping_cart_id) REFERENCES shopping_carts (shopping_cart_id)
    )`);

  let [resUsers] = await con.query("SELECT COUNT(*) AS total FROM users");

  // default admin, password is 123456
  if (!resUsers[0].total)
    con.query(`INSERT INTO users
  (first_name, last_name, id, email, city, street, pass_hash, is_admin) VALUES
  ('Orel', 'Amram', '123456789', 'wrlmrm@gmail.com', 'Petah Tiqwa', 'Yaakov Achva', '$2b$11$AFz8bf3xX99eej1KEaDwyueC8gVXmfz87uY3r2hNGIOAJdrWd/Why', 1)`);

  let [resCategories] = await con.query("SELECT COUNT(*) AS total FROM categories");

  if (!resCategories[0].total)
    con.query(`INSERT INTO categories (category_name) VALUES ('Meat'), ('Milk')`);

  con.end();
})();

const pool = mysql.createPool({
  ...connectionObj,
  database: "shopping_site",
  connectionLimit: 10
});

module.exports = pool;
