const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

mongoose.connect(`${process.env.MONGO_URL}newsletter?retryWrites=true`);

const db = mongoose.connection;

const ObjectId = mongoose.Schema.Types.ObjectId;

const PostSchema = mongoose.Schema({
  source: {
    type: String
  },
  title: {
    type: String
  },
  url: {
    type: String
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

PostSchema.pre("save", next => {
  now = new Date();
  if (!this.parsed) {
    this.parsed = now;
  }
  next();
});

const Post = (module.exports = mongoose.model("Post", PostSchema));

module.exports.getPostById = (id, callback) => {
  Post.findById(id, callback);
};

module.exports.getPostsBySource = (id, callback) => {
  console.log(`Post.getPostsBySource: ${id}`);
  Post.find({source: id}, callback);
};