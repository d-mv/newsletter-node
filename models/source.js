const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
// const parseSource = require('../modules/parse_source')
const axios = require("axios");
const parser = require("fast-xml-parser");
const he = require("he");
const Post = require("../models/post");
// const Mercury = require('@postlight/mercury-parser')

mongoose.connect(`${process.env.MONGO_URL}newsletter?retryWrites=true`);

const db = mongoose.connection;

const SourceSchema = mongoose.Schema({
  name: {
    type: String,
    index: true
  },
  url: {
    type: String
  },
  home: {
    type: String
  }
});
const Source = (module.exports = mongoose.model("Source", SourceSchema));

module.exports.getSourceByName = (name, callback) => {
  console.log(`Source.getSourceByName: ${name}`);
  const query = { name: name };
  Source.findOne(query, callback);
};

module.exports.createSource = (newSource, callback) => {
  newSource.save(callback);
};
module.exports.getListOfSources = (req, callback) => {
  Source.find({}, callback);
};

const parserOptions = {
  attributeNamePrefix: "@_",
  attrNodeName: "attr", //default is 'false'
  textNodeName: "#text",
  ignoreAttributes: true,
  ignoreNameSpace: false,
  allowBooleanAttributes: false,
  parseNodeValue: true,
  parseAttributeValue: false,
  trimValues: true,
  cdataTagName: "__cdata", //default is 'false'
  cdataPositionChar: "\\c",
  localeRange: "", //To support non english character in tag/attribute values.
  parseTrueNumberOnly: false,
  attrValueProcessor: a => he.decode(a, { isAttributeValue: true }), //default is a=>a
  tagValueProcessor: a => he.decode(a) //default is a=>a
};

const createPost = (source, post) => {
  const newPost = new Post({
    source: source,
    title: post.title.__cdata,
    url: post.link,
    author: post["dc:creator"].__cdata,
    published: post.pubDate,
    parsed: new Date(),
    text: post["content:encoded"].__cdata
  });
  newPost.save(err => {
    if (err) console.log(err);
  });
};

const proccessPosts = (source, posts) => {
  // console.log(source);
  // newSource = {
  //   name: "freeCodeCamp",
  //   url: "https://medium.freecodecamp.org/feed",
  //   home: "https://medium.freecodecamp.org"
  // };
  // const createNewSource = new Source(newSource);
  // createNewSource.save();
  // console.log(createNewSource);
  // 5c950392ccb6ae09507f6da3

  posts.forEach(post => {
    createPost(source, post);
  });
  // Post.getPostById("5c9509bfb21ff60d537ef96f",(err,res)=> {
  // console.log(res.title);

  // });
};

module.exports.updatePosts = (source, callback) => {
// parse the server response
  console.log(`Source.updatePosts: ${source}`);

  const parseResponse = (source, response) => {
    const xmlData = response.data;

    if (parser.validate(xmlData) === true) {
      //optional (it'll return an object in case it's not valid)
      var jsonObj = parser.parse(xmlData, parserOptions);
    }
    // Intermediate obj
    var tObj = parser.getTraversalObj(xmlData, parserOptions);
    var jsonObj = parser.convertToJson(tObj, parserOptions);
    // parse and refill posts
    proccessPosts(source, jsonObj.rss.channel.item);
    // newPost.save(err => {
    //   if (err) console.log(err);
    // });
    return "";
  };

  async function getSourceDetails() {
    // set url var
    let url = "";
    let sourceId = "";
    // find the source
    await Source.findOne({ name: source })
      .catch(e => {
        console.log(e);
      })
      .then(response => {
        url = response.url;
        sourceId = response._id;
        console.log(`Got sourceID: ${sourceId}`);
      });
    // set result var
    let result = "";
    // get the source data
    axios
      .get(url)
      .then(res => {
        result = res;
      })
      .catch(err => {
        console.log(err);
      })
      .then(() => {
        callback(null, parseResponse(sourceId, result));
      });
  }
  getSourceDetails();
};
