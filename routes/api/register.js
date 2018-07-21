


var express = require('express');
var router = express.Router();
var mysqlConnection = require('../../config/database');
var http = require('http');
var jwt = require('../../node_modules/jsonwebtoken');
var config = require('../../config/configuration');

router.post('/sendVerificationCode', function (req, res) {
    //console.log(req.body.phone);

    var phoneno = req.body.phone;
    var pinNumber = Math.floor(Math.random() * 900000) + 100000;
    var moment = require('moment');
    var currentTimeStamp = moment().format('YYYY-MM-DD h:mm:ss');
    var codeExpiry = moment().add('20', 'minutes').format('YYYY-MM-DD h:mm:ss');

    if (phoneno != null) {

        var phoneJSON = {
            phone: req.body.phone, is_verified: 1, verification_code: pinNumber, verification_expiry: codeExpiry,
            create_time: currentTimeStamp, update_time: currentTimeStamp
        };

        mysqlConnection.pool(function (err, conn) {
            conn.query("select * from app_register where phone = ?", [phoneno], function (err, result) {
                if (err) {
                    conn.release();
                    throw err;
                } else {
                    if (result.length != 0) {

                        /*res.format({
                         json: function () {
                         res.send({
                         status: 404,
                         message: "Phone number already exists"
                         });
                         }
                         });*/
                        // Send Verification Code Update Is verified 1

                        var smsSessionAPI = 'rest.innovativetxt.com';
                        var path = "/smsapi/index.php?to=" + phoneno + "&from=CNQUER&text=Your%20Verification%20code%20is%20" + pinNumber + "&api_key=xnfg75nm&api_secret=3n9gv3u8";
                        //var lox24Client = http.createClient(80, lox24SessionAPI);
                        //var request = http.request('GET', path, {'host': lox24SessionAPI});
                        var request = http.request({
                            method: 'GET',
                            host: smsSessionAPI,
                            path: path
                        });

                        request.on('error', function (e) {
                            console.log(e)
                            conn.release();

                            res.format({
                                json: function () {
                                    res.send({
                                        status: 500,
                                        message: "Error in sending SMS"
                                    });
                                }
                            });
                        });

                        request.end();
                        request.on('response', function (response) {
                            response.setEncoding('utf8');
                            response.addListener('data', function (chunk) {
                                console.log(chunk)
                                // TimeStamp for New Token
                                if(result[0].token_expiry != null) {
                                    var claims = {
                                        sub: Math.random().toString(36).substr(2, 5),
                                        name: Math.random().toString(36).substr(2, 5)
                                    };
                                    var token = jwt.sign(claims, config.secret);
                                    phoneJSON['token'] = token;
                                    phoneJSON['is_verified'] = 1;
                                    phoneJSON['verification_code'] = pinNumber;
                                    phoneJSON['update_time'] = currentTimeStamp;
                                }

                                // Generated Token
                                var UpdateToken = {
                                    token: token,
                                    is_verified: 1,
                                    verification_code: pinNumber,
                                    token_expiry: moment,
                                    update_time: currentTimeStamp
                                };
                                //conn.query('update cnquer_register set verification_code = ? , is_verified = ?, token = ?, token_expiry = ? where phone = ?', [pinNumber, 1,token, moment, phoneno], function (err, rows) {
                                conn.query('update app_register set ? where phone = ?', [phoneJSON, phoneno], function (err, rows) {
                                    if (err) {
                                        conn.release();
                                        throw err;
                                    } else {
                                        if (rows.affectedRows != 0) {
                                            conn.release();
                                            res.format({
                                                json: function () {
                                                    res.send({
                                                        status: 200,
                                                        message: "Verification code sent to phone number",
                                                        token: token
                                                    });
                                                }
                                            });


                                        } else {
                                            conn.release();

                                            res.format({
                                                json: function () {
                                                    res.send({
                                                        status: 500,
                                                        message: "Something went wrong while inserting the record"
                                                    });
                                                }
                                            });

                                        }
                                    }
                                });
                            });
                        });

                        // 404 already exists complete


                        // if date expired

                    } else {
                        /*conn.query("insert into cnquer_register set ?", [phoneJSON], function (err, rows) {
                         if (err) {
                         conn.release();
                         throw err;
                         } else {*/
                        var smsSessionAPI = 'rest.innovativetxt.com';
                        var path = "/smsapi/index.php?to=" + phoneno + "&from=CNQUER&text=Your%20Verification%20code%20is%20" + pinNumber + "&api_key=xnfg75nm&api_secret=3n9gv3u8";
                        //var lox24Client = http.createClient(80, lox24SessionAPI);
                        //var request = http.request('GET', path, {'host': lox24SessionAPI});
                        var request = http.request({
                            method: 'GET',
                            host: smsSessionAPI,
                            path: path
                        });
                        request.on('error', function (e) {
                            console.log(e)
                            conn.release();

                            res.format({
                                json: function () {
                                    res.send({
                                        status: 500,
                                        message: "Error in sending SMS"
                                    });
                                }
                            });
                        });

                        request.end();

                        request.on('response', function (response) {
                            response.setEncoding('utf8');
                            response.addListener('data', function (chunk) {
                                console.log(chunk)
                                conn.query("insert into app_register set ?", [phoneJSON], function (err, rows) {
                                    if (err) {
                                        conn.release();
                                        throw err;
                                    } else {
                                        if (rows.affectedRows != 0) {
                                            conn.release();

                                            res.format({
                                                json: function () {
                                                    res.send({
                                                        status: 200,
                                                        message: "Verification code sent to phone number"
                                                    });
                                                }
                                            });


                                        } else {
                                            conn.release();

                                            res.format({
                                                json: function () {
                                                    res.send({
                                                        status: 500,
                                                        message: "Something went wrong while inserting the record"
                                                    });
                                                }
                                            });

                                        }
                                    }
                                });
                            });
                        });
                        //  }
                        //});
                    }
                }
            });
        });
    }
    else {
        conn.release();

        res.format({
            json: function () {
                res.send({
                    status: 404,
                    message: "No Phone Found"
                });
            }
        });

    }
});


