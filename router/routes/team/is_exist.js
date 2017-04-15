var dbConnection = require('../../../util/db-connection');
const messages = require('../../../config').messages;

const urlsForDenyExistingTeams = [
    '/team/create'
];

module.exports = (req, res, next) => {
    console.log(req.body.team);
    if (!req.body.team.name && !req.body.team.id) {
        return next({ status: 400, message: 'Team data is empty' });
    }

    const query = "SELECT id, name FROM team WHERE (name = ? OR id = ?) LIMIT 1";

    dbConnection.query(query, [req.body.team.name, req.body.team.id], (err, teams) => {
        console.log('TEAMS', teams);
        if (!!err) {
            return next({status: 500, message: messages.error.dbQueryError, error: err});
        }
        req._team = teams[0];
        req.url === '/team/available'
            ? next({status: 200, data: req._team })
            : urlsForDenyExistingTeams.indexOf(req.url) !== -1
                ? req._team
                    ? next({status: 400, message: 'There is a team with such name'})
                    : next()
                : req._team
                    ? next()
                    : next({status: 404, message: 'There is no team with such name'});
    });

};