const crypto = require("crypto");
const DB = require("./database");
const CronJob = require("cron").CronJob;
const moment = require("moment");
const User = require("../models/User");

// A cron job that will run every hour to clean old sessions
const cleanerJob = new CronJob("0 * * * *", () => {
  console.log("cleanerJob: " + moment().format("HH:mm"));
  DB.query("DELETE FROM sessions WHERE expires < NOW()");
});
cleanerJob.start();

// Generates a random string of 64 characters using crypto library
// Output is a base64 string hash on 48 random bytes. ceil(n / 3) * 4 == 64
function generateSessionID() {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(48, (err, buf) => {
      if (err) return reject(err);
      resolve(buf.toString("base64"));
    });
  });
}

module.exports = {
  // Fetch logged user
  async fetchLoggedUser(cookies) {
    if (!cookies.sessionID) return null;
    
    let [result] = await DB.query(
      "SELECT u.* FROM sessions s JOIN users u ON s.user_id=u.user_id WHERE s.session_id=?",
      cookies.sessionID
    );
    
    return result[0] ? new User(result[0]) : null;
  },
  // A middleware that checks for a cookie called 'sessionID' and if it exists in database assume user is logged
  async loginMiddleware(req, res, next) {
    let user = await module.exports.fetchLoggedUser(req.cookies);
    if (!user) return res.sendStatus(403);
    req.user = new User(user);
    next();
  },

  // Creates a new login session entry in database and send the cookie to the browser
  async createLoginSession(userId, res) {
    let sessionId = await generateSessionID();
    let expires = new Date();
    expires.setDate(expires.getDate() + 1); // 1 day duration

    // If this update query succeeds, then no need for insert query
    let [result] = await DB.query("UPDATE sessions SET ? WHERE user_id=?", [
      {
        session_id: sessionId,
        expires
      },
      userId
    ]);

    if (!result.affectedRows) {
      await DB.query("INSERT INTO sessions SET ?", {
        session_id: sessionId,
        user_id: userId,
        expires
      });
    }

    res.cookie("sessionID", sessionId, { httpOnly: true, expires });
  },

  // Deletes session entry based on userId
  async destroySession(userId, res) {
    await DB.query("DELETE FROM sessions WHERE user_id=?", userId);
    res.clearCookie("sessionID");
  }
};
