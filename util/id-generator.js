/**
 * Created by alexeykastyuk on 7/17/16.
 */
var uid = require('rand-token').uid;

module.exports = function (charactersCount) {
    charactersCount = charactersCount || 20;
    return uid(charactersCount);
};
