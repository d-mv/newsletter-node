const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Source = require("./source");
// import downloadPosts from "../modules/parse_source";
const axios = require("axios");
const parser = require("fast-xml-parser");
const he = require("he");

// mongoose

mongoose.Promise = global.Promise;
mongoose
  .connect(`${process.env.MONGO_URL}newsletter?retryWrites=true`)
  .then(res => console.log("Connected to DB"))
  .catch(err => console.log(err));

const db = mongoose.connection;
const PostSchema = mongoose.Schema({
  source: {
    type: String
  },
  title: {
    type: String
  },
  url: {
    type: String,
    index: true
  },
  author: {
    type: String
  },
  published: {
    type: Date
  },
  parsed: {
    type: Date,
    default: Date.now
  },
  text: {
    type: String
  },
  read: {
    type: Boolean,
    default: false
  },
  star: {
    type: Boolean,
    default: false
  }
});

const Post = (module.exports = mongoose.model("Post", PostSchema));

module.exports.getPostById = (id, callback) => {
  Post.findById(id, callback);
};
module.exports.getAllPosts = (req, callback) => {
  Post.aggregate([
    {
      $project: {
        source: 1,
        title: 1,
        url: 1,
        author: 1,
        published: 1,
        parsed: 1,
        text: {
          $substrCP: ['$text',0,800]
        }
      }
    }
  ], callback);
};
module.exports.getPostsBySource = (id, callback) => {
  console.log(`Post.getPostsBySource: ${id}`);
  Post.find({ source: id }, callback);
};

module.exports.getPostsByUrl = (url, callback) => {
  // console.log(`Post.getPostsByUrl: ${url}`);
  Post.findOne({ url: url }, (err, res) => {
    callback(err, res);
  });
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

const processPost = (source, post) => {
  // console.log("~ processPost is here");

  Post.getPostsByUrl(post.link, (err, res) => {
    if (err) console.log(err);
    if (res) {
    } else {
      console.log("hi");

      const newPost = new Post({
        source: source,
        title: post.title,
        url: post.link,
        author: post.author.name,
        published: post.published,
        parsed: new Date(),
        text: post.text
      });
      newPost.save(err => {
        if (err) console.log(err);
      });
    }
  });
};

const parseResponse = (source, response) => {
  // console.log("~ parseResponse is here");
  let newItems = [];
  // parse the server response
  const xmlData = response.data;
  let dataObj = "";

  if (typeof xmlData != "object") {
    if (parser.validate(xmlData) === true) {
      //optional (it'll return an object in case it's not valid)
      var jsonObj = parser.parse(xmlData, parserOptions);
    }
    // Intermediate obj
    var tObj = parser.getTraversalObj(xmlData, parserOptions);
    console.log(4);
    var jsonObj = parser.convertToJson(tObj, parserOptions);
    // parse and refill posts
    dataObj = jsonObj.rss.channel.item;
  } else if (xmlData.items) {
    dataObj = xmlData.items;
  }

  // individual corrections
  if (dataObj[0].title.__cdata) {
    dataObj.map(post => {
      newItems.push({
        title: post.title.__cdata,
        url: post.link,
        author: post["dc:creator"].__cdata,
        published: post.pubDate,
        text: post["content:encoded"].__cdata
      });
    });
  } else if (dataObj[0].content_html) {
    dataObj.map(post => {
      newItems.push({
        title: post.title,
        url: post.url,
        author: post.author.name,
        published: post.date_published,
        text: post.content_html
      });
    });
  } else {
    newItems = dataObj
  }
  newItems.forEach(post => {
    processPost(source, post);
  });
};

const processSource = source => {
  console.log(`~ processing: ${source.name}`);
  const url = source.url;
  let result = "";
  axios
    .get(url)
    .then(res => {
      result = res;
    })
    .catch(err => {
      console.log(err);
    })
    .then(() => {
      parseResponse(source.name, result);
    });
};

const downloadPosts = query => {
  console.log(`~ Inside downloadPosts`);
  Array.from(query).map(source => {
    processSource(source);
  });
};

module.exports.refreshPosts = (query, callback) => {
  console.log(`~ Post.refreshPosts: ${query}`);
  downloadPosts(query);
  setInterval(() => {
    console.log(`~ update posts...`);
    downloadPosts(query);
  }, 600000);
  callback(null, "1");
};
