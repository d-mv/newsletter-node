var express = require("express");
var router = express.Router();
const Source = require("../../models/source");
const Post = require("../../models/post");

/* GET home page. */
router.post("/", function(req, res, next) {
  console.log(req.body);
  const area = req.body.query.action[0];
  const action = req.body.query.action[1];
  const id = req.body.query.id;
  const fields = req.body.query.fields;
  let query = "";

  if (area === "source") {
    switch (action) {
      case "create":
        if (fields) {
          // call for create source method
          Source.createSource(fields, (err, response) => {
            if (err) throw err;
            res.send(response);
          });
        }
        break;
      case "update":
        if (id && fields) {
          // call for update method
          Source.updateSource({id:id, fields: fields},(err,response)=> {
            if (err) {
              res.send(err);
            } else {
              res.send(response);
            }
          })
        }
        break;
      case "delete":
        if (id) {
          Source.deleteSource(id, (response) => {
            // if (err) {
            //   res.send(err);
            // } else {
              res.send(response);
            // }
          });
        }
        break;
      case "list":
        // return list
        Source.getListOfSources(query, (err, response) => {
          if (err) throw err;
          res.json(response);
        });
        break;
      default:
        res.send(null);
        break;
    }
  } else if (area === "post") {
    switch (action) {
      case "read":
        if (id) {
          // call for read post method
          query = {
            _id: id
          };
          Post.getPostById(query, (err, response) => {
            if (err) throw err;
            res.json(response);
          });
        }
        break;
      case "refresh":
        Source.getListOfSources(query, (err1, response) => {
          if (err1) res.send(err1);
          Post.refreshPosts(response, (err2, reply) => {
            if (err2) res.send(err2);
            res.json(reply);
          });
        });
        break;
      case "update":
        if (id && fields) {
          const query = {
            _id: id
          };
          Post.findOneAndUpdate(query, fields, (err, response) => {
            if (err) {
              res.send(err);
            } else {
              res.send(response);
            }
          });
        }
        break;
      case "delete":
        if (id) {
          // call for delete method
          console.log("post delete");

          Post.deletePost(id, (err, response) => {
            if (err) {
              res.send(err);
            } else {
              res.send(response);
            }
          });
        }
        break;
      case "list":
        console.log("~ sending list");
        // return list
        Post.getAllPosts(query, (err, response) => {
          if (err) throw err;
          res.send(response);
        });
        break;
      default:
        res.send(null);
        break;
    }
  }
});

router.get("/list", (req, res, next) => {
  const query = "";
  Post.getAllPosts(query, (err, response) => {
    if (err) {
      res.send(err);
    } else {
      res.send(response);
    }
  });
});
router.get("/sources", (req, res, next) => {
  const query = "";
  Source.getListOfSources(query, (err, response) => {
    if (err) {
      res.send(err);
    } else {
      res.send(response);
    }
  });
});

router.get("/post/*", (req, res, next) => {
  console.log(req.path.substr(6, req.path.length));
  const id = req.path.substr(6, req.path.length);
  const query = {
    _id: id
  };
  Post.getPostById(query, (err, response) => {
    if (err) {
      res.send(err);
    } else {
      res.send(response);
    }
  });
});

module.exports = router;
