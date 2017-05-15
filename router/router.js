/**
 * Created by alexeykastyuk on 7/16/16.
 */
const router = require('express').Router();

var responseHandler = require('../middlewares/response-handler');

const teamModule = require('./routes/team');
const userModule = require('./routes/user');
const siteModule = require('./routes/site');
const dirModule = require('./routes/directory');
const authorizationCheck = require('../middlewares/authorization-middleware');

router.use(authorizationCheck);

router.post('/team/available', teamModule.isExist);
router.post('/team/create', teamModule.isExist, teamModule.create, userModule.create);

router.post('/user/login', teamModule.isExist, userModule.login);
router.post('/user/create', teamModule.isExist, userModule.create);
router.get('/user/check', userModule.check);

router.post('/site', siteModule.create, dirModule.create);
router.get('/sites', siteModule.getList);
router.delete('/site', siteModule.remove);


router.post('/directory', dirModule.create);
router.get('/directory', dirModule.get);
router.delete('/directory', dirModule.remove);

router.use(responseHandler);

module.exports = router;