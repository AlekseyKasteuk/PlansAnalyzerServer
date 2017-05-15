/**
 * Created by alexeykastyuk on 7/16/16.
 */
const dbConnection = require('./../util/db-connection');
const messages = require('../config').messages;
const secret = require('../config').database.secret;
const crypto = require('./../util/crypto');
const jwt = require('jsonwebtoken');

const unauthorizedPaths = new RegExp([
    '^/team/create$',
    '^/team/available$',
    '^/user/login$',
    '^/img/'
].map(v => '(' + v + ')').join('|'));

module.exports = (req, res, next) => {

    const token = req.body.authorization || req.headers.authorization || req.params.authorization;

    if (unauthorizedPaths.test(req.url)) {
        return next();
    }

    if (!token) {

        return next({status: 401, message: messages.error.authorizationFailed});
    }

    jwt.verify(token, secret, (err, user) => {

        const query = ` SELECT
                            user.id as id, user.username as username, user.email as email, user.role as role,
                            team.id as team_id, team.name as team_name
                        FROM user
                        INNER JOIN team ON team.id = user.team_id
                        WHERE user.email = ? AND user.password = ? AND user.id = ? LIMIT 1`;

        dbConnection.query(query, [
            user.email,
            crypto(user.password),
            user.id
        ], (err, user) => {

            if (!!err) {
                return next({status: 500, message: messages.error.dbQueryError, error: err});
            }
            if (!user.length) {
                return next({status: 404, message: messages.error.authorizationFailed});
            }
            req._user = user[0];
            next();

        });
    });

};