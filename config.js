module.exports.database = {
    host: 'localhost',
    user: 'root',
    password: 'admin',
    database: 'plans_analyzer',
    multipleStatements: true,
    secret: 'plans_analyzer'
};

module.exports.server = {
	port: 8866
};

module.exports.messages = {
    error: {
        authorizationFailed: 'Authorization: Username or password is wrong.',
        dbConnectionError: 'DB: Connection error.',
        dbError: 'DB: Something went wrong.',
        dbQueryError: 'DB: Database query error.',
        tokenCreationError: 'Authorization: Authorization error.',
        validationError: 'Validation: Validation error.'
    },
    success: {
        userCreation: 'User creation: User was successfully created.'
    }
};

const regexrs = {
    EMAIL: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    PASSWORD: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z!_\?\.;:'"]{8,64}$/,
    TEAM_NAME: /^[a-zA-Z0-9][a-zA-Z0-9\._ \$#&'"]{0,79}$/,
    USERNAME: /^[a-zA-Z0-9][a-zA-Z0-9\._]{0,79}$/,
    SITE_NAME: /^[a-zA-Z0-9][a-zA-Z0-9\. ]{0,79}$/,
    DIRECTORY_NAME: /^.{1,30}$/
};

module.exports.validator = (type, value) => {
    const regex = regexrs[type];
    const result = regex ? regex.test(value) : false;
    if (!result) {
        console.error('VALIDATION ERROR:', type, value);
    }
    return result;
};
