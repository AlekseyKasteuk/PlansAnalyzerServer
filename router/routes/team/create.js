const crypto = require('../../../util/crypto');
const idGenerator = require('../../../util/id-generator');
const dbConnection = require('../../../util/db-connection');
const validator = require('../../../config').validator;
const messages = require('../../../config').messages;

module.exports = (req, res, next) => {

    if (!req.body.team || !req.body.team.name || !validator('TEAM_NAME', req.body.team.name)) {
        return next({ status: 400, message: 'Invalid team name' });
    }

    dbConnection.beginTransaction((err) => {

        if (!!err) {
            dbConnection.rollback((err) => {
                console.error('ROLLBACK ERROR:', err);
            });
            return next({ status: 400, message: messages.error.dbError, error: err });
        }

        const query = "INSERT INTO team (id, name) VALUES (?, ?)";
        const team = {
            id: idGenerator(20),
            name: req.body.team.name
        };
        dbConnection.query(query, [team.id, team.name], (err) => {
            if (!!err) {
                dbConnection.rollback((err) => {
                    console.error('ROLLBACK ERROR:', err);
                });
                return next({ status: 400, message: messages.error.dbQueryError, error: err });
            }
            req._team = team;
            next();
        });
    });
};
