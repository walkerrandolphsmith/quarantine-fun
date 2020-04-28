const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session);
const { nodeENV, sessionSecret, databaseConnectionString } = require('../environment');
const { log } = require('./log.service');

exports.configureSessionStorage = function(app) {
    const store = new MongoDBStore({
        uri: databaseConnectionString,
        collection: 'mySessions'
    });
    
    store.on('error', log);

    app.set('trust proxy', 1)
    return require('express-session')({
        secret: sessionSecret,
        cookie: {
          maxAge: 1000 * 60 * 60 * 24 * 7
        },
        store,
        resave: true,
        saveUninitialized: true,
        secure: nodeENV === 'production'
    });
}