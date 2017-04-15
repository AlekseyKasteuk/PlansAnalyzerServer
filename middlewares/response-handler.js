module.exports = function (params, req, res, next) {
    console.log('RESPONSE HANDLER:', params);
    params = params || { status: 500, message: 'Internal server error' }
    params.status = params.status || 200;
    res.status(params.status).send(params);
};
