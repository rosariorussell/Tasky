// Configure dev, test, and production environments
require('./config/config')
const port = process.env.PORT

// start Express App
const express = require('express')
const bodyParser = require('body-parser')
var app = express()
app.use(bodyParser.json())

// Set Handlebars
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// add routes
var routes = require("./routes/routes");
app.use(routes);

// start server
app.listen(port, () => {
  console.log(`Start on port ${port}`)
})

module.exports = {app}