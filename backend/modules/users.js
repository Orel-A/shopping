const User = require("../models/User");

module.exports = {
  // Register a user by inserting to database
  async register(postData) {
    if (!postData.password || postData.password.length < 6) throw "Password must be at least 6 characters";
    let user = new User(postData, true);
    user.sanitize();
    await user.setPassword(postData.password);
    await user.insertToDB();
    return user;
  },

  // check provided email and password, if match return user info as result
  async login(postData) {
    if (!postData.email || !postData.password) throw "Must provide an email and password";
    let user = await User.fetchByEmail(postData.email);
    let passMatch = await user.matchPassword(postData.password);
    if (!passMatch) throw "Password incorrect";
    return user;
  },

  // check for duplicates, email or id
  async checkDuplicates(postData) {
    if (!postData.id || !postData.email) throw "bad data";
    return User.checkIfExistsByIdOrEmail(postData.id, postData.email);
  }
};
