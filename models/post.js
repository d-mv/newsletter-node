const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Source = require("./source");
const LogUrl = require("./log");
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
  sourceId: {
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
  readTime: {
    type: Number
  },
  pages: {
    type: Number
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
  Post.findById(id, callback).sort({ published: 1 });
};

module.exports.deletePost = (id, callback) => {
  Post.deleteOne({ _id: id }, callback);
};
module.exports.getAllPosts = (req, callback) => {
  Post.aggregate([
    {
      $project: {
        source: 1,
        sourceId: 1,
        title: 1,
        url: 1,
        author: 1,
        published: 1,
        parsed: 1,
        readTime: 1,
        pages: 1,
        star: 1,
        read: 1,
        text: {
          $substrCP: ["$text", 0, 800]
        }
      }
    }
  ])
    .sort({ published: -1 })
    .then(data => callback(data));
};
module.exports.getPostsBySource = (id, callback) => {
  console.log(`Post.getPostsBySource: ${id}`);
  Post.find({ sourceId: id })
    .sort({ published: -1 })
    .then(data => callback(data));
};

module.exports.deletePostsBySource = (id, callback) => {
  Post.find({ sourceId: id })
    .then(data =>
      Array.from(data).map(post => {
        LogUrl.deleteLogByUrl(post.url, (err, res) => {
          callback(err, res);
        });
      })
    )
    .then(data =>
      Post.deleteMany({ sourceId: id }, (err, res) => {
        callback(err, res);
      })
    )
    .catch(e => console.log(e));
};

module.exports.getPostsByUrl = (url, callback) => {
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
  // check log if downloaded before
  LogUrl.getLogByUrl(post.url, (err, res) => {
    if (err) console.log(err);
    if (res) {
    } else {
      const newPost = new Post({
        source: source[0],
        sourceId: source[1],
        title: post.title,
        url: post.url,
        author: post.author,
        published: post.published,
        parsed: new Date(),
        text: post.text,
        readTime: post.readTime,
        pages: post.pages
      });
      newPost.save(err => {
        if (err) {
          console.log(err);
        } else {
          // create new log entry
          const newLogUrl = new LogUrl({
            url: post.url
          });
          newLogUrl.save(err => {
            if (err) console.log(err);
          });
        }
      });
    }
  });
};

const parseResponse = (source, response) => {
  const xmlData = response.data;
  let dataObj = "";
  if (typeof xmlData != "object") {
    if (parser.validate(xmlData) === true) {
      //optional (it'll return an object in case it's not valid)
      var jsonObj = parser.parse(xmlData, parserOptions);
    }
    // Intermediate obj
    var tObj = parser.getTraversalObj(xmlData, parserOptions);
    var jsonObj = parser.convertToJson(tObj, parserOptions);
    // parse and refill posts
    dataObj = jsonObj.rss.channel.item;
  } else if (xmlData.items) {
    dataObj = xmlData.items;
  }

  // individual corrections
  dataObj.map(post => {
    let title = "";
    let url = "";
    let author = "";
    let published = "";
    let text = "";
    // title
    if (post.title) {
      if (post.title["__cdata"]) {
        title = post.title["__cdata"];
      } else {
        title = post.title;
      }
    }
    // link
    if (post.link) {
      url = post.link;
    } else {
      url = post.url;
    }
    // author
    if (post.author) {
      if (post.author.name) {
        author = post.author.name;
      } else {
        author = post.author;
      }
    } else if (post["dc:creator"]) {
      if (post["dc:creator"]["__cdata"]) {
        author = post["dc:creator"]["__cdata"];
      } else {
        author = post["dc:creator"];
      }
    }

    // published
    if (post.pubDate) {
      published = post.pubDate;
    } else if (post.date_published) {
      published = post.date_published;
    } else {
      published = post.published;
    }
    // text
    if (post["content:encoded"]) {
      if (post["content:encoded"].__cdata) {
        text = post["content:encoded"].__cdata;
      } else {
        text = post["content:encoded"];
      }
    } else if (post.content_html) {
      text = post.content_html;
    } else {
      text = post.content;
    }
    // create and push object
    text = text
      .replace(/(<head>.*<\/head>)/gm, "")
      .replace(/(<style>.*<\/style>)/gm, "")
      .replace(/(<script>.*<\/script>)/gm, "")
      .replace(/(<figure>.*<\/figure>)/gm, "")
      .replace(/(<iframe .*>.*<\/iframe>)/gm, "")
      .replace(/(<button .*>.*<\/button>)/gm, "")
      .replace(/(<address>.*<\/address>)/gm, "")
      .replace(/(<title>.*<\/title>)/gm, "")
      .replace(/(<header>.*<\/header>)/gm, "")
      .replace(/(<footer>.*<\/footer>)/gm, "")
      .replace(/(<figcaption>.*<\/figcaption>)/gm, "")
      .replace(/(<video .*>.*<\/video>)/gm, "")
      .replace(/(<img .*>.*<\/img>)/gm, "")
      .replace(/(<time>.*<\/time>)/gm, "")
      .replace(/(<hr>)/gm, "")
      .replace(/(<meta .*>)/gm, "")
      .replace(/(<link .*>)/gm, "");

    const textLength = text.length;

    const newPost = {
      title: title,
      url: url,
      author: author,
      published: published,
      text: text,
      readTime: Math.round(textLength / 1500),
      pages: Math.round(textLength / 3000)
    };
    processPost(source, newPost);
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
      parseResponse([source.name, source.id], result);
    });
};

const downloadPosts = query => {
  console.log(`~ Inside downloadPosts`);
  Array.from(query).map(source => {
    processSource(source);
  });
  console.log("~ update finished");
};

module.exports.refreshPosts = (query, callback) => {
  console.log(`~ Post.refreshPosts`);
  downloadPosts(query);
  setInterval(() => {
    console.log(`~ update posts...`);
    downloadPosts(query);
  }, 600000);
  callback(null, "1");
};
