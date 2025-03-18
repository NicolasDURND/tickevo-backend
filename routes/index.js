var express = require('express');
var router = express.Router();

// Route d'accueil
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
