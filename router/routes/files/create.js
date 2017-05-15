const validator = require('../../../config').validator;
const messages = require('../../../config').messages;
const dbConnection = require('../../../util/db-connection');
const idGenerator = require('../../../util/id-generator');

module.exports = (req, res, next) => {
    let file = req.body.directory;
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
    dir.created_by = req._user.id;

};