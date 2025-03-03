const mongoose = require("mongoose");

const serviceSchema = mongoose.Schema({
  ServiceName: String,
  ServiceDescription: String,
});

const Service = mongoose.model("services", serviceSchema);

module.exports = Service;
