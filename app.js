/**
 * Created by alexeykastyuk on 7/14/16.
 */
const express = require('express');
const serverConfigs = require('./config').server;
const app = express();
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const router = require('./router/router');

app.use(morgan('dev'));

app.use(cookieParser());

app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

app.use(express.static('assets'));

var server = app.listen(serverConfigs.port, (err) => {
	console.log("Server run on port:", serverConfigs.port);
});

app.all('*', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'OPTIONS,GET,POST,PUT,DELETE');
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    next();
});


app.use('/', router);
