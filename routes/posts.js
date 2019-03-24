var express = require("express");
var router = express.Router();
const Source = require("../models/source");
const Post = require("../models/post");

/* GET users listing. */
router.get("*", function(req, res, next) {
  // check if id present
  const postId = req.query.id;
  console.log(postId);
  if (postId != "") {
    console.log('insideif');

    switch (req.query.action) {
      case "update":
        const fields = req.query.fields.split(";");
        const query = {_id: postId}
        const updateRequest = {};
        if (fields) {
          fields.forEach(field => {
            const fieldArray = field.split(":");
            updateRequest[fieldArray[0]] = fieldArray[1];
          });
        }
        if (updateRequest != {}) {
          Post.findOneAndUpdate(
            query,
            updateRequest,
            (err, response) => {
              if (err) res.send("-1");;
              res.send('1');
          })}
        break;
      default:
        return null;
    }
  }
})
// id=5c9509bfb21ff60d537ef96f&action=update&fields:read=true
// 5c9509bfb21ff60d537ef96f
module.exports = router;
