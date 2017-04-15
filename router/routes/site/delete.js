const dbConnection = require('../../../util/db-connection');
const messages = require('../../../config').messages;

module.exports = (req, res, next) => {
    if (!req.query.id) {
        return next({ status: 400, message: 'Site ID is empty' });
    }
    if (req._user.role !== 'admin') {
        return next({ status: 403, message: 'You can\'t delete sites' });
    }
    let query = `SELECT site.id, site.name FROM site INNER JOIN user ON user.id = site.creator_id WHERE site.id = ? AND user.team_id = ? LIMIT 1`;
    dbConnection.query(query, [req.query.id, req._user.team_id], (err, sites) => {
        if (!!err) {
            return next({ status: 500, message: messages.error.dbError, error: err });
        }
        if (!sites.length) {
            return next({ status: 404, message: 'Site with such ID wasn\'t found' });
        }
        query = `DELETE FROM site WHERE id = ?`;
        dbConnection.query(query, [req.query.id], (err, result) => {
            if (!!err) {
                return next({ status: 500, message: messages.error.dbError, error: err });
            }
            return next({ status: 200, message: 'Site was successfully removed' });
        });
    });
};