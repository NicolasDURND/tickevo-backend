const mongoose = require("mongoose");

const connectionString = process.env.CONNECTION_STRING;

mongoose
  .connect(connectionString)
  .then(() => console.log("✅ Database Connected"))
  .catch((error) => console.error("❌ Database Connection Error:", error));

module.exports = mongoose;