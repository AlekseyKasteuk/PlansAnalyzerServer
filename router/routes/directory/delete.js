const dbConnection = require('../../../util/db-connection');
const messages = require('../../../config').messages;

module.exports = (req, res, next) => {
    if (!req.query.id) {
        return next({ status: 400, message: 'Directory ID is empty' });
    }
    let query = `SELECT directory.id, directory.name
                FROM directory
                INNER JOIN site ON site.id = directory.site_id
                INNER JOIN user ON user.id = site.creator_id
                WHERE directory.id = ? AND user.team_id = ? LIMIT 1`;
    dbConnection.query(query, [req.query.id, req._user.team_id], (err, dirs) => {
        if (!!err) {
            return next({ status: 500, message: messages.error.dbError, error: err });
        }
        if (!dirs.length) {
            return next({ status: 404, message: 'Directory with such ID wasn\'t found' });
        }
        query = `DELETE FROM directory WHERE id = ?`;
        dbConnection.query(query, [req.query.id], (err, result) => {
            if (!!err) {
                return next({ status: 500, message: messages.error.dbError, error: err });
            }
            return next({ status: 200, message: 'Directory was successfully removed' });
        });
    });
};