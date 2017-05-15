const validator = require('../../../config').validator;
const dbConnection = require('../../../util/db-connection');
const messages = require('../../../config').messages;
const idGenerator = require('../../../util/id-generator');

module.exports = (req, res, next) => {
    let site = req.body.site;
    const error = (!site && 'Invalid input') ||
        (!site.name && 'Empty site name') || (!validator('SITE_NAME', site.name) && 'Invalid site name') ||
        ((!site.address.country || !site.address.city || !site.address.street || !site.address.number) && 'Fill in all address fields');
    if (error) {
        return next({ status: 400, message: error });
    }
    dbConnection.beginTransaction((err) => {
        if (err) {
            dbConnection.rollback((err) => {
                console.error('ROLLBACK ERROR:', err);
            });
            return next({ status: 400, message: messages.error.dbError, error: err });
        }
        site.id = idGenerator(20);
        let query = "INSERT INTO site (id, name, description, image, creator_id) VALUES (?, ?, ?, ?, ?)";
        dbConnection.query(query, [site.id, site.name, site.description, site.image, req._user.id], (err) => {
            if (!!err) {
                return next({ status: 400, message: messages.error.dbQueryError, error: err });
            }
            query = "INSERT INTO address (country, city, street, number, site_id) VALUES (?, ?, ?, ?, ?)";
            dbConnection.query(query, [site.address.country, site.address.city, site.address.street, site.address.number, site.id], (err) => {
                if (!!err) {
                    return next({ status: 400, message: messages.error.dbQueryError, error: err });
                }
                req._site = site;
                if (!site.image) {
                    site.image = '/img/default/default_building.jpg';
                }
                return next();
            });
        });
    });
};