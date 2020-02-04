"use strict";

var express = require("express");
var mongo = require("mongodb");
var mongoose = require("mongoose");
let Url = require("./model/url");
var sha1 = require("sha1");
var cors = require("cors");

var app = express();

// Basic Configuration
var port = process.env.PORT || 3000;
let dns = require("dns");

/** this project needs a db !! **/
mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());
app.use(express.urlencoded());
/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// your first API endpoint...
app.post("/api/shorturl/new", function(req, res) {
  let url = req.body.url;
  let urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm;

  if (urlRegex.test(url) && url.includes("https://")) {
    let urlSplit = url.split("https://");
    urlSplit = urlSplit[1].split("/")[0];

    dns.lookup(urlSplit, function(err, address, family) {
      if (err) {
        res.json({ error: "invalid URL" });
      } else {
        let shaUrl = sha1(urlSplit);

        let shortenUrl = shaUrl.substr(shaUrl.length - 5);

        let u = new Url({ original_url: url, short_url: shortenUrl });
        u.save(function(err, url) {
          err ? console.log(err) : url;
        });
        res.json({ original_url: u.original_url, short_url: shortenUrl });
      }
    });
  } else {
    res.json({ error: "invalid URL" });
  }
});

app.get("/api/shorturl/:number", function(req, res) {
  let number = req.params.number;
  Url.find({ short_url: number })
    .then(url => res.redirect(url[0].original_url))
    .catch(err => res.json({ error: "No short url found for given input" }));
});

app.listen(port, function() {
  console.log("Node.js listening ...");
});
