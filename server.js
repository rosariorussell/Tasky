// Configure dev, test, and production environments
require('./config/config')
const port = process.env.PORT

// start Express App
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
var app = express()


app.use(cors())
const corsOptions = {
  origin: 'http://localhost:4200',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Set Handlebars
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.use(express.static("./public"))

// add routes
require("./routes/html-routes")(app)
var controller = require("./routes/controller");
app.use(controller);

// start server
app.listen(port, () => {
  console.log(`Start on port ${port}`)
})

module.exports = { app }