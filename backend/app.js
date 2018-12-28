const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const errorHandlers = require("./modules/errorHandlers");

const usersRouter = require("./routes/users");
const adminRouter = require("./routes/admin");
const shopRouter = require("./routes/shop");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", usersRouter);
app.use("/api", adminRouter);
app.use("/api", shopRouter);

// Instead of 404 error, serve the index page and let angular decide what to show
/* app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
 */

app.use(errorHandlers.clientHandler);

module.exports = app;
