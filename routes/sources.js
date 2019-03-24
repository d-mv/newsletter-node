var express = require("express");
var router = express.Router();
const Source = require("../models/source");
const Post = require("../models/post");

/* GET users listing. */
router.get("/list", function(req, res, next) {
  console.log(process.env.MONGO_USER);
  console.log(process.env.MONGO_PASS);
  Source.getListOfSources(req, (err, response) => {
    if (err) throw err;
    res.send(response);
  });
});

router.get("/create", function(req, res, next) {
  Source.getListOfSources(req, (err, response) => {
    if (err) throw err;
    res.send(response);
  });
});

router.get("/delete", function(req, res, next) {
  Source.getListOfSources(req, (err, response) => {
    if (err) throw err;
    res.send(response);
  });
});
router.get("/update", function(req, res, next) {
  console.log("Updating posts");
  const request = "freeCodeCamp";
  Source.updatePosts(request, (err, response) => {
    if (err) throw err;
    res.send(response);
  });
});
router.get("*", function(req, res, next) {
  const request = req.path.substr(1);
  Source.getSourceByName(request, (err, response) => {
    if (err) throw err;
    console.log(`SourceID: ${response._id}`);
    const sourceId = response._id;
    Post.getPostsBySource(sourceId, (err, response) => {
      // console.log(`Posts: ${response}`);

      if (err) throw err;
      res.send(response);
    });
  });

  // Post.getListOfSources(req, (err, response) => {
  //   if (err) throw err
  //   res.send(response);
  // })
  // Source.getSourceInfo(request, (err, response) => {
  //   if (err) throw err;
  //   res.send(response);
  // })
});

module.exports = router;
