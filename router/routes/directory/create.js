const validator = require('../../../config').validator;
const messages = require('../../../config').messages;
const dbConnection = require('../../../util/db-connection');
const idGenerator = require('../../../util/id-generator');

const getParentDirectorySiteId = (dir) => {
    return new Promise((resolve, reject) => {
        const query = "SELECT site_id FROM directory WHERE id = ? LIMIT 1";
        dbConnection.query(query, [dir.parent_directory_id], (err, dirs) => {
            if (!!err) {
                return reject({ status: 500, message: messages.error.dbError });
            }
            if (!dirs.length) {
                return reject({ status: 404, message: 'Such parent directory doesn\'t exist' });
            }
            dir.site_id = dirs[0].site_id;
            resolve(dir);
        });
    });
};

const createDirectory = (dir, site) => {
    return new Promise((resolve, reject) => {
        let query = "INSERT INTO directory (id, name, parent_directory_id, site_id, is_root) VALUES (?, ?, ?, ?, ?)";
        dbConnection.query(query, [dir.id, dir.name, dir.parent_directory_id, dir.site_id, !!site], (err, results) => {
            if (!!err) {
                if (site) {
                    dbConnection.rollback((err) => {
                        console.error('ROLLBACK ERROR:', err);
                    });
                }
                return resolve({ status: 400, message: messages.error.dbQueryError, error: err });
            }
            if (site) {
                dbConnection.commit((err) => {
                    if (!!err) {
                        console.error('COMMIT ERROR:', err);
                        dbConnection.rollback((err) => {
                            console.error('ROLLBACK ERROR:', err);
                        });
                        return resolve({ status: 500, message: messages.error.dbError, error: err });
                    }
                    return resolve({ status: 200, data: site });
                });
            } else {
                return resolve({ status: 200, data: dir });
            }
        });
    });
};

module.exports = (req, res, next) => {
    if (req._site) {
        req.body.directory = {
            name: req._site.name
        };
    }
    let dir = req.body.directory;
    const error = (!dir.name && 'Fill in directory name') || (!validator('DIRECTORY_NAME', dir.name)) ||
        (!req._site && !dir.parent_directory_id && 'No parent directory');
    if (error) {
        if (req._site) {
            dbConnection.rollback((err) => {
                console.error('ROLLBACK ERROR:', err);
            });
        }
        return next({ status: 400, message: error });
    }
    dir.id = idGenerator(20);
    if (!req._site) {
        getParentDirectorySiteId(dir).then((dir) => {
            createDirectory(dir).then((data) => {
                next(data);
            });
        }, (data) => {
            next(data);
        });
    } else {
        dir.site_id = req._site.id;
        createDirectory(dir, req._site).then((data) => {
            next(data);
        }, (data) => {
            next(data);
        });
    }
};