router.post('/verifyCode', function (req, res) {
    //console.log(req.body.phone);
    var moment = require('moment');


    if (typeof req.body.pincode == 'undefined' || req.body.pincode == '') {
        conn.release();

        return res.format({
            json: function () {
                res.send({
                    status: 404,
                    message: "Mandatory parameter/header is missing."
                });
            }
        });

    } else {
        mysqlConnection.pool(function (err, conn) {

            var pin = req.body.pincode;

            conn.query("select * from app_register where verification_code = ?", [pin], function (err, result) {
                if (err) {
                    conn.release();
                    throw err;
                } else {
                    if (result.length != 0) {
                        console.log(result[0]);
                        //console.log(pin);
                        console.log(result[0].is_verified);
                        if (result[0].is_verified == 1) {

                            if (pin == result[0].verification_code) {

                                var expiryTime = moment(result[0].verification_expiry).format('YYYY-MM-DD h:mm:ss');
                                var now = moment().format('YYYY-MM-DD h:mm:ss');

                                console.log(result[0].verification_expiry);

                                if (expiryTime > now) {

                                    // Generated Token
                                    var claims = {
                                        sub: Math.random().toString(36).substr(2, 5),
                                        name: Math.random().toString(36).substr(2, 5)
                                    };
                                    var token = jwt.sign(claims, config.secret);
                                    console.log(token);
                                    conn.query('update app_register set token = ?,token_expiry = ?, is_verified = ? where phone = ?', [token, null, 0, result[0].phone], function (err, update) {
                                        if (err) {
                                            conn.release();
                                            throw err;
                                        }
                                        else {
                                            console.log(update);
                                            if (update.affectedRows != 0) {
                                                conn.release();
                                                console.log("Connection released.");
                                                res.format({
                                                    json: function () {
                                                        res.send({
                                                            status: 200,
                                                            message: "Verified",
                                                            "token": token,
                                                            "phone": result[0].phone
                                                        });
                                                    }
                                                });
                                            }
                                            else {
                                                conn.release();
                                                console.log("Connection released.");
                                                return res.format({
                                                    json: function () {
                                                        res.send({
                                                            status: 505,
                                                            message: "Something went wrong on server, unable to update."
                                                        });
                                                    }
                                                });
                                            }
                                        }

                                    });
                                }
                                else {
                                    // Error 406 error // your code is expired
                                    res.format({
                                        json: function () {
                                            res.send({
                                                status: 406,
                                                message: "Your code is expired",
                                            });
                                        }
                                    });
                                }
                            }
                            else {
                                conn.release();

                                return res.format({
                                    json: function () {
                                        res.send({
                                            status: 404,
                                            message: "Message code does not Exists."
                                        });
                                    }
                                });
                            }
                        }
                        else {
                            conn.release();

                            return res.format({
                                json: function () {
                                    res.send({
                                        status: 200,
                                        message: "Already verified."
                                    });
                                }
                            });
                        }
                    } else {
                        conn.release();

                        return res.format({
                            json: function () {
                                res.send({
                                    status: 404,
                                    message: "Pin number not found"
                                });
                            }
                        });
                    }
                }
            });

        });
    }

});


module.exports = router;