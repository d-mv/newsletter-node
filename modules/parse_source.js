const axios = require("axios");
const parser = require("fast-xml-parser");
const he = require("he");
const Post = require("../models/post");

// const parserOptions = {
//   attributeNamePrefix: "@_",
//   attrNodeName: "attr", //default is 'false'
//   textNodeName: "#text",
//   ignoreAttributes: true,
//   ignoreNameSpace: false,
//   allowBooleanAttributes: false,
//   parseNodeValue: true,
//   parseAttributeValue: false,
//   trimValues: true,
//   cdataTagName: "__cdata", //default is 'false'
//   cdataPositionChar: "\\c",
//   localeRange: "", //To support non english character in tag/attribute values.
//   parseTrueNumberOnly: false,
//   attrValueProcessor: a => he.decode(a, { isAttributeValue: true }), //default is a=>a
//   tagValueProcessor: a => he.decode(a) //default is a=>a
// };

// const processPost = (sourceId, newPost)=> {
//   console.log("~ processPost is here");

//   Post.getPostsBySource().then(res => {
//     result = res;
//   })
//     .catch(err => {
//       console.log(err);
//     })
//     .then(() => {
//     });

//   // Post.getPostsByUrl({}, (err, res) => {
//   //   if (err) throw err;
//   //   console.log(res);
//   // });
//   //   (err, response) => {
//   //   if (err) console.log(err);
//   //   if (response) {
//   //     console.log(response);
//   //   } else {
//   //     console.log("~~ duplicate");
//   //   }

//   // });

//   // const newPost = new Post({
//   //   source: source,
//   //   title: post.title.__cdata,
//   //   url: post.link,
//   //   author: post["dc:creator"].__cdata,
//   //   published: post.pubDate,
//   //   parsed: new Date(),
//   //   text: post["content:encoded"].__cdata
//   // });
//   // newPost.save(err => {
//   //   if (err) console.log(err);
//   // });
// };

// const parseResponse = (sourceId, response) => {
//   console.log("~ parseResponse is here");

//   // parse the server response
//   const xmlData = response.data;

//   if (parser.validate(xmlData) === true) {
//     //optional (it'll return an object in case it's not valid)
//     var jsonObj = parser.parse(xmlData, parserOptions);
//   }
//   // Intermediate obj
//   var tObj = parser.getTraversalObj(xmlData, parserOptions);
//   var jsonObj = parser.convertToJson(tObj, parserOptions);
//   // parse and refill posts
//   const newItems = jsonObj.rss.channel.item;

//   newItems.forEach(post => {
//     processPost(sourceId, post);
//   });
// };

// const processSource = source => {
//   console.log("~ processSource is here");
//   console.log(`~ processing: ${source.name}`);
//   const url = source.url;
//   const sourceId = source._id;
//   let result = "";
//   axios
//     .get(url)
//     .then(res => {
//       result = res;
//     })
//     .catch(err => {
//       console.log(err);
//     })
//     .then(() => {
//       parseResponse(sourceId, result);
//     });
// };

// const downloadPosts = query => {
//   console.log(`~ Inside downloadPosts`);
//   Array.from(query).map(source => {
//     processSource(source);
//   });
//   // callback(null, parsed);
// };
export default downloadPosts;
