const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Post = require("../models/post");

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
  console.log("\x1b[32m", `~ Source.getSourceByName: ${name}`);
  const query = { name: name };
  Source.findOne(query, callback);
};

module.exports.createSource = (fields, callback) => {
  Source.getSourceByName(fields.name, (err, res) => {
    if (err) callback(err);
    if (res) {
      console.log("\x1b[34m", "~ source exists");
      return null;
    } else {
      console.log(
        "\x1b[32m",
        `~ Creating new source with name: ${fields.name}`
      );
      const newSource = new Source(fields);
      newSource.save(callback);
    }
  });
};
module.exports.getListOfSources = (req, callback) => {
  Source.find({}, callback);
};

module.exports.getSourceById = (id, callback) => {
  Source.findOne({ _id: id }, callback);
};

module.exports.updateSource = (options, callback) =>{
 Source.updateOne({
   _id: options.id
 },
 {
   name: options.fields.name,
   url: options.fields.url,
   home: options.fields.home,
 }).then(data => callback(data))
}

module.exports.deleteSource = (id, callback) => {
  Source.findOne({ _id: id }, (err, source) => {
    if (err) {
      callback(err);
    } else {
      if (source) {
        Post.deletePostsBySource(source._id, (err, response) => {
          if (err) {
            throw err;
          } else {
            Source.deleteOne({ _id: source._id }, (err, res) => {
              if (err) throw err;
              callback([res]);
            });
          }
        });
      }
    }
  });
};
