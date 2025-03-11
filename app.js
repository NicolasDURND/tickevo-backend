require("dotenv").config();
require("./models/connection.js");

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var ticketsRoutes = require("./routes/tickets");
var ticketsTechnicienRoutes = require("./routes/ticketsTechnicien");

const app = express();

const cors = require("cors");

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/tickets", ticketsRoutes);
app.use("/ticketsTechnicien", ticketsTechnicienRoutes);
app.use("/", indexRouter);
app.use("/users", usersRouter);

module.exports = app;
