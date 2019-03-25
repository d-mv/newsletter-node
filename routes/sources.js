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

router.post("/", function(req, res, next) {
  const area = req.body.action[0]
  const action = req.body.action[1]
  const id = req.body.id
  const fields = req.body.fields
  if (area === 'source') {
    switch (action){
      case 'create':
      if (fields) {
        // call for create source method
        Source.createSource(fields, (err, response) => {
          if (err) throw err;
          res.send(response);
        });
      }
      break;
      case 'update':
      if (id && fields){
        // call for update method
      }
      break;
      case 'delete':
      if (id){
        // call for delete method
      }
      break;
      case 'list':
      // return list
        Source.getListOfSources(req, (err, response) => {
          if (err) throw err;
          res.json(response);
        });
      break;
      default:
      res.send(null)
      break
    }
  }
});

// router.get("/delete", function(req, res, next) {
//   Source.getListOfSources(req, (err, response) => {
//     if (err) throw err;
//     res.send(response);
//   });
// });
// router.get("/update", function(req, res, next) {
//   console.log("Updating posts");
//   const request = "freeCodeCamp";
//   Source.updatePosts(request, (err, response) => {
//     if (err) throw err;
//     res.send(response);
//   });
// });
// router.get("/tobcontinued", function(req, res, next) {
//   const request = req.path.substr(1);
//   Source.getListOfSources(request, (err, response) => {
//     if (err) throw err;
//     console.log(`SourceID: ${response._id}`);
//     const sourceId = response._id;
//     Post.getPostsBySource(sourceId, (err, response) => {
//       if (err) throw err;
//       res.send(response);
//     });
//   });
// });

module.exports = router;
