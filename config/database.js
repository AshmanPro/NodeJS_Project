/**
 * Created with JetBrains WebStorm.
 * User: Sulaiman
 * Date: 1/16/15
 * Time: 12:25 AM
 * To change this template use File | Settings | File Templates.
 */

var configFile = require('./configuration');
var cnquerDBMySQL = require('mysql');
var pool = cnquerDBMySQL.createPool({
    host: configFile.host,
    user: configFile.user,
    password: configFile.password,
    database: configFile.database,
    connectionLimit: 10,
    multipleStatements: true
});
var getConnection = function (cb) {
    pool.getConnection(function (err, connection) {
        console.log("Connection pool created");
        if (err) {
            return cb(err);
        }
        cb(null, connection);
    });
};
module.exports.pool = getConnection;