/*
 var express = require('express');
 var router = express.Router();

 /!* GET home page. *!/
 router.get('/', function(req, res, next) {
 res.render('index', { title: 'Express' });
 });

 module.exports = router;
 */
var apiPrefix = '/api/';
console.log('Initializing routes middleware');
var register = require('./api/register');
var user = require('./api/user');

exports.router = function (app) {
  app.use(apiPrefix + 'register', register);
  app.use(apiPrefix + 'user', user);
};