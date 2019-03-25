var express = require("express");
var router = express.Router();
const Source = require("../models/source");
const Post = require("../models/post");

router.get("/", function(req, res, next) {
  res.send("Available actions: update (update individual post), refresh (refresh posts)");
});

router.post("/update", function(req, res, next) {
  console.log(req.body);
  
  const postId = req.body.id;
  // check if id present
  if (postId != "") {
    // check action
    switch (req.body.action) {
      // update individual
      case "update":
        const updateRequest = req.body.fields;
        const query = {
          _id: postId
        }
        if (updateRequest != {}) {
          Post.findOneAndUpdate(query, updateRequest, (err, response) => {
            if (err) res.send("-1");
            res.send("1");
          });
        }
        break;
      default:
        return null;
    }
  }
});

// id=5c9509bfb21ff60d537ef96f&action=update&fields:read=true

router.get("/refresh", function (req, res, next) {
  Source.getListOfSources(req, (err, response) => {
    if (err) throw err;
    Post.refreshPosts(response, (err, reply) => {
    res.send(reply)
    })
  });
});

router.get('/all', (req,res,next)=> {
  console.log('~ requested all posts')
      Post.getAllPosts('', (err, response) => {
        if (err) throw err;
        res.json(response);
      });
})
module.exports = router;
