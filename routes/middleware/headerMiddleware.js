/**
 * Created by Sulaiman on 3/22/2016.
 */

var express = require('express');
var router = express.Router();
var mySQLConn = require('../../config/database');
var jwt = require('../../node_modules/jsonwebtoken');
var config = require('../../config/configuration');
var helper = require('../../utils/helper');
var async = require('async');
var moment = require('moment');

router.use(function(req,res,next){
    if (typeof(req.headers["device"]) == "undefined") {
        return res.format({
            json: function () {
                res.send({
                    status: 422,
                    message: "Mandatory header is missing."
                });
            }
        });
    } else {
        next();
    }
});

module.exports = router;