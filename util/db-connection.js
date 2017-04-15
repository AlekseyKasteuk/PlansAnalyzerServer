/**
 * Created by alexeykastyuk on 7/17/16.
 */
var mysql = require('mysql');
var config = require('../config').database;
var messages = require('../config').messages;
var connection = mysql.createConnection(config);

connection.connect(function (err) {

    if (!!err) {
        throw new Error(messages.error.dbConnectionError);
    }

});

module.exports = connection;