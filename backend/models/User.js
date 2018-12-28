const bcrypt = require("bcrypt");
const saltRounds = 11;
const validator = require("validator");
const DB = require("../modules/database");

class User {
  constructor(obj = {}, fromInput = false) {
    this.first_name = obj.first_name;
    this.last_name = obj.last_name;
    this.id = obj.id;
    this.email = obj.email;
    this.city = obj.city;
    this.street = obj.street;
    if (fromInput) {
      this.is_admin = 0;
    } else {
      this.user_id = obj.user_id;
      this.pass_hash = obj.pass_hash;
      this.is_admin = obj.is_admin;
    }
  }

  async setPassword(plainPass) {
    // Generate password hash
    this.pass_hash = await bcrypt.hash(plainPass, saltRounds);
  }

  matchPassword(password) {
    return bcrypt.compare(password, this.pass_hash);
  }

  async insertToDB() {
    try {
      let insertObj = Object.assign({}, this);
      for (const key in insertObj) if (insertObj[key] === undefined) delete insertObj[key];

      let [result] = await DB.query("INSERT INTO users SET ?", insertObj);
      this.user_id = result.insertId;
    } catch (err) {
      if (err instanceof Error && err.code === "ER_DUP_ENTRY") {
        if (err.message.endsWith("'id'")) throw "Duplicate id";
        if (err.message.endsWith("'email'")) throw "Duplicate email";
      }

      throw err;
    }
  }

  sanitize() {
    var inputProperties = ["first_name", "last_name", "id", "email", "city", "street"];

    if (!inputProperties.every(prop => prop in this)) throw "Missing data";

    for (const key of inputProperties) {
      this[key] = validator.stripLow(this[key]).trim();
      if (!this[key].length) throw "Blank fields";
    }

    if (!/^\d+$/.test(this.id)) throw "Id must have digits only";

    if (!validator.isEmail(this.email)) throw "Invalid email";
    
    this.email = validator.normalizeEmail(this.email);
  }

  clientOutput() {
    // Omit sensitive info
    let cleanObj = Object.assign({}, this);
    delete cleanObj.pass_hash;
    // Escape bad characters
    for (const key in cleanObj) if (typeof cleanObj[key] === "string") cleanObj[key] = validator.escape(cleanObj[key]);

    return cleanObj;
  }

  static async fetchByEmail(email) {
    let [result] = await DB.query("SELECT * FROM users WHERE email=? LIMIT 1", email);

    if (!result.length) throw "Email doesn't exist";

    return new User(result[0]);
  }

  static async checkIfExistsByIdOrEmail(id, email) {
    email = email.trim();
    id = id.trim();

    let [result] = await DB.query("SELECT id,email FROM users WHERE email=? OR id=?", [email, id]);

    let emailExists = false;
    let idExists = false;

    result.forEach(row => {
      if (row.id === id) idExists = true;
      if (row.email === email) emailExists = true;
    });

    return { email: emailExists, id: idExists };
  }
}

module.exports = User;
