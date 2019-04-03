var express = require("express");
var router = express.Router();
const file = require("../../app/index.html");

router.post("/", function(req, res, next) {
  res.sendFile(file);
});
