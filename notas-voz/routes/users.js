var express = require('express');
var router = express.Router();
var { v4: uuidv4 } = require('uuid');
var LocalStorage = require('node-localstorage').LocalStorage;
var localStorage = new LocalStorage('./scratch');

// GET users listing.
if (!localStorage.getItem("uuid")) {
  localStorage.setItem("uuid", uuidv4());
}

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
