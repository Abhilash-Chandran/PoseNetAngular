const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const postsRoutes = require('./routes/posts');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb+srv://peezon:S7BHh7z8BQt3HYD6@cluster0-x3lta.mongodb.net/mean-udemy?retryWrites=true')
.then(() => {
  console.log('mongodb connection successfull');
})
.catch((error) => {
  console.log('mongodb Connection was not successfull ' + error);
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false})); //  just for demo purpose.

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-requestedwith, Content-Type, Accept");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, PUT, POST, PATCH, DELETE, OPTIONS"
  )
  next();
})

app.use("/api/posts/", postsRoutes);

module.exports = app;
