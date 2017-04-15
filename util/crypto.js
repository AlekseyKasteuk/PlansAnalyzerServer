/**
 * Created by alexeykastyuk on 7/17/16.
 */
var crypto = require('crypto-js/md5');

module.exports = function (string) {
    return crypto(string).toString();
};