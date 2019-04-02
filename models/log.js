const mongoose = require("mongoose");

mongoose.Promise = global.Promise;
mongoose
  .connect(`${process.env.MONGO_URL}newsletter?retryWrites=true`)
  .then(res => console.log("Connected to DB"))
  .catch(err => console.log(err));

const db = mongoose.connection;
const LogSchema = mongoose.Schema({
  url: {
    type: String,
    index: true
  },
  parsed: {
    type: Date,
    default: Date.now
  }
});

const LogUrl = (module.exports = mongoose.model("Log", LogSchema));

module.exports.getLogByUrl = (url, callback) => {
  LogUrl.findOne({ url: url }, callback);
};

module.exports.deleteLogByUrl = (url, callback) => {
  LogUrl.deleteOne({ url: url })
    .then(data => callback(data))
    .catch(e => console.log(e));
};
