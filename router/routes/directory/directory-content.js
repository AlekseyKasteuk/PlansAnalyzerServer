const dbConnection = require('../../../util/db-connection');
const messages = require('../../../config').messages;

const getDirectoryItems = (directory, req, res, next) => {
    const query =
    `SELECT
        directory.id, directory.name, directory.parent_directory_id as parent_directory,
        directory.created_date, 'directory' as 'type', '/img/default/directory_icon.png' as thumbnail,
        user.username as 'created_by_username', user.email as 'created_by_email'
    FROM directory
    INNER JOIN user ON user.id = directory.created_by
    INNER JOIN site ON site.id = directory.site_id
    WHERE directory.parent_directory_id = ?
    UNION
    SELECT
        file.id, file.name, file.directory_id as parent_directory, file.created_date, file.type, file.thumbnail,
        user.username as 'created_by_username', user.email as 'created_by_email'
    FROM file
    INNER JOIN user ON user.id = file.created_by_id
    INNER JOIN site ON site.id = file.site_id
    WHERE file.directory_id = ?`;
    dbConnection.query(query, [directory.id, directory.id], (err, filesAndDirectories) => {
        if (!!err) {
            return next({ status: 500, message: messages.error.dbError, error: err });
        }
        filesAndDirectories.sort((elem1, elem2) => {
            if (elem1.type === 'directory') {
                if (elem2.type === 'directory') {
                    return elem1.name > elem2.name ? 1 : elem1.name === elem2.name ? 0 : -1;
                } else {
                    return -1;
                }
            } else if (elem2.type === 'directory') {
                return 1
            } else {
                return elem1.name > elem2.name ? 1 : elem1.name === elem2.name ? 0 : -1;
            }
        });
        return next({ status: 200, data: {
            directory,
            items: filesAndDirectories
        } });
    });
};

const getDirectoryInfo = (req, res, next) => {
    let whereState = {};

    if (!req.query.directory && !req.query.site) {
        return next({ status: 400, message: 'Invalid request' });
    } else if (req.query.directory) {
        whereState.sql = 'user.team_id = ? AND directory.id = ?';
        whereState.data = [req._user.team_id, req.query.directory];
    } else {
        whereState.sql = 'user.team_id = ? AND site.id = ? AND directory.is_root = 1';
        whereState.data = [req._user.team_id, req.query.site];
    }
    const query =
    `SELECT
        directory.id, directory.name, directory.parent_directory_id as parent_directory,
        directory.created_date, 'directory' as 'type', '/img/default/directory_icon.png' as thumbnail,
        user.username as 'created_by_username', user.email as 'created_by_email'
    FROM directory
    INNER JOIN user ON user.id = directory.created_by
    INNER JOIN site ON site.id = directory.site_id
    WHERE ${whereState.sql} LIMIT 1`;
    dbConnection.query(query, whereState.data, (err, directory) => {
        if (!!err) {
            return next({ status: 500, message: messages.error.dbError, error: err });
        }
        if (!directory.length) {
            return next({ status: 404, message: 'There is no such directory' });
        }
        if (!req.query.directory) {
            directory[0].name = '';
        }
        getDirectoryItems(directory[0], req, res, next);
    });
};

module.exports = (req, res, next) => {
    getDirectoryInfo(req, res, next);
};