/**
 * Created by Sulaiman on 5/23/2016.
 */

var express = require('express');
var router = express.Router();
var oAuthRouter = require('../middleware/oauthmiddleware');
router.use(oAuthRouter);
var headerRouter = require('../middleware/headerMiddleware');
router.use(headerRouter);
var mySQLConn = require('../../config/database');
var helper = require('../../utils/helper');
var fs = require('fs');
var config = require('../../config/configuration');
var multiparty = require('multiparty');
var moment = require('moment');
var async = require('async');
var http = require('http');

router.post('/updateUserProfile', function (req, res) {
    var updateUserProfile = {};

    if (typeof (req.body.email) != "undefined") {
        var emailValidate = new helper.ValidateEmail(req.body.email);
        if (emailValidate.validate() == true) {
            updateUserProfile['email'] = req.body.email;
        } else {
            console.log(" Invalid email address. ");
            return res.format({
                json: function () {
                    res.send({
                        status: 403,
                        message: "Please enter a valid email address"
                    });
                }
            });
        }
    }
    if (typeof (req.body.name) != "undefined") {
        updateUserProfile['name'] = req.body.name;
    }
    if (typeof (req.body.city) != "undefined") {
        updateUserProfile['city'] = req.body.city;
    }
    if (typeof (req.body.date_birth) != "undefined") {
        updateUserProfile['date_birth'] = req.body.date_birth;
        if (moment(req.body.date_birth, 'YYYY-MM-DD', true).isValid()) {
            updateUserProfile["date_birth"] = req.body.date_birth;
        } else {
            console.log("Invalid date format")
            return res.format({
                json: function () {
                    res.send({
                        status: 401,
                        message: "Invalid date format"
                    });
                }
            });
        }
    }
    if (typeof (req.body.gender) != "undefined") {
        updateUserProfile['gender'] = req.body.gender;
    }
    if (typeof (req.body.field_of_study) != "undefined") {
        updateUserProfile['field_of_study'] = req.body.field_of_study;
    }
    if (typeof (req.body.status_message) != "undefined") {
        updateUserProfile['status_message'] = req.body.status_message;
    }

    mySQLConn.pool(function (err, conn) {
        if (err) {
            throw err;
        } else {
            conn.query('select * from app_register where token = ?', [req.headers["token"]], function (err, result) {
                if (err) {
                    conn.release();
                    throw err;
                } else {
                    if (result.length != 0) {

                        var obj = {};
                        obj['phone'] = result[0].phone;
                        if (typeof (req.body.picture) != "undefined") {
                            fs.writeFile("public/images/" + result[0].id + ".jpg", req.body.picture, 'base64', function (err) {
                                if (err) {
                                    conn.release();
                                    throw err;
                                } else {
                                    updateUserProfile['picture'] = config.configAddress + "/images/" + result[0].id + ".jpg";
                                    updateUserProfileFunction(conn, updateUserProfile, result, res);
                                }
                            });
                        } else {
                            updateUserProfileFunction(conn, updateUserProfile, result, res);
                        }
                        /*conn.query('select * from cnquer_contacts where phone = ?', [obj['phone']], function (err, res) {
                         if (err) {
                         conn.release();
                         throw err;
                         }
                         else {
                         console.log(res);
                         if (res.length != 0) {
                         if (typeof (req.body.picture) != "undefined") {
                         fs.writeFile("public/images/" + res[0].id + ".jpg", req.body.picture, 'base64', function (err) {
                         if (err) {
                         conn.release();
                         throw err;
                         } else {
                         updateUserProfile['picture'] = config.configAddress + "/images/" + result[0].id + ".jpg";
                         updateUserProfile['is_joinned'] = 0;
                         console.log(updateUserProfile);
                         }
                         conn.query('update cnquer_contact set ? where phone = ?', [updateUserProfile, result[0].phone], function (err, user) {
                         if (err) {
                         conn.release();
                         throw err;
                         } else {
                         if (user.length != 0) {
                         console.log('Updated image');
                         }
                         else {
                         console.log('Error in Updating profile');
                         }
                         }

                         });
                         });
                         } else {
                         updateUserProfile['is_joinned'] = 0;
                         conn.query('update cnquer_contact set ? where phone = ?', [updateUserProfile, result[0].phone], function (err, user) {
                         if (err) {
                         conn.release();
                         throw err;
                         } else {
                         if (user.length != 0) {
                         console.log('Updated image');
                         }
                         else {
                         console.log('Error in Updating profile');
                         }
                         }

                         });
                         console.log(updateUserProfile);
                         }
                         } else {
                         console.log("updated")
                         }

                         }

                         });*/

                        /*//////////////////

                         if (typeof (req.body.picture) != "undefined") {
                         fs.writeFile("public/images/" + result[0].id + ".jpg", req.body.picture, 'base64', function (err) {
                         if (err) {
                         conn.release();
                         throw err;
                         } else {
                         updateUserProfile['picture'] = config.configAddress + "/images/" + result[0].id + ".jpg";
                         updateUserProfileFunction(conn, updateUserProfile, result, res);
                         }
                         });
                         } else {
                         updateUserProfileFunction(conn, updateUserProfile, result, res);
                         }
                         */
                        ///
                    } else {
                        conn.release();
                        console.log("Connection released.");
                        return res.format({
                            json: function () {
                                res.send({
                                    status: 404,
                                    message: "Details not recognized."
                                });
                            }
                        });
                    }
                }
            });
        }
    });
});
function updateUserProfileFunction(conn, updateUserProfile, result, res) {
    conn.query('update app_register set ? where phone = ?', [updateUserProfile, result[0].phone], function (err, user) {
        if (err) {
            conn.release();
            throw err;
        } else {
            if (user.affectedRows != 0) {
                conn.query('select * from app_contacts where phone = ?', [result[0].phone], function (err, contact) {
                    if (err) {
                        conn.release();
                        throw err;
                    } else {
                        if (contact.length != 0) {
                            updateUserProfile['is_joinned'] = 0;
                            conn.query('update app_contacts set ? where phone = ?', [updateUserProfile, result[0].phone], function (err, up) {
                                if (err) {
                                    conn.release();
                                    throw err;
                                } else {
                                    conn.release();
                                    console.log("Connection released.");
                                    res.format({
                                        json: function () {
                                            res.send({
                                                status: 200,
                                                message: "Your profile has been updated successfully"
                                            });
                                        }
                                    });
                                }
                            });
                        } else {
                            conn.release();
                            console.log("Connection released.");
                            res.format({
                                json: function () {
                                    res.send({
                                        status: 200,
                                        message: "Your profile has been updated successfully"
                                    });
                                }
                            });
                        }
                    }
                });
            } else {
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
router.post('/getUserProfile', function (req, res) {

    //var token = req.body.token;

    mySQLConn.pool(function (err, conn) {
        if (err) {
            throw err;
        } else {
            conn.query('select * from app_register where token = ?', [req.headers["token"]], function (err, result) {
                if (err) {
                    conn.release();
                    throw err;
                } else {
                    if (result.length != 0) {

                        var obj = {};
                        obj['name'] = result[0].name;
                        obj['phone'] = result[0].phone;
                        obj['city'] = result[0].city;
                        obj['date_birth'] = moment(result[0].date_birth).format('YYYY-MM-DD');
                        obj['gender'] = result[0].gender;
                        obj['picture'] = result[0].picture;
                        obj['field_of_study'] = result[0].field_of_study;

                        conn.release();
                        res.format({
                            json: function () {
                                res.send({
                                    status: 200,
                                    user: obj
                                });
                            }
                        });

                    } else {
                        conn.release();
                        console.log("Connection released.");
                        return res.format({
                            json: function () {
                                res.send({
                                    status: 404,
                                    message: "Details not found."
                                });
                            }
                        });
                    }
                }
            });
        }
    });
});


router.post('/importContacts', function (req, res) {

    mySQLConn.pool(function (err, conn) {
        var payload = req.body.payload;

        conn.query('select id,name from app_register where token = ?', [req.headers["token"]], function (err, result) {
            if (err) {
                conn.release();
                throw err;
            } else {
                var count = 0;
                if (result.length != 0) {
                    async.eachSeries(payload, function (obj, callback) {
                        obj['owner_id'] = result[0].id;
                        obj['is_joinned'] = 1;
                        count++;
                        //obj['phone'] =
                        var phoneArray = obj.phone.split("\n");
                        console.log(phoneArray)
                        var phone = [];
                        var globalPhoneArray = [];
                        if (phoneArray.length > 0) {
                            obj['phone'] = phoneArray[0];
                        }
                        //console.log(obj);

                        conn.query('Insert INTO app_contacts set ?', [obj], function (err, ins) {
                            if (err) {
                                conn.release();
                                throw err;
                            }
                            else {
                                if (ins.affectedRows != 0) {

                                    if(payload['phone'] == ins.phone && payload['is_joinned'] == ins.is_joinned ) {
                                        console.log('The Contact is already joined');
                                    }

                                    if (phoneArray.length == 1) {
                                        phone = [ins.insertId, phoneArray[0], moment().format('YYYY-MM-DD hh:mm:ss'), moment().format('YYYY-MM-DD hh:mm:ss')];
                                        globalPhoneArray.push(phone);
                                    } else {
                                        for (var i = 0; i < phoneArray.length; i++) {
                                            phone = [ins.insertId, phoneArray[i], moment().format('YYYY-MM-DD hh:mm:ss'), moment().format('YYYY-MM-DD hh:mm:ss')];
                                            globalPhoneArray.push(phone);
                                        }
                                    }
                                    //console.log(globalPhoneArray);
                                    conn.query('insert into app_contact_phones (contact_id,phone_number,create_time,update_time) values ?', [globalPhoneArray], function (err, ins1) {
                                        if (err) {
                                            conn.release();
                                            throw err;
                                        } else {
                                            if (ins1.affectedRows != 0) {
                                                delete obj.owner_id;
                                                //console.log(obj.phone);
                                                var count1 = 0;

                                                async.eachSeries(phoneArray, function (p, cb) {
                                                    count1++;
                                                    var smsSessionAPI = 'rest.innovativetxt.com';
                                                    var path = "/smsapi/index.php?to=" + p + "&from=CNQUER&text=You%20are%20invited%20from%20Conquer%20by%20" + escape(result[0].name) + "%20Link%20http://www.innovation-sq.com" + "&api_key=xnfg75nm&api_secret=3n9gv3u8";
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
                                                            console.log(chunk);
                                                            if(count1 != phoneArray.length) {
                                                                cb();
                                                            } else {
                                                                delete obj.is_joinned;
                                                                ////////////////////////
                                                                if (count == payload.length) {
                                                                    console.log("Connection released.");

                                                                    res.format({
                                                                        json: function () {
                                                                            res.send({
                                                                                status: 200,
                                                                                contact_imported: payload.length,
                                                                                payload: payload,
                                                                                message: "Invite sent!"
                                                                            });
                                                                        }
                                                                    });
                                                                } else {
                                                                    callback();
                                                                }
                                                            }

                                                        });
                                                    });

                                                });
                                            }
                                        }
                                    });
                                }
                                else {
                                    conn.release();
                                    res.format({
                                        json: function () {
                                            res.send({
                                                status: 500,
                                                message: "Something is missing in Importing Contacts."
                                            });
                                        }
                                    });
                                }
                            }
                        });
                    });
                    /*for (var i = 0; i < payload.length; i++) {
                     var obj = {};
                     obj = payload[i];
                     obj['owner_id'] = result[0].id;
                     count++;
                     //Immediate invoked function expression
                     (function (obj,count) {
                     conn.query('Insert INTO cnquer_contacts set ?', [obj], function (err, ins) {
                     if (err) {
                     conn.release();
                     throw err;
                     }
                     else {
                     if (ins.affectedRows != 0) {
                     if (count == payload.length) {
                     console.log("Connection released.");
                     res.format({
                     json: function () {
                     res.send({
                     status: 200,
                     message: "Contacts Import Successful."
                     });
                     }
                     });
                     }
                     }
                     else {
                     conn.release();
                     res.format({
                     json: function () {
                     res.send({
                     status: 500,
                     message: "Something is missing in Importing Contacts."
                     });
                     }
                     });
                     }
                     }
                     });
                     })(obj,count)
                     }*/
                }
            }
        });
        //}
    });

});


router.post('/viewContacts', function (req, res) {

    mySQLConn.pool(function (err, conn) {
        if (err) {
            throw err;
        } else {
            conn.query('select id from app_register where token = ?', [req.headers["token"]], function (err, result) {
                if (err) {
                    conn.release();
                    throw err;
                } else {
                    if (result.length != 0) {
                        conn.query('select name,phone from app_contacts where owner_id = ? and is_joinned = ?', [result[0].id, 1], function (err, inss) {

                            if (err) {
                                conn.release();
                                throw err;
                            }
                            else {
                                if (inss.length != 0) {
                                    console.log(inss);

                                    res.format({
                                        json: function () {
                                            res.send({
                                                status: 200,
                                                payload: inss
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
                                                status: 404,
                                                message: "Details not found."
                                            });
                                        }
                                    });
                                }

                            }

                        });


                    } else {
                        conn.release();
                        console.log("Connection released.");
                        return res.format({
                            json: function () {
                                res.send({
                                    status: 404,
                                    message: "Details not found."
                                });
                            }
                        });
                    }
                }
            });
        }
    });


});

router.post('/manageContacts', function (req, res) {

    mySQLConn.pool(function (err, conn) {
        if (err) {
            throw err;
        } else {
            conn.query('select * from app_register where token = ?', [req.headers["token"]], function (err, result) {
                if (err) {
                    conn.release();
                    throw err;
                } else {
                    if (result.length != 0) {
                        var city = result[0].city;
                        conn.query('select name,picture,city from app_contacts where owner_id = ? and is_joinned = ?', [result[0].id, 0], function (err, inss) {
                            if (err) {
                                conn.release();
                                throw err;
                            }
                            else {
                                if (inss.length != 0) {
                                    console.log(inss);
                                    res.format({
                                        json: function () {
                                            res.send({
                                                status: 200,
                                                payload: inss
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
                                                status: 404,
                                                message: "No Record Found."
                                            });
                                        }
                                    });
                                }

                            }

                        });


                    } else {
                        conn.release();
                        console.log("Connection released.");
                        return res.format({
                            json: function () {
                                res.send({
                                    status: 404,
                                    message: "Details not found."
                                });
                            }
                        });
                    }
                }
            });
        }
    });


});



router.post('/updateUserProfile1', function (req, res) {
    var form = new multiparty.Form();
    form.parse(req, function (err, fields, files) {
        console.log(fields)
        console.log(files)
    });
})
module.exports = router;
