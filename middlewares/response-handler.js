module.exports = function (params, req, res, next) {
    console.log('RESPONSE HANDLER:', params);
    params = params || {status: 500, message: 'Internal server error'};
    params.status = params.status || 500;
    if (req._user) {
        req._user = {
            user: {
                id: req._user.id,
                username: req._user.username,
                email: req._user.username,
                role: req._user.username
            },
            team: {
                id: req._user.team_id,
                name: req._user.team_name
            }
        };
        params.user = req._user;
    }
    res.status(params.status).send(params);
};
