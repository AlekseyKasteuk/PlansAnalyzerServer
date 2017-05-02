const crypto = require('../../../util/crypto');
const dbConnection = require('../../../util/db-connection');
const messages = require('../../../config').messages;
const validator = require('../../../config').validator;
const createToken = require('../../../util/create-token');

module.exports = (req, res, next) => {
    const user = req.body.user;
    const team = req.body.team;
    const error =   (!user.email && 'Fill in username') ||
        (!user.password && 'Fill in password') ||
        (!validator('EMAIL', user.email) && 'Invalid user') ||
        (!validator('PASSWORD', user.password) && 'Invalid password');
    if (error) {
        return next({ status: 400, message: error });
    }
    const query = ` SELECT
                        user.id as id, user.username as username, user.email as email, user.role as role,
                        team.id as team_id, team.name as team_name
                    FROM user
                    INNER JOIN team ON team.id = user.team_id
                    WHERE user.email = ? AND user.password = ? AND team.id = ? LIMIT 1`;

    dbConnection.query(query, [
        user.email,
        crypto(user.password),
        team.id
    ], (err, user) => {

        if (!!err) {
            return next({status: 500, message: messages.error.dbQueryError, error: err});
        }
        if (!user.length) {
            return next({status: 404, message: messages.error.authorizationFailed});
        }
        user[0].password = req.body.user.password;
        next({ status: 200, data: createToken(user[0]), user: {
            team: {
                id: user[0].team_id,
                name: user[0].team_name
            },
            user: {
                id: user[0].id,
                username: user[0].username,
                email: user[0].email,
                role: user[0].role
            }
        }});

    });
};