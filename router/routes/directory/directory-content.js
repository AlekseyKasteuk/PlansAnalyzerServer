const dbConnection = require('../../../util/db-connection');
const messages = require('../../../config').messages;

module.exports = (req, res, next) => {
    const query = `SELECT site.id, site.name, site.description, site.image,
        address.country as 'address_country', address.city as 'address_city', address.street as 'address_street',
        address.number as 'address_number', user.username as 'creator_username', user.email as 'creator_email'
    FROM site
    LEFT JOIN address ON site.id = address.site_id
    INNER JOIN user ON user.id = site.creator_id
    WHERE user.team_id = ?`;
    dbConnection.query(query, [req._user.team_id], (err, sites) => {
        if (!!err) {
            return next({ status: 500, message: messages.error.dbError, error: err });
        }
        return next({ status: 200, data: sites });
    });
};