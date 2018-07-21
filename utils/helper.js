/**
 * Created by crom on 2/16/2016.
 */

/*
 * @name:    Validate email
 * @param {string} email address
 * @returns {boolean} true|false
 * @author: mmubasher
 */
function ValidateEmail(email) {
    this.email = email;
}
ValidateEmail.prototype.validate = function() {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(this.email);
};

function GetFullURL(req) {
    //this.req = req;
    return req.protocol + '://' + req.get('host') + req.originalUrl;
}

/*GetFullURL.prototype.getFullURL = function() {
    return this.req.protocol + '://' + this.req.get('host') + this.req.originalUrl;
};*/

module.exports.ValidateEmail = ValidateEmail;
module.exports.GetFullURL = GetFullURL;