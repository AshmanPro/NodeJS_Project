/**
 * Created by Sulaiman on 3/16/2016.
 */

var express = require('express');
var router = express.Router();
var mySQLConn = require('../../config/database');
var jwt = require('../../node_modules/jsonwebtoken');
var config = require('../../config/configuration');
var helper = require('../../utils/helper');
var async = require('async');


// route middleware to verify a token
router.use(function(req, res, next) {
    var fullUrl = helper.GetFullURL(req);
    var responseTime = Date.now();
    var token = req.body.token || req.query.token || req.headers['token'];
    if (token) {
        mySQLConn.pool(function(err,conn){
            // verifies secret and checks exp
            var tokenQuery = 'select * from app_register where token = ?' ;
            conn.query(tokenQuery,[token],function(err,token){
                if (err) {
                    conn.release();
                    console.log("Connection released.");
                    responseTime = Date.now()-responseTime;
                    console.log(fullUrl + " Failed to authenticate token. " + responseTime + ' ms');
                    return res.json({ status: 401, message: 'Failed to authenticate token.' });
                } if (token.length == 0) {
                    conn.release();
                    console.log("Connection released.");
                    responseTime = Date.now()-responseTime;
                    console.log(fullUrl + " Failed to authenticate token. " + responseTime + ' ms');
                    return res.json({ status: 401, message: 'Failed to authenticate token.' });
                } else {
                    conn.release();
                    console.log("Connection released.");
                    req.decoded = token;
                    next();
                }
            });
        });
    } else {
        responseTime = Date.now()-responseTime;
        console.log(fullUrl + " No token provided. " + responseTime + ' ms');
        return res.status(403).send({
            status: 403,
            message: 'No token provided.'
        });
        responseTime = Date.now()-responseTime;
    }
});
module.exports = router;