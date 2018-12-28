module.exports = {
    clientHandler(err, req, res, next) {
        if (typeof err === "string") res.status(400).send(err);
        else {
          console.error(err.stack)
          res.sendStatus(500);
        }
    }
};