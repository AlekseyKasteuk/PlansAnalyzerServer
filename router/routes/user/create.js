const crypto = require('../../../util/crypto');
const idGenerator = require('../../../util/id-generator');
const dbConnection = require('../../../util/db-connection');
const messages = require('../../../config').messages;
const validator = require('../../../config').validator;

module.exports = (req, res, next) => {

    const query = "INSERT INTO user (id, username, password, email, team_id, role) VALUES (?, ?, ?, ?, ?, ?)";
    const reqUser = req.body.user;
    console.log(reqUser);

    if (!reqUser || !reqUser.username || !reqUser.password || !reqUser.email ||
        !validator('USERNAME', reqUser.username) || !validator('PASSWORD', reqUser.password) || !validator('EMAIL', reqUser.email) ||
        (req.url !== '/team/create' && (!req._user || req._user.role !== 'admin'))
    ) {
        if (req._team && req.url === '/team/create') {
            dbConnection.rollback((err) => {});
        }
        return next({ status: 400, message: 'Invalid user data' });
    }

    const user = {
        id: idGenerator(20),
        username: reqUser.username,
        password: crypto(reqUser.password),
        email: reqUser.email,
        team_id: req._team && req.url === '/team/create' ? req._team.id : req._user.team_id,
        role: req._team && req.url === '/team/create' ? 'admin' : reqUser.role || 'customer'
    };

    dbConnection.query(query, [user.id, user.username, user.password, user.email, user.team_id, user.role], (err) => {
        if (!!err) {
            if (req.url === '/team/create') {
                dbConnection.rollback((err) => {
                    console.error('ROLLBACK ERROR:', err);
                });
            }
            return next({ status: 400, message: messages.error.dbQueryError, error: err });
        }
        delete user.password;
        if (req.url === '/team/create') {
            dbConnection.commit((err) => {
                if (!!err) {
                    dbConnection.rollback((err) => {
                        console.error('ROLLBACK ERROR:', err);
                        return next({ status: 400, message: messages.error.dbQueryError, error: err });
                    });
                } else {
                    next({ status: 200, data: { user: user, team: req._team } });
                }
            });
        } else {
            next({ status: 200, data: user });
        }
    });

};