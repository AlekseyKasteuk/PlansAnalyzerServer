const dbConnection = require('../../../util/db-connection');
const messages = require('../../../config').messages;

module.exports = (req, res, next) => {
    const query =
        `SELECT site.id, site.name, site.description, site.image,
            address.country as 'address_country', address.city as 'address_city', address.street as 'address_street',
            address.number as 'address_number', user.username as 'creator_username', user.email as 'creator_email',
            files._count as 'files_count'
        FROM site
        LEFT JOIN address ON site.id = address.site_id
        INNER JOIN user ON user.id = site.creator_id
        LEFT JOIN (
                SELECT site_id, COUNT(id) as _count
                FROM file
                GROUP BY site_id
            ) files ON files.site_id = site.id
        WHERE user.team_id = ?
        ORDER BY site.name`;
    dbConnection.query(query, [req._user.team_id], (err, sites) => {
        if (!!err) {
            return next({ status: 500, message: messages.error.dbError, error: err });
        }
        return next({ status: 200, data: sites.map((site) => {
            if (!site.image) {
                site.image = '/img/default/default_building.jpg';
            }
            if (!site.files_count) {
                site.files_count = 0;
            }
            return site;
        }) });
    });
